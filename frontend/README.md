# DietBuddy Frontend

DietBuddy frontend is a React app for logging meals, tracking foods, viewing calories/macros, and getting diet-aware recommendations from the backend.

The frontend uses Supabase Auth for login/signup and talks to the FastAPI backend for profile storage, diet logs, food entries, nutrition estimates, and recommendations.

## What The Frontend Does

- Lets users sign up and log in with Supabase Auth.
- Captures profile details during signup.
- Lets users log daily meals: breakfast, lunch, dinner, and snacks.
- Lets users add foods with gram amounts.
- Shows food calories and macro totals.
- Shows a pie chart for carbs, protein, and fats.
- Shows a daily calorie budget based on BMI/profile details.
- Shows AI recommendations from the backend.
- Supports Vegetarian, Non-Vegetarian, and Vegan diet preferences.
- Allows users to change diet preference from the dashboard.
- Provides a real sign-out button that clears the Supabase session.

## Tech Stack

- React 18
- React Router
- Supabase JS
- Recharts
- Create React App

## Requirements

Install dependencies from `package.json`:

```powershell
cd frontend
npm install
```

Main dependencies:

```text
react
react-dom
react-router-dom
@supabase/supabase-js
recharts
react-scripts
```

## Run The Frontend

```powershell
cd frontend
npm start
```

Default URL:

```text
http://localhost:3000
```

If port 3000 is already in use, Create React App may ask to run on another port such as:

```text
http://localhost:3001
```

## Backend Requirement

The frontend expects the backend at:

```text
http://127.0.0.1:8000
```

Start the backend first:

```powershell
cd backend
uvicorn app.main:app --reload
```

If the backend is not running, login may work but diet saving, food tracking, profile loading, and recommendations will fail.

## Supabase Client

Supabase frontend config is in:

```text
src/supabaseClient.js
```

It creates the Supabase browser client:

```js
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

For a production app, move the Supabase URL and anon key into environment variables instead of hard-coding them.

## Pages And Routes

Routes are defined in:

```text
src/App.js
```

Current routes:

```text
/           Login
/signup     Signup
/diet       Daily diet log
/dashboard  Dashboard
```

## Login Page

File:

```text
src/pages/Login.jsx
```

What it does:

- Takes email and password.
- Calls Supabase Auth:

```js
supabase.auth.signInWithPassword(...)
```

- Gets the logged-in user id.
- Calls backend:

```text
GET /diet/{user_id}
```

- Redirects:
  - to `/diet` if no diet history exists
  - to `/dashboard` if diet history exists

## Signup Page

File:

```text
src/pages/Signup.jsx
```

What it captures:

- name
- age
- gender
- height
- weight
- goal
- health conditions
- allergies
- diet type
- activity level
- email
- password

What it does:

1. Creates a Supabase Auth account:

```js
supabase.auth.signUp(...)
```

2. Stores profile details in Supabase Auth metadata.
3. Sends profile details to backend:

```text
POST /auth/profile
```

4. Backend stores profile details in `public.users`.
5. Redirects to `/diet`.

Important:

Profile data should be stored in `public.users` with `id` equal to the Supabase Auth user id.

## Diet Page

File:

```text
src/pages/Diet.jsx
```

What it does:

- Lets the user enter:
  - breakfast
  - lunch
  - dinner
  - snacks

When saving:

1. Gets the Supabase user/session.
2. Sends the access token to backend.
3. Calls:

```text
POST /diet/add
```

Request body:

```json
{
  "user_id": "auth-user-uuid",
  "breakfast": "oats",
  "lunch": "rice and dal",
  "dinner": "paneer wrap",
  "snacks": "fruit"
}
```

Stored in:

```text
public.diet_entries
```

After saving, the user goes to:

```text
/dashboard
```

The page also has:

- Dashboard button
- Sign out button

## Dashboard Page

File:

```text
src/pages/Dashboard.jsx
```

The dashboard is the main app screen.

It loads:

- current Supabase user
- profile details
- tracked food entries
- food recommendations

Backend calls:

```text
GET /auth/profile/{user_id}
GET /food/{user_id}
GET /food/recommendations/{user_id}
POST /food/add
POST /auth/profile
```

## Dashboard Features

### Daily Calorie Budget

The daily budget uses profile data:

- age
- gender
- height
- weight
- activity
- goal

It calculates BMI:

```text
BMI = weight / (height_in_meters ^ 2)
```

Then adjusts the daily target using:

- BMI category
- goal: lose, gain, maintain
- activity level

The budget resets visually every day at local midnight because the frontend only counts food entries from today's date.

### Food Tracker

Users can add:

- food name
- grams

The frontend calls:

```text
POST /food/add
```

The backend estimates:

- calories
- protein
- carbs
- fats

Stored in:

```text
public.food_entries
```

### Macro Chart

Uses Recharts to display:

- carbs
- protein
- fats

The chart uses today's food entries only.

### Recommendations

The dashboard calls:

```text
GET /food/recommendations/{user_id}
```

The backend generates recommendations using:

- profile
- diet type
- allergies
- health notes
- today's diet entries
- today's tracked food entries
- today's macro totals

The frontend displays:

- recommended food
- calories per 100g
- protein/carbs/fats
- reason
- button to add recommendation to tracker

If the backend returns a warning, the frontend shows it above the recommendation cards.

### Diet Preference Selector

The dashboard includes a diet preference dropdown:

```text
Vegetarian
Non-Vegetarian
Vegan
```

Changing it:

1. Updates Supabase Auth metadata.
2. Calls:

```text
POST /auth/profile
```

3. Refreshes recommendations.

This fixes cases where an older account is missing a `public.users` profile row.

## Sign Out

Dashboard and Diet pages include a real sign-out button.

It calls:

```js
await supabase.auth.signOut();
```

Then redirects to:

```text
/
```

That returns the user to the login/signup screen.

## Styling

Main styling files:

```text
src/App.css
src/pages/Dashboard.css
```

`App.css` contains:

- auth page layout
- shared buttons
- shared app shell
- diet page styling

`Dashboard.css` contains:

- dashboard layout
- metrics
- calorie budget bar
- tracker
- chart area
- recommendation cards
- food log table

## Important Files

```text
src/App.js
src/App.css
src/supabaseClient.js
src/pages/Login.jsx
src/pages/Signup.jsx
src/pages/Diet.jsx
src/pages/Dashboard.jsx
src/pages/Dashboard.css
```

## Data Storage Summary

The frontend itself does not store app data permanently.

Data goes to Supabase through the backend:

```text
Profile details -> public.users
Daily meal text -> public.diet_entries
Food tracker entries -> public.food_entries
Authentication -> Supabase Auth
```

Supabase Auth metadata is also used as a fallback for profile details.

## Build

```powershell
cd frontend
npm run build
```

Build output:

```text
frontend/build
```

## Troubleshooting

### Login works but saving diet fails

Check that backend is running:

```text
http://127.0.0.1:8000
```

Also check Supabase RLS policies for `diet_entries`.

### Recommendations show local fallback

The backend could not get AI recommendations. Possible reasons:

- OpenRouter is rate-limited.
- OpenRouter API key is missing or invalid.
- AI response could not be parsed.

### Vegetarian account shows non-veg recommendations

Check the profile row in Supabase:

```text
public.users.id = current Supabase Auth user id
public.users.diet = Vegetarian
```

You can also change diet preference from the dashboard dropdown.

### Daily calorie budget says profile needed

The app needs:

- age
- gender
- height
- weight
- goal
- activity

Make sure these are stored in `public.users` for the current user.

### Logout goes to the wrong page

Use the `Sign out` button. It clears Supabase session and redirects to `/`.

## Development Checklist

Before demo/submission:

1. Start backend:

```powershell
cd backend
uvicorn app.main:app --reload
```

2. Start frontend:

```powershell
cd frontend
npm start
```

3. Test:

- signup
- login
- save diet
- add food
- check recommendations
- change diet preference
- logout

4. Build frontend:

```powershell
npm run build
```
