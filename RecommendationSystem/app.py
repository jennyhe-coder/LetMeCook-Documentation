# app.py (Updated version with cache integration)
from flask import Flask, request, jsonify
import atexit
import logging
from multiprocessing import Process
import subprocess
import os
import signal
import sys

from src.recommend import recommend_by_id, recommend_for_user, get_recommendation_stats
from src.cache_manager import get_cache, shutdown_cache

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
STATUS_FILE = "pipeline_status.txt"

# Initialize cache on startup
logger.info("🚀 Initializing recipe recommendation cache...")
cache = get_cache()
logger.info("✅ Cache initialized successfully")


def cleanup():
    """Cleanup function for graceful shutdown"""
    logger.info("🛑 Shutting down application...")
    shutdown_cache()


# Register cleanup functions
atexit.register(cleanup)


def signal_handler(sig, frame):
    """Handle shutdown signals"""
    cleanup()
    sys.exit(0)


signal.signal(signal.SIGINT, signal_handler)
signal.signal(signal.SIGTERM, signal_handler)


def run_pipeline_background():
    """Run pipeline in background and update status"""
    try:
        with open(STATUS_FILE, "w") as f:
            f.write("⏳ Pipeline running...")

        logger.info("🔄 Starting background pipeline...")
        subprocess.run(["python", "src/pipeline.py"], check=True)

        with open(STATUS_FILE, "w") as f:
            f.write("✅ Pipeline finished successfully.")

        logger.info("✅ Background pipeline completed")

        # Force cache reload after pipeline completion
        cache.force_reload()

    except Exception as e:
        error_msg = f"❌ Pipeline failed: {str(e)}"
        with open(STATUS_FILE, "w") as f:
            f.write(error_msg)
        logger.error(error_msg)


@app.route("/", methods=["GET"])
def health_check():
    """Health check endpoint"""
    try:
        stats = get_recommendation_stats()
        return jsonify({
            "status": "healthy",
            "message": "Recipe Recommendation API is running",
            "cache_status": stats["system_status"],
            "cache_info": stats["cache_info"]
        }), 200
    except Exception as e:
        return jsonify({
            "status": "unhealthy",
            "error": str(e)
        }), 500


@app.route("/recommend/id", methods=["GET"])
def recommend_by_recipe():
    """Get recommendations based on a recipe ID"""
    recipe_id = request.args.get("recipeId")
    top_k = int(request.args.get("topK", 10))

    if not recipe_id:
        return jsonify({"error": "Missing recipeId parameter"}), 400

    if top_k <= 0 or top_k > 100:
        return jsonify({"error": "topK must be between 1 and 100"}), 400

    try:
        logger.info(f"Getting recommendations for recipe {recipe_id} (top_k={top_k})")
        results = recommend_by_id(recipe_id, top_k)

        return jsonify({
            "recommendations": results,
            "count": len(results),
            "recipe_id": recipe_id
        }), 200

    except ValueError as e:
        logger.warning(f"Recipe not found: {e}")
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        logger.error(f"Error in recommend_by_recipe: {e}")
        return jsonify({"error": "Internal server error"}), 500


@app.route("/recommend/user", methods=["GET"])
def recommend_for_user_route():
    """Get recommendations for a user based on favorites and history"""
    favorites = request.args.get("favorites", "")
    history = request.args.get("history", "")
    top_k = int(request.args.get("topK", 10))
    fav_weight = float(request.args.get("favWeight", 2.0))
    hist_weight = float(request.args.get("histWeight", 1.0))

    # Parse comma-separated IDs
    favorites = [f.strip() for f in favorites.split(",") if f.strip()]
    history = [h.strip() for h in history.split(",") if h.strip()]

    if not favorites and not history:
        return jsonify({"error": "Must provide either favorites or history"}), 400

    if top_k <= 0 or top_k > 100:
        return jsonify({"error": "topK must be between 1 and 100"}), 400

    try:
        logger.info(
            f"Getting user recommendations (favorites: {len(favorites)}, history: {len(history)}, top_k: {top_k})")
        results = recommend_for_user(favorites, history, fav_weight, hist_weight, top_k)

        return jsonify({
            "recommendations": results,
            "count": len(results),
            "user_profile": {
                "favorites": favorites,
                "history": history,
                "weights": {"favorites": fav_weight, "history": hist_weight}
            }
        }), 200

    except Exception as e:
        logger.error(f"Error in recommend_for_user: {e}")
        return jsonify({"error": "Internal server error"}), 500


@app.route("/cache/info", methods=["GET"])
def get_cache_info():
    """Get cache information and statistics"""
    try:
        stats = get_recommendation_stats()
        return jsonify(stats), 200
    except Exception as e:
        logger.error(f"Error getting cache info: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/cache/reload", methods=["POST"])
def force_cache_reload():
    """Force cache reload"""
    try:
        logger.info("🔄 Force reloading cache...")
        cache.force_reload()
        return jsonify({
            "status": "success",
            "message": "Cache reload initiated"
        }), 202
    except Exception as e:
        logger.error(f"Error forcing cache reload: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/pipeline/run", methods=["POST"])
def run_pipeline():
    """Run the full pipeline in background"""
    try:
        logger.info("🚀 Starting background pipeline...")
        p = Process(target=run_pipeline_background)
        p.start()
        return jsonify({
            "status": "success",
            "message": "⏳ Pipeline started in background"
        }), 202
    except Exception as e:
        logger.error(f"Failed to start pipeline: {e}")
        return jsonify({
            "error": "Failed to start pipeline",
            "details": str(e)
        }), 500


@app.route("/pipeline/status", methods=["GET"])
def check_pipeline_status():
    """Check pipeline status"""
    if not os.path.exists(STATUS_FILE):
        return jsonify({"status": "ℹ️ No pipeline started yet."}), 200

    try:
        with open(STATUS_FILE, "r") as f:
            content = f.read().strip()
        return jsonify({"status": content}), 200
    except Exception as e:
        return jsonify({"error": f"Failed to read status: {e}"}), 500


@app.route("/embedding/add", methods=["POST"])
def add_embedding():
    """Add embedding for a new recipe"""
    data = request.get_json()
    recipe_id = data.get("id") if data else None

    if not recipe_id:
        return jsonify({"error": "Missing recipe ID"}), 400

    try:
        logger.info(f"Adding embedding for recipe {recipe_id}")
        cache.add_recipe_to_cache(recipe_id)
        return jsonify({
            "message": f"✅ Embedding added for recipe: {recipe_id}",
            "recipe_id": recipe_id
        }), 200
    except ValueError as e:
        logger.warning(f"Recipe not found: {e}")
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        logger.error(f"Error adding embedding: {e}")
        return jsonify({"error": "Internal server error"}), 500


@app.route("/embedding/remove", methods=["POST"])
def remove_embeddings():
    """Remove embeddings for recipes"""
    data = request.get_json()
    ids = data.get("ids", []) if data else []

    if not ids:
        return jsonify({"error": "Missing recipe IDs"}), 400

    if not isinstance(ids, list):
        return jsonify({"error": "IDs must be a list"}), 400

    try:
        logger.info(f"Removing embeddings for {len(ids)} recipes")
        cache.remove_recipes_from_cache(ids)
        return jsonify({
            "message": f"🧹 Removed {len(ids)} embeddings",
            "removed_ids": ids
        }), 200
    except Exception as e:
        logger.error(f"Error removing embeddings: {e}")
        return jsonify({"error": "Internal server error"}), 500


@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404


@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500


if __name__ == "__main__":
    try:
        logger.info("🌟 Starting Recipe Recommendation API server...")
        app.run(host="0.0.0.0", port=5001, debug=False)
    except KeyboardInterrupt:
        logger.info("👋 Server stopped by user")
    except Exception as e:
        logger.error(f"Server error: {e}")
    finally:
        cleanup()