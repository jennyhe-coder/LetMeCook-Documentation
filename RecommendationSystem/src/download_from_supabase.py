import os
import pandas as pd
from sqlalchemy import create_engine
from urllib.parse import quote_plus
from bs4 import BeautifulSoup
import re
from dotenv import load_dotenv

load_dotenv()

def clean_html_completely(html):
    if not html:
        return ""
    soup = BeautifulSoup(html, "html.parser")
    for a in soup.find_all("a"):
        a.decompose()
    text = soup.get_text(separator=" ", strip=True)
    return re.sub(r"\s+", " ", text).strip()

user = os.getenv("SUPABASE_USER")
password = quote_plus(os.getenv("SUPABASE_PASSWORD", ""))
host = os.getenv("SUPABASE_HOST")
port = os.getenv("SUPABASE_PORT")
db = os.getenv("SUPABASE_DB")

url = f'postgresql+pg8000://{user}:{password}@{host}:{port}/{db}'
engine = create_engine(url)

query = """
  SELECT 
    r.id,
    r.title,
    r.description,
    r.directions, 
    r.time,
    r.servings,
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
  GROUP BY r.id, r.title, r.description, r.directions, r.time, r.servings;
"""

df = pd.read_sql(query, engine)
df = df[df["id"].notnull()]  # ensure valid IDs

for col in ['title', 'description', 'directions']:
    df[col] = df[col].fillna("").apply(clean_html_completely)
for col in ['cuisines', 'ingredients', 'dietary_pref']:
    df[col] = df[col].fillna("")

df.to_csv("data/recipes.csv", index=False, encoding="utf-8-sig")
print(f"✅ Exported {len(df)} recipes to data/recipes.csv")
