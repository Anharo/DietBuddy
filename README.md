# 🥗 DietBuddy - Diet and Food Recommendation App

A full-stack diet tracking app for logging daily meals, tracking calories and macros, and getting diet-aware food recommendations. Users can sign up, save profile details, log meals, track foods by grams, view daily calorie progress, and receive AI-assisted recommendations based on their diet preference and today's intake.

**Stack:** React + Create React App + Recharts + Supabase JS (frontend) · FastAPI + Supabase + OpenRouter AI (backend)

---

## 📁 Project Structure

```text
backend/
├── requirements.txt              # Python backend dependencies
├── README.md                     # Detailed backend documentation
└── app/
    ├── main.py                   # FastAPI app, CORS, router registration
    ├── core/
    │   ├── config.py             # Environment/config helpers
    │   └── supabase.py           # Supabase client dependency
    ├── db/
    │   └── supabase.py           # Supabase database client setup
    ├── models/
    │   ├── user_model.py         # User/profile Pydantic models
    │   ├── diet_model.py         # Diet entry and AI recommendation models
    │   └── food_model.py         # Food entry and recommendation models
    ├── routes/
    │   ├── __init__.py           # Route package marker
    │   ├── auth_routes.py        # /auth signup, login, profile APIs
    │   ├── diet_routes.py        # /diet meal log and diet history APIs
    │   └── food_routes.py        # /food tracker and recommendation APIs
    ├── services/
    │   ├── auth_service.py       # Supabase auth/profile logic
    │   ├── diet_service.py       # Diet entry CRUD and AI recommendation flow
    │   └── food_service.py       # Food tracking and recommendation logic
    └── utils/
        ├── auth_utils.py         # JWT/current-user helpers
        ├── ai_nutrition.py       # OpenRouter nutrition and recommendation helpers
        └── hash.py               # Password/hash utility helpers

frontend/
├── package.json                  # React scripts and npm dependencies
├── README.md                     # Detailed frontend documentation
├── public/
│   ├── index.html                # React HTML template
│   ├── manifest.json             # Web app manifest
│   └── favicon.ico               # App favicon
└── src/
    ├── App.js                    # Route definitions
    ├── App.css                   # Shared app/auth/diet styling
    ├── index.js                  # React app entry point
    ├── index.css                 # Global styles
    ├── supabaseClient.js         # Supabase browser client
    └── pages/
        ├── Login.jsx            # Login with Supabase Auth
        ├── Signup.jsx           # Signup and profile capture
        ├── Diet.jsx             # Daily meal log page
        ├── Dashboard.jsx        # Main dashboard, tracker, macros, recommendations
        ├── Dashboard.css        # Dashboard-specific styling
        └── LoginForm.jsx        # Login form component/page
```

---

## 🚀 Quick Start

### 1 - Backend

```powershell
cd backend
..\Venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend runs at `http://127.0.0.1:8000`

Swagger docs run at `http://127.0.0.1:8000/docs`

### 2 - Frontend

```powershell
cd frontend
npm install
npm start
```

Frontend runs at `http://localhost:3000`

If port `3000` is already in use, Create React App may offer another port such as `http://localhost:3001`.

---

## 🔧 Environment Setup

Create `backend/.env`:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_key
OPENROUTER_API_KEY=your_openrouter_key
AI_MODEL=meta-llama/llama-3-8b-instruct
JWT_SECRET=change-this-secret
```

Do not commit real API keys or secrets.

The frontend Supabase client is configured in:

```text
frontend/src/supabaseClient.js
```

For production, move frontend Supabase values into environment variables instead of hard-coding them.

---

## ✨ Features

- **Supabase Auth** - Sign up, log in, maintain sessions, and sign out.
- **Profile Capture** - Stores age, gender, height, weight, goal, health notes, allergies, diet type, and activity level.
- **Daily Diet Log** - Save breakfast, lunch, dinner, and snacks.
- **Food Tracker** - Add foods with gram amounts and store nutrition estimates.
- **Calories and Macros** - View today's calories plus carbs, protein, and fats.
- **Macro Chart** - Recharts pie chart for daily macro breakdown.
- **Calorie Budget** - Dashboard estimates a daily calorie target from profile data, BMI, goal, and activity.
- **AI Nutrition Estimates** - Backend estimates calories/macros for tracked foods.
- **Diet-Aware Recommendations** - Recommendations consider profile data, diet type, allergies, today's meals, and tracked foods.
- **Fallback Recommendations** - Local recommendation logic is used if OpenRouter is unavailable or rate-limited.

---

## 🔐 Auth Flow

1. User signs up through Supabase Auth from the frontend.
2. Signup captures profile details and stores them in Supabase Auth metadata.
3. Frontend sends profile details to `POST /auth/profile`.
4. Backend saves profile data in `public.users`.
5. Login uses Supabase Auth email/password authentication.
6. Frontend sends `Authorization: Bearer <supabase_access_token>` to protected backend routes.
7. Backend verifies the token and ensures users can only access their own data.

---

## 🔌 API Reference

### Health

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | ❌ | Backend health/welcome response |

### Auth and Profile - `/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/signup` | ❌ | Create a user through backend auth service |
| POST | `/auth/login` | ❌ | Log in through backend auth service |
| POST | `/auth/profile` | ✅ | Create or update the current user's profile |
| GET | `/auth/profile/{user_id}` | Optional | Fetch a user's profile with metadata fallback |

### Diet - `/diet`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/diet/add` | ✅ | Save a daily diet entry from the React diet form |
| POST | `/diet/entry` | ✅ | Log a new diet entry for the authenticated user |
| GET | `/diet/{user_id}` | ❌ | Fetch diet entries for a user |
| GET | `/diet/today` | ✅ | Fetch today's diet entry |
| GET | `/diet/history` | ✅ | Fetch recent diet history |
| PUT | `/diet/entry/{entry_id}` | ✅ | Update a diet entry |
| DELETE | `/diet/entry/{entry_id}` | ✅ | Delete a diet entry |
| POST | `/diet/recommend` | ✅ | Generate an AI recommendation from today's meals or request body |

### Food - `/food`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/food/add` | Recommended | Add a tracked food and estimate nutrition |
| GET | `/food/{user_id}` | ✅ | Fetch tracked foods for a user |
| GET | `/food/recommendations/{user_id}` | Optional | Generate food recommendations for a user |

---

## 🗄️ Supabase Data Tables

**`public.users`** - `id`, `age`, `gender`, `height`, `weight`, `goal`, `health`, `allergies`, `diet`, `activity`

**`public.diet_entries`** - `id`, `user_id`, `breakfast`, `lunch`, `dinner`, `snacks`, `created_at`

**`public.food_entries`** - `id`, `user_id`, `food_name`, `grams`, `created_at`, `calories`, `protein`, `carbs`, `fats`

Important: `public.users.id` should match the Supabase Auth user id.

---

## 🌐 Frontend Routes

| Path | Page |
|---|---|
| `/` | Login |
| `/signup` | Signup |
| `/diet` | Daily diet log |
| `/dashboard` | Dashboard |

---

## 🧠 Main App Flow

1. User signs up or logs in with Supabase Auth.
2. Signup profile data is saved to `public.users`.
3. New users log meals on `/diet`.
4. Returning users with diet history are routed to `/dashboard`.
5. Dashboard loads profile details, food entries, and recommendations.
6. User adds foods with gram amounts.
7. Backend estimates nutrition and stores food entries.
8. Dashboard shows daily calories, macro chart, food log, and recommendations.

---

## 📝 Notes

- Start the backend before using the frontend dashboard features.
- The backend expects Supabase credentials and an OpenRouter API key in `backend/.env`.
- Food nutrition values are AI estimates, so they should be treated as guidance rather than medical data.
- Vegetarian and vegan recommendations are filtered to avoid invalid foods.
- If OpenRouter fails or rate limits the request, the backend returns local fallback recommendations.
- Supabase Row Level Security policies must allow users to insert and read their own profile, diet, and food rows.
- CORS is currently open in development with `allow_origins=["*"]`; tighten this before deployment.

---

## ✅ Development Checks

Compile backend:

```powershell
cd backend
..\Venv\Scripts\python.exe -m compileall app
```

Build frontend:

```powershell
cd frontend
npm run build
```

Manual demo checklist:

1. Start backend.
2. Start frontend.
3. Sign up.
4. Save profile and diet details.
5. Log in.
6. Add a tracked food.
7. Check calories, macros, recommendations, diet preference changes, and sign out.
