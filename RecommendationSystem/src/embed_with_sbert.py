import pandas as pd
import torch
import pickle
from sentence_transformers import SentenceTransformer

def load_data(path="data/recipes_cleaned.csv"):
    df = pd.read_csv(path)
    return df["id"].tolist(), df["combined_text"].tolist()

def embed_texts(texts, model_name="all-MiniLM-L6-v2"):
    model = SentenceTransformer(model_name)
    embeddings = model.encode(texts, convert_to_tensor=True, show_progress_bar=True)
    return embeddings

def save_embeddings(embeddings, ids):
    torch.save(embeddings, "model/recipe_embeddings.pt")
    with open("model/recipe_ids.pkl", "wb") as f:
        pickle.dump(ids, f)
    print("✅ Embeddings and IDs saved.")

def append_embedding(new_id, new_text):
    ids, texts = load_data()
    if new_id in ids:
        return
    texts.append(new_text)
    ids.append(new_id)
    new_vec = embed_texts([new_text])[0].unsqueeze(0)
    old_vecs = torch.load("model/recipe_embeddings.pt", map_location="cpu")
    new_vecs = torch.cat([old_vecs, new_vec], dim=0)
    save_embeddings(new_vecs, ids)
    return new_vec

def remove_embeddings(removed_ids):
    ids, texts = load_data()
    existing_vecs = torch.load("model/recipe_embeddings.pt", map_location="cpu")
    filtered = [(i, rid) for i, rid in enumerate(ids) if rid not in removed_ids]
    if not filtered:
        save_embeddings(torch.empty(0), [])
        return
    indices, new_ids = zip(*filtered)
    new_vecs = torch.stack([existing_vecs[i] for i in indices])
    save_embeddings(new_vecs, list(new_ids))
    print(f"🧹 Removed {len(removed_ids)} recipes from embedding.")

def main():
    ids, texts = load_data()
    embeddings = embed_texts(texts)
    save_embeddings(embeddings, ids)

if __name__ == "__main__":
    main()