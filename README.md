# LetMeCook — Full Project Setup Guide (EN)

**Goal:** Run the complete system locally: **Backend (Spring Boot)** · **Frontend (Vite/React)** · **Database (Supabase/Postgres)** · **Recommendation System (Python)**.  
**Audience:** New developers who just cloned the repo and want a fast, reliable local setup, with pointers for production.

**VIDEO DEMO**
Click on this link to view a demo video of the app: https://drive.google.com/file/d/1t0xgwnRSZMYGZzsJs8h1D_uQR1hMpfYb/view?usp=sharing

---

### Team Members
| Name | Email | GitHub |
|---|---|---|
| VAN TAI HUYNH | hvtai.it@gmail.com | [VanTaiHuynh](https://github.com/VanTaiHuynh) |
| Carmen Lam | clam98@myseneca.ca | [Carmen-jx](https://github.com/Carmen-jx) |
| Vinh Tran | tvtran8@myseneca.ca | [vintrn](https://github.com/vintrn) |
| Amiel Thompson | Athompson64@myseneca.ca | [Amavige](https://github.com/Amavige) |
| Jie He | jhe118@myseneca.ca | [jennyhe-coder](https://github.com/jennyhe-coder) |

### Instructor
| Name | Email |
|---|---|
| Yasser Elmankabady | yasser.elmankabady@senecapolytechnic.ca |

---

## 0) Architecture Overview

- **Frontend** (`/client`): Vite + React. Calls the Backend API and Supabase (for auth/storage/queries used by the app).
- **Backend** (`/server`, Spring Boot): REST API for users, recipes, reviews, browsing history… Integrates **OpenAI** for **ingredient extraction** from text/images and calls the **Recommendation System** service for personalized results.
- **Database** (**Supabase** = Postgres + Auth): Stores users, recipes, ingredients, reviews, browsing history, dislikes, favourites, dietary preferences, etc.
- **Recommendation System** (`/RecommendationSystem`, Python): Separate service (Flask/Gunicorn). Uses SBERT to embed recipes, stores embeddings (e.g., `model/recipe_embeddings.pt`), and exposes endpoints to return recommendations.

### Typical flow
1. Guest/User submits a query or image → **Backend** uses OpenAI to **extract ingredients / intent**.
2. Backend queries **Supabase** with filters (dietary preference, allergies, etc.).
3. Backend calls **Recommendation System** to fetch candidates based on user history, favourites, and more.
4. **Frontend** renders results (guest users can browse and search, but features are limited — see **Guest User** section).

---

## 1) Prerequisites

- **Git** ≥ 2.30
- **Node.js** ≥ 18 LTS and **npm** ≥ 9
- **Java** ≥ 17 (Adoptium Temurin JDK 17 recommended)
- **Maven** ≥ 3.9 (you can use the included wrapper `mvnw`)
- **Python** ≥ 3.10 and `pip`
- **Supabase** account — create a project (managed Postgres)
- **OpenAI API Key** — for ingredient extraction

*Optional (if used in your repo):*  
- **Deno** (for the Supabase Edge Function under `client/supabase/functions/send-contact-email`)  
- **Gunicorn** (already scripted in `RecommendationSystem/run_gunicorn.sh`)

---

## 2) Clone the repository

```bash
git clone <YOUR_REPO_URL> let-me-cook
cd let-me-cook
```

Key folders (from your tree listing):
```
client/                # Vite + React
server/                # Spring Boot
RecommendationSystem/  # Python recommend service (SBERT)
```

---

## 3) Database — Supabase (Postgres)

### 3.1 Create a Supabase project
- In Supabase, create a **New project**.
- Note these values:
  - **Project URL** (REST URL)
  - **Anon Key** (for frontend)
  - **Service Role Key** (server-side only, do NOT expose to frontend)
  - **DB connection** (host, port, database, user, password)

### 3.2 Create tables (schema)
Follow the entities in your backend models:  
`/server/src/main/java/.../model/` → `User`, `Recipe`, `Ingredient`, `RecipeIngredient`, `Review`, `RecipeBrowsingHistory`, `RecipeDisliked`, `RecipeFavourites`, `DietaryPreference`, `Cuisine`, `Category`, `UserAllergy`, etc.

You can:
- **(Recommended)** Apply SQL migrations if your repo has them (if not, create tables manually based on model classes).
- Use **Supabase SQL Editor** to run `CREATE TABLE ...` statements and define PK/FK/indexes (e.g., on `recipe_id`, `user_id`, `created_at`).

> Ensure Row Level Security (RLS) & Policies are set appropriately before production.

---

## 4) Recommendation System (Python)

Folder: `RecommendationSystem/`

### 4.1 Create & activate a virtual environment
```bash
cd RecommendationSystem
python -m venv .venv

# macOS/Linux
source .venv/bin/activate

# Windows PowerShell
# .venv\Scripts\Activate.ps1

pip install -r requirements.txt
```

### 4.2 Configure environment variables
Create a `.env` (if your `app.py` supports it) or export in the shell. Example:
```bash
export SUPABASE_URL="https://<your-project>.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="<your-service-role-key>"  # server-side only
export REC_PORT="8001"                                      # service port
export REC_TOPK="20"
export REC_MIN_SCORE="0.25"
```

> Adjust to match your code in `src/download_from_supabase.py`, `pipeline.py`, `recommend.py`.

### 4.3 First-time pipeline build
Download → clean → embed recipes with SBERT:
```bash
python src/download_from_supabase.py
python src/clean_data.py
python src/embed_with_sbert.py
python src/pipeline.py     # if you have a combined pipeline script
```
Confirm the embedding file exists, e.g. `model/recipe_embeddings.pt`.

### 4.4 Run the service
Dev run:
```bash
python app.py
```
Or via Gunicorn (recommended for prod):
```bash
bash run_gunicorn.sh   # adjust the script/bind address if needed
```

Health check (example):
```bash
curl http://localhost:8001/health
```
Recommendation endpoint (example; adapt params to your code):
```bash
curl "http://localhost:8001/recommend?userId=123&limit=10"
```

---

## 5) Backend (Spring Boot)

Folder: `server/`

### 5.1 Configure `application.yml`
Fill in real values for DB, OpenAI, and recommendation settings. Example:
```yaml
server:
  port: 8080

spring:
  datasource:
    url: jdbc:postgresql://<DB_HOST>:<DB_PORT>/<DB_NAME>
    username: <DB_USER>
    password: <DB_PASSWORD>
    driver-class-name: org.postgresql.Driver
  jpa:
    hibernate:
      ddl-auto: validate   # dev: update | prod: validate
    show-sql: true
    properties:
      hibernate.format_sql: true

recommendation:
  baseUrl: http://localhost:8001   # must match the Python service
  topK: 20
  minScore: 0.25

openai:
  apiKey: ${OPENAI_API_KEY}        # read from env var
  # other fields if your OpenAIService requires them

cors:
  allowed-origins: http://localhost:5173
  allowed-methods: GET,POST,PUT,DELETE,OPTIONS
  allowed-headers: '*'
  allow-credentials: true
```

> Do not commit secrets. Use environment variables (e.g., `OPENAI_API_KEY`, `DB_PASSWORD`).

### 5.2 Run the backend
```bash
cd server
# using Maven wrapper so you don't need a global Maven install
./mvnw spring-boot:run
# Windows:
# mvnw.cmd spring-boot:run
```

Health check:
```bash
curl http://localhost:8080/
```

Recommendation bridge (example; see `RecommendationController`):
```bash
curl "http://localhost:8080/api/recommend?userId=123&limit=10"
```

Ingredient extraction (example; see `OpenAIController`):
```bash
curl -X POST "http://localhost:8080/api/openai/extract-ingredients" \
  -H "Content-Type: application/json" \
  -d '{"text":"salmon, garlic, lemon, olive oil"}'
```

> Match the exact endpoint names from your controllers.

---

## 6) Frontend (Vite + React)

Folder: `client/`

### 6.1 Create `.env` for Vite
Create `client/.env`:
```bash
VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
VITE_API_BASE=http://localhost:8080
# If you directly call the Python service from the frontend (usually not required):
# VITE_REC_BASE=http://localhost:8001
```

Check `src/utils/supabaseClient.js` and any API files to ensure they use these variables.

### 6.2 Install & run
```bash
cd client
npm ci        # or: npm install
npm run dev   # default Vite port 5173
```
Open: http://localhost:5173

---

## 7) Run Order & End-to-End Check

**Start in this order:**
1. **Recommendation System** (Python) → port `8001`
2. **Backend** (Spring Boot) → port `8080`
3. **Frontend** (Vite) → port `5173`

**Quick E2E test:**
- On the Home page, you should see **Sunny the Chef** and the search bar.
- Try queries like “I want an Asian dish that’s vegan” or “I want dinner with salmon”.
- Backend should call OpenAI (if enabled), query Supabase, and—if the user has history—call the Recommendation service.
- Sections like **Latest Picks / Most Popular / Vegetarian/Vegan / Gluten Free** and the **Recipes** page should render results.

---

## 8) Guest User Capabilities (Important)

**Guest users CAN:**
- View public recipe details.
- Use search.
- Browse public pages (**Home**, **Recipes**, **About**, **Contact**, **Privacy**, **Terms**).

**Guest users CANNOT:**
- **Create**, **edit**, or **delete** recipes.
- **Comment** or **rate** recipes; **save favourites**.
- Access the **full AI Recommendation** features (personalized suggestions powered by history, allergies, dislikes/favourites, etc.).

For the full experience, sign up via **Get Started** or log in if you already have an account.

---

## 9) Production Notes (Brief)

- **Recommendation System:** Run with **Gunicorn** behind **nginx** (HTTPS via reverse proxy).
- **Backend:** Build a jar (`mvn package`) and deploy to your target (EC2/Fly.io/Render). Consider Dockerizing.
- **Frontend:** `npm run build` and serve static files with nginx/Vercel/Netlify.
- **Secrets:** Use environment variables or a secret manager; never commit keys.
- **CORS:** Allow your production domains only.
- **Supabase:** Enable RLS and write strict Policies before going live.

---

## 10) Troubleshooting

- **Frontend 404/Network Error** → check `VITE_API_BASE` and backend CORS config.
- **Backend 401/403** → review `SecurityConfig.java` (public vs protected routes).
- **Backend cannot reach Recommendation** → confirm `recommendation.baseUrl` and that the Python service is running on the correct port.
- **OpenAI 401** → verify `OPENAI_API_KEY` and quotas.
- **Embedding file missing** → re-run the Python pipeline to generate `model/recipe_embeddings.pt`.
- **Supabase connection failures** → verify `spring.datasource.url`/user/password and any IP restrictions.

---

## 11) One-Page Command Summary

```bash
# RECOMMENDATION SYSTEM
cd RecommendationSystem
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
export SUPABASE_URL="https://<your-project>.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="<service-role-key>"
bash run_gunicorn.sh   # or: python app.py (dev)

# BACKEND
cd server
export OPENAI_API_KEY="<your-openai-key>"
./mvnw spring-boot:run

# FRONTEND
cd client
npm ci
echo "VITE_API_BASE=http://localhost:8080" > .env
echo "VITE_SUPABASE_URL=https://<your-project>.supabase.co" >> .env
echo "VITE_SUPABASE_ANON_KEY=<anon-key>" >> .env
npm run dev
```

---

## 12) Security Notes
- Never expose the **Service Role Key** in the frontend.
- Enable **RLS** and craft strict **Policies** in Supabase.
- Avoid logging secrets (tokens/keys) in any environment.

---
