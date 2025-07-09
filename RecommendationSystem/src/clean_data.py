import pandas as pd
import re
from bs4 import BeautifulSoup

def clean_html(text):
    if pd.isna(text):
        return ""
    return BeautifulSoup(str(text), "html.parser").get_text(separator=" ")

def normalize_text(text):
    text = clean_html(text)
    text = re.sub(r"\s+", " ", text)
    text = re.sub(r"[^\w\s]", "", text)
    return text.lower().strip()

def combine_fields(row):
    title = row.get("title", "")
    description = row.get("description", "")
    time = int(float(row.get("time", 0)))
    servings = int(float(row.get("servings", 1)))
    ingredients = row.get("ingredients", "")
    directions = row.get("directions", "")
    cuisines = row.get("cuisines", "")
    dietary_pref = row.get("dietary_pref", "")

    time_serving_info = f"This recipe takes {time} minutes and serves {servings} people."
    parts = [title, description, time_serving_info, f"Ingredients: {ingredients}", f"Directions: {directions}", f"Cuisines: {cuisines}", f"Dietary: {dietary_pref}"]
    cleaned = [normalize_text(p) for p in parts if pd.notna(p)]
    return " ".join(cleaned)

def clean_and_export(csv_path="data/recipes.csv", output_path="data/recipes_cleaned.csv"):
    df = pd.read_csv(csv_path)
    required = ["id", "title", "description", "time", "servings", "ingredients", "directions", "cuisines", "dietary_pref"]
    for col in required:
        if col not in df.columns:
            df[col] = ""
    df = df[df["id"].notnull()]  # Ensure ID exists
    df["combined_text"] = df.apply(combine_fields, axis=1)
    df[["id", "combined_text"]].to_csv(output_path, index=False)
    print(f"✅ Cleaned data saved to {output_path}")

if __name__ == "__main__":
    clean_and_export()