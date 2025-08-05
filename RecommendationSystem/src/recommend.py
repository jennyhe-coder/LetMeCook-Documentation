# src/recommend.py (Updated version)
import torch
from sentence_transformers import util
from typing import List, Tuple
import logging

from src.cache_manager import get_cache

logger = logging.getLogger(__name__)


def recommend_by_id(target_id: str, top_k: int = 10) -> List[Tuple[str, float]]:
    """
    Recommend recipes based on a target recipe ID using cached embeddings

    Args:
        target_id: Target recipe ID
        top_k: Number of recommendations to return

    Returns:
        List of (recipe_id, similarity_score) tuples
    """
    cache = get_cache()

    try:
        recipe_ids, embeddings = cache.get_data()

        # Check if target recipe exists in cache
        if target_id not in recipe_ids:
            logger.info(f"Recipe {target_id} not in cache, adding...")
            cache.add_recipe_to_cache(target_id)
            recipe_ids, embeddings = cache.get_data()

        # Find target recipe index
        try:
            idx = recipe_ids.index(target_id)
        except ValueError:
            raise ValueError(f"Recipe ID '{target_id}' not found after cache update")

        # Get target vector and compute similarities
        target_vector = embeddings[idx].to("cpu")
        similarities = util.cos_sim(target_vector, embeddings)[0]

        # Get top results (excluding the target recipe itself)
        top_results = torch.topk(similarities, k=min(top_k + 1, len(similarities)))

        recommendations = []
        for score, i in zip(top_results.values, top_results.indices):
            rec_id = recipe_ids[i]
            if rec_id != target_id:  # Exclude the target recipe
                recommendations.append((rec_id, float(score)))

            if len(recommendations) >= top_k:
                break

        logger.info(f"Generated {len(recommendations)} recommendations for recipe {target_id}")
        return recommendations

    except Exception as e:
        logger.error(f"Error in recommend_by_id: {e}")
        raise


def recommend_for_user(
        fav_ids: List[str],
        hist_ids: List[str],
        fav_weight: float = 2.0,
        hist_weight: float = 1.0,
        top_k: int = 10
) -> List[Tuple[str, float]]:
    """
    Recommend recipes for a user based on favorites and history using cached embeddings

    Args:
        fav_ids: List of favorite recipe IDs
        hist_ids: List of recipe IDs from user history
        fav_weight: Weight for favorite recipes
        hist_weight: Weight for history recipes
        top_k: Number of recommendations to return

    Returns:
        List of (recipe_id, similarity_score) tuples
    """
    cache = get_cache()

    try:
        recipe_ids, embeddings = cache.get_data()

        # Ensure all user recipes are in cache
        missing_recipes = []
        for rid in fav_ids + hist_ids:
            if rid not in recipe_ids:
                missing_recipes.append(rid)

        if missing_recipes:
            logger.info(f"Adding {len(missing_recipes)} missing recipes to cache...")
            for rid in missing_recipes:
                try:
                    cache.add_recipe_to_cache(rid)
                except Exception as e:
                    logger.warning(f"Failed to add recipe {rid} to cache: {e}")
                    continue

            # Refresh data after adding missing recipes
            recipe_ids, embeddings = cache.get_data()

        # Collect vectors and weights for user profile
        vectors = []
        weights = []

        # Add favorite recipes
        for rid in fav_ids:
            if rid in recipe_ids:
                idx = recipe_ids.index(rid)
                vectors.append(embeddings[idx].to("cpu"))
                weights.append(fav_weight)

        # Add history recipes (excluding favorites to avoid double counting)
        for rid in hist_ids:
            if rid in recipe_ids and rid not in fav_ids:
                idx = recipe_ids.index(rid)
                vectors.append(embeddings[idx].to("cpu"))
                weights.append(hist_weight)

        if not vectors:
            logger.warning("No valid recipes found in user profile")
            return []

        # Create weighted user profile vector
        stacked = torch.stack(vectors).to("cpu")
        weight_tensor = torch.tensor(weights, dtype=torch.float32).unsqueeze(1).to("cpu")
        user_vector = torch.sum(stacked * weight_tensor, dim=0) / torch.sum(weight_tensor)

        # Compute similarities
        similarities = util.cos_sim(user_vector, embeddings)[0]

        # Get top results excluding user's existing recipes
        exclude_set = set(fav_ids + hist_ids)
        top_results = torch.topk(similarities, k=min(top_k + len(exclude_set) + 10, len(similarities)))

        recommendations = []
        for score, idx in zip(top_results.values, top_results.indices):
            rec_id = recipe_ids[idx]
            if rec_id not in exclude_set:
                recommendations.append((rec_id, float(score)))

            if len(recommendations) >= top_k:
                break

        logger.info(f"Generated {len(recommendations)} recommendations for user")
        return recommendations

    except Exception as e:
        logger.error(f"Error in recommend_for_user: {e}")
        raise


def get_recommendation_stats() -> dict:
    """Get statistics about the recommendation system"""
    cache = get_cache()

    try:
        cache_info = cache.get_cache_info()
        recipe_ids, embeddings = cache.get_data()

        return {
            "cache_info": cache_info,
            "embedding_shape": list(embeddings.shape) if embeddings.numel() > 0 else [0],
            "system_status": "healthy" if cache_info["is_valid"] else "cache_expired"
        }

    except Exception as e:
        logger.error(f"Error getting recommendation stats: {e}")
        return {
            "cache_info": {},
            "embedding_shape": [0],
            "system_status": "error",
            "error": str(e)
        }


# Legacy function for backward compatibility
def try_update_missing_embedding(recipe_id: str):
    """Legacy function - now handled by cache manager"""
    cache = get_cache()
    cache.add_recipe_to_cache(recipe_id)