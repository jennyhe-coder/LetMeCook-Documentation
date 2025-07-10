from flask import Flask, request, jsonify
from src.recommend import recommend_by_id, recommend_for_user, try_update_missing_embedding
from src.embed_with_sbert import append_embedding, remove_embeddings
from multiprocessing import Process
import subprocess
import traceback
import os
import pandas as pd

app = Flask(__name__)
STATUS_FILE = "pipeline_status.txt"

# Background pipeline

def run_pipeline_background():
    try:
        with open(STATUS_FILE, "w") as f:
            f.write("⏳ Pipeline running...")
        subprocess.run(["python", "src/pipeline.py"], check=True)
        with open(STATUS_FILE, "w") as f:
            f.write("✅ Pipeline finished successfully.")
    except Exception as e:
        with open(STATUS_FILE, "w") as f:
            f.write(f"❌ Pipeline failed: {str(e)}")

@app.route("/recommend/id", methods=["GET"])
def recommend_by_recipe():
    recipe_id = request.args.get("recipeId")
    top_k = int(request.args.get("topK", 10))
    try:
        results = recommend_by_id(recipe_id, top_k)
        return jsonify({"recommendations": results}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route("/recommend/user", methods=["GET"])
def recommend_for_user_route():
    favorites = request.args.get("favorites", "")
    history = request.args.get("history", "")
    top_k = int(request.args.get("topK", 10))

    favorites = [f for f in favorites.split(",") if f]
    history = [h for h in history.split(",") if h]
    print(f"Received favorites: {favorites}, history: {history}, top_k: {top_k}")
    try:
        results = recommend_for_user(favorites, history, top_k)
        print(f"Recommendations: {results}")
        return jsonify({"recommendations": results}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route("/update/embed", methods=["POST"])
def update_embed():
    try:
        p = Process(target=run_pipeline_background)
        p.start()
        return jsonify({"status": "⏳ Pipeline started in background."}), 202
    except Exception as e:
        return jsonify({"error": "Failed to start pipeline.", "details": str(e)}), 500

@app.route("/update/embed/status", methods=["GET"])
def check_pipeline_status():
    if not os.path.exists(STATUS_FILE):
        return jsonify({"status": "ℹ️ No pipeline started yet."}), 200
    with open(STATUS_FILE, "r") as f:
        content = f.read()
    return jsonify({"status": content}), 200

@app.route("/embedding/add", methods=["POST"])
def add_vector():
    data = request.get_json()
    recipe_id = data.get("id")
    if not recipe_id:
        return jsonify({"error": "Missing recipe ID"}), 400
    try:
        try_update_missing_embedding(recipe_id)
        return jsonify({"message": f"✅ Embedding added/updated for ID: {recipe_id}"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/embedding/remove", methods=["POST"])
def remove_vector():
    data = request.get_json()
    ids = data.get("ids", [])
    if not ids:
        return jsonify({"error": "Missing ids"}), 400
    try:
        remove_embeddings(ids)
        return jsonify({"message": f"🧹 Removed {len(ids)} embeddings."}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)