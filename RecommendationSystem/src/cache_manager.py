import threading
import time
import torch
import pickle
import pandas as pd
from datetime import datetime, timedelta
from typing import Tuple, List,Optional
import logging
from pathlib import Path
import os
from sentence_transformers import util
import fcntl

from src.clean_data import combine_fields
from src.embed_with_sbert import append_embedding, remove_embeddings
from dotenv import load_dotenv
from sqlalchemy import create_engine
from urllib.parse import quote_plus

load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class RecipeCache:
    def __init__(self, cache_duration_minutes: Optional[int] = None):
        # Mặc định 1 ngày; cho phép override qua  ENV
        minutes = cache_duration_minutes if cache_duration_minutes is not None \
            else int(os.getenv("CACHE_DURATION_MINUTES", "1440"))
        self._cache_duration = timedelta(minutes=minutes)
        self._last_reload = None
        self._recipe_ids = None
        self._embeddings = None
        self._lock = threading.RLock()
        self._reload_timer = None
        self._is_loading = False

        # Leader election state
        self._is_leader = False
        self._lockfile_fd = None
        self._lockfile_path = "/tmp/letmecook_scheduler.lock"

        # Ensure model directory exists
        Path("model").mkdir(exist_ok=True)

        # Initial load
        self._load_cache()

    def _load_from_disk(self) -> Tuple[List[str], torch.Tensor]:
        """Load embeddings and recipe IDs from disk"""
        try:
            embeddings = torch.load("model/recipe_embeddings.pt", map_location="cpu")
            with open("model/recipe_ids.pkl", "rb") as f:
                recipe_ids = pickle.load(f)
            return recipe_ids, embeddings
        except FileNotFoundError:
            logger.warning("Cache files not found, returning empty cache")
            return [], torch.empty(0)
        except Exception as e:
            logger.error(f"Error loading cache from disk: {e}")
            return [], torch.empty(0)

    def _rebuild_embeddings(self):
        """Rebuild embeddings from database"""
        try:
            logger.info("🔄 Starting embedding rebuild...")

            # Import here to avoid circular imports
            from src.pipeline import run_pipeline

            # Run the full pipeline
            run_pipeline()

            logger.info("✅ Embedding rebuild completed")

        except Exception as e:
            logger.error(f"❌ Error rebuilding embeddings: {e}")
            raise

    def _load_cache(self):
        """Load cache with thread safety"""
        with self._lock:
            if self._is_loading:
                return

            self._is_loading = True
            try:
                # Try to load from disk first
                recipe_ids, embeddings = self._load_from_disk()

                # If cache is empty or doesn't exist, rebuild
                if len(recipe_ids) == 0:
                    logger.info("Cache is empty, rebuilding...")
                    self._rebuild_embeddings()
                    recipe_ids, embeddings = self._load_from_disk()

                self._recipe_ids = recipe_ids
                self._embeddings = embeddings
                self._last_reload = datetime.now()

                logger.info(f"✅ Cache loaded: {len(recipe_ids)} recipes")

                if self._become_leader():
                    logger.info("🧭 This worker is SCHEDULER LEADER. Scheduling auto-reload.")
                    self._schedule_reload()
                else:
                    logger.info("🧭 Not leader; skip auto-reload scheduling in this worker.")

            finally:
                self._is_loading = False

    def _schedule_reload(self):
        """Schedule automatic cache reload"""
        if self._reload_timer:
            self._reload_timer.cancel()

        def reload_task():
            logger.info("🔄 Auto-reloading cache...")
            try:
                self._rebuild_embeddings()
                self._load_cache()
            except Exception as e:
                logger.error(f"❌ Auto-reload failed: {e}")

        self._reload_timer = threading.Timer(
            self._cache_duration.total_seconds(),
            reload_task
        )
        self._reload_timer.daemon = True
        self._reload_timer.start()

        next_reload = datetime.now() + self._cache_duration
        logger.info(f"⏰ Next auto-reload scheduled at: {next_reload.strftime('%Y-%m-%d %H:%M:%S')}")

    def _become_leader(self) -> bool:
        """Elect a single scheduler leader across Gunicorn workers via file lock."""
        if self._is_leader:
            return True
        try:
            fd = os.open(self._lockfile_path, os.O_CREAT | os.O_RDWR, 0o644)
            fcntl.flock(fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
            os.ftruncate(fd, 0)
            os.write(fd, str(os.getpid()).encode())
            os.fsync(fd)
            self._lockfile_fd = fd
            self._is_leader = True
            return True
        except OSError:
            # another worker already holds the lock
            if self._lockfile_fd is not None:
                try:
                    os.close(self._lockfile_fd)
                except Exception:
                    pass
                self._lockfile_fd = None
            return False

    def get_data(self) -> Tuple[List[str], torch.Tensor]:
        """Get cached data with thread safety"""
        with self._lock:
            # Return copy to prevent external modification
            return self._recipe_ids.copy(), self._embeddings.clone()

    def is_cache_valid(self) -> bool:
        """Check if cache is still valid"""
        if self._last_reload is None:
            return False
        return datetime.now() - self._last_reload < self._cache_duration

    def force_reload(self):
        """Force cache reload"""
        logger.info("🔄 Force reloading cache...")

        # Cancel scheduled reload
        if self._reload_timer:
            self._reload_timer.cancel()

        # Reload in background
        def reload_task():
            try:
                self._rebuild_embeddings()
                self._load_cache()
            except Exception as e:
                logger.error(f"❌ Force reload failed: {e}")

        thread = threading.Thread(target=reload_task)
        thread.daemon = True
        thread.start()

    def add_recipe_to_cache(self, recipe_id: str):
        """Add new recipe to cache without full reload"""
        with self._lock:
            if recipe_id in self._recipe_ids:
                logger.info(f"Recipe {recipe_id} already in cache")
                return

            try:
                # Get recipe data from database
                user = os.getenv("SUPABASE_USER")
                password = quote_plus(os.getenv("SUPABASE_PASSWORD", ""))
                host = os.getenv("SUPABASE_HOST")
                port = os.getenv("SUPABASE_PORT")
                db = os.getenv("SUPABASE_DB")

                url = f'postgresql+pg8000://{user}:{password}@{host}:{port}/{db}'
                engine = create_engine(url)

                query = f"""
                    SELECT r.id, r.title, r.description, r.directions,
                        STRING_AGG(DISTINCT cu.name, ', ') AS cuisines,
                        STRING_AGG(DISTINCT ing.name, ', ') AS ingredients,
                        STRING_AGG(DISTINCT d_pref.name, ', ') AS dietary_pref
                    FROM recipe r
                    LEFT JOIN recipe_cuisines re_cu ON r.id = re_cu.recipe_id
                    LEFT JOIN cuisines cu ON re_cu.cuisine_id = cu.id
                    LEFT JOIN recipe_ingredients re_in ON r.id = re_in.recipe_id
                    LEFT JOIN ingredients ing ON re_in.ingredient_id = ing.id
                    LEFT JOIN recipe_dietary_pref re_pref ON r.id = re_pref.recipe_id
                    LEFT JOIN dietary_pref d_pref ON re_pref.preference_id = d_pref.id
                    WHERE r.id = '{recipe_id}'
                    GROUP BY r.id, r.title, r.description, r.directions
                """

                df = pd.read_sql(query, engine)
                if df.empty:
                    raise ValueError(f"Recipe ID '{recipe_id}' not found in database")

                # Generate embedding and add to cache
                combined_text = combine_fields(df.iloc[0])
                new_embedding = append_embedding(recipe_id, combined_text)

                # Update in-memory cache
                self._recipe_ids.append(recipe_id)
                if self._embeddings.numel() == 0:
                    self._embeddings = new_embedding.unsqueeze(0)
                else:
                    self._embeddings = torch.cat([self._embeddings, new_embedding.unsqueeze(0)], dim=0)

                logger.info(f"✅ Added recipe {recipe_id} to cache")

            except Exception as e:
                logger.error(f"❌ Error adding recipe {recipe_id} to cache: {e}")
                raise

    def remove_recipes_from_cache(self, recipe_ids: List[str]):
        """Remove recipes from cache"""
        with self._lock:
            try:
                # Remove from disk
                remove_embeddings(recipe_ids)

                # Update in-memory cache
                removed_indices = []
                for i, rid in enumerate(self._recipe_ids):
                    if rid in recipe_ids:
                        removed_indices.append(i)

                # Remove from recipe_ids list
                for idx in reversed(removed_indices):
                    del self._recipe_ids[idx]

                # Remove from embeddings tensor
                if removed_indices:
                    keep_indices = [i for i in range(len(self._embeddings)) if i not in removed_indices]
                    if keep_indices:
                        self._embeddings = self._embeddings[keep_indices]
                    else:
                        self._embeddings = torch.empty(0)

                logger.info(f"✅ Removed {len(recipe_ids)} recipes from cache")

            except Exception as e:
                logger.error(f"❌ Error removing recipes from cache: {e}")
                raise

    def get_cache_info(self) -> dict:
        """Get cache information"""
        with self._lock:
            return {
                "recipe_count": len(self._recipe_ids) if self._recipe_ids else 0,
                "last_reload": self._last_reload.isoformat() if self._last_reload else None,
                "is_valid": self.is_cache_valid(),
                "next_reload": (self._last_reload + self._cache_duration).isoformat() if self._last_reload else None,
                "cache_duration_minutes": self._cache_duration.total_seconds() / 60
            }

    def shutdown(self):
        """Clean shutdown of cache manager"""
        if self._reload_timer:
            self._reload_timer.cancel()
        # Release leader lock if held
        if self._is_leader and self._lockfile_fd is not None:
            try:
                fcntl.flock(self._lockfile_fd, fcntl.LOCK_UN)
            except Exception:
                pass
            try:
                os.close(self._lockfile_fd)
            except Exception:
                pass
            self._lockfile_fd = None
            self._is_leader = False
        logger.info("🛑 Cache manager shutdown")


# Global cache instance
_cache_instance = None
_cache_lock = threading.Lock()


def get_cache() -> RecipeCache:
    """Get global cache instance (singleton pattern)"""
    global _cache_instance

    if _cache_instance is None:
        with _cache_lock:
            if _cache_instance is None:
                _cache_instance = RecipeCache()

    return _cache_instance


def shutdown_cache():
    """Shutdown global cache instance"""
    global _cache_instance

    if _cache_instance:
        _cache_instance.shutdown()
        _cache_instance = None
