import torch
import pickle
import pandas as pd
from sentence_transformers import util

from src.clean_data import combine_fields
from src.embed_with_sbert import append_embedding, remove_embeddings
from dotenv import load_dotenv
import os
from sqlalchemy import create_engine
from urllib.parse import quote_plus
load_dotenv()


def load_data():
    embeddings = torch.load("model/recipe_embeddings.pt", map_location="cpu")
    with open("model/recipe_ids.pkl", "rb") as f:
        recipe_ids = pickle.load(f)
    return recipe_ids, embeddings


def try_update_missing_embedding(recipe_id):
    recipe_ids, _ = load_data()
    if recipe_id in recipe_ids:
        return

    # Connect suppabase and check if recipe_id exists

    load_dotenv()
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
        raise ValueError(f"❌ Recipe ID '{recipe_id}' not found in database")

    combined_text = combine_fields(df.iloc[0])
    append_embedding(recipe_id, combined_text)

def sync_embeddings():
    df = pd.read_csv("data/recipes_cleaned.csv")
    valid_ids = set(df["id"].tolist())
    current_ids, _ = load_data()
    removed_ids = [rid for rid in current_ids if rid not in valid_ids]
    if removed_ids:
        remove_embeddings(removed_ids)

def recommend_by_id(target_id, top_k=10):
    sync_embeddings()
    try_update_missing_embedding(target_id)
    recipe_ids, embeddings = load_data()
    idx = recipe_ids.index(target_id)
    target_vector = embeddings[idx].to("cpu")
    similarities = util.cos_sim(target_vector, embeddings)[0]
    top_results = torch.topk(similarities, k=top_k + 1)
    return [(recipe_ids[i], float(score)) for score, i in zip(top_results.values[1:], top_results.indices[1:])]

def recommend_for_user(fav_ids, hist_ids, fav_weight=2.0, hist_weight=1.0, top_k=10):
    sync_embeddings()
    for rid in fav_ids + hist_ids:
        try:
            try_update_missing_embedding(rid)
        except Exception:
            continue

    recipe_ids, embeddings = load_data()
    vectors, weights = [], []

    for rid in fav_ids:
        if rid in recipe_ids:
            vectors.append(embeddings[recipe_ids.index(rid)].to("cpu"))
            weights.append(fav_weight)

    for rid in hist_ids:
        if rid in recipe_ids and rid not in fav_ids:
            vectors.append(embeddings[recipe_ids.index(rid)].to("cpu"))
            weights.append(hist_weight)

    if not vectors:
        return []

    stacked = torch.stack(vectors).to("cpu")
    weight_tensor = torch.tensor(weights, dtype=torch.float32).unsqueeze(1).to("cpu")
    user_vector = torch.sum(stacked * weight_tensor, dim=0) / torch.sum(weight_tensor)
    similarities = util.cos_sim(user_vector, embeddings)[0]

    exclude = set(fav_ids + hist_ids)
    top_results = torch.topk(similarities, k=top_k + len(exclude) + 5)
    recommendations = []
    for score, idx in zip(top_results.values, top_results.indices):
        rec_id = recipe_ids[idx]
        if rec_id not in exclude:
            recommendations.append((rec_id, float(score)))
        if len(recommendations) >= top_k:
            break

    return recommendations