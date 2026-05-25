import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { supabase } from "../supabaseClient";
import "./Dashboard.css";

const getTodayEntries = (items) => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return (items || []).filter((item) => {
    if (!item.created_at) return true;
    return new Date(item.created_at) >= start;
  });
};

const getDailyCalorieTarget = (profile) => {
  if (!profile) return { calories: 1800, bmi: null, label: "Profile needed" };

  const weight = Number(profile.weight);
  const height = Number(profile.height);
  const age = Number(profile.age);
  if (!weight || !height || !age) return { calories: 1800, bmi: null, label: "Profile needed" };

  const isFemale = String(profile.gender).toLowerCase() === "female";
  const base = 10 * weight + 6.25 * height - 5 * age + (isFemale ? -161 : 5);
  const activityMap = { Low: 1.2, Moderate: 1.45, High: 1.7 };
  const activity = activityMap[profile.activity] || 1.2;
  const bmi = weight / ((height / 100) ** 2);
  const goal = profile.goal || "Maintain Weight";

  let bmiOffset = 0;
  let label = "Healthy BMI";
  if (bmi < 18.5) {
    bmiOffset = 300;
    label = "Underweight BMI";
  } else if (bmi >= 25 && bmi < 30) {
    bmiOffset = -350;
    label = "Overweight BMI";
  } else if (bmi >= 30) {
    bmiOffset = -500;
    label = "High BMI";
  }

  const goalOffset = goal === "Lose Weight" ? -250 : goal === "Gain Weight" ? 250 : 0;
  const calories = Math.max(1200, Math.round(base * activity + bmiOffset + goalOffset));

  return { calories, bmi, label };
};

export default function Dashboard() {
  const navigate = useNavigate();

  const [food, setFood] = useState("");
  const [grams, setGrams] = useState(100);
  const [entries, setEntries] = useState([]);
  const [userId, setUserId] = useState(null);
  const [profile, setProfile] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [recommendationError, setRecommendationError] = useState("");
  const [savingDiet, setSavingDiet] = useState(false);

  const COLORS = ["#6fa8dc", "#2e8b68", "#ef815b"];

  useEffect(() => {
    const loadData = async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (!user) {
        setRecommendations([]);
        navigate("/");
        return;
      }
      setUserId(user.id);
      fetchFoods(user.id);
      fetchProfile(user.id);
      fetchRecommendations(user.id);
    };
    loadData();
  }, [navigate]);

  const fetchFoods = async (uid) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const res = await fetch(`http://127.0.0.1:8000/food/${uid}`, {
        headers: sessionData.session
          ? { Authorization: `Bearer ${sessionData.session.access_token}` }
          : {},
      });
      const data = await res.json();
      setEntries(data.data || []);
    } catch (err) {
      console.error(err);
      setEntries([]);
    }
  };

  const fetchProfile = async (uid) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const res = await fetch(`http://127.0.0.1:8000/auth/profile/${uid}`, {
        headers: sessionData.session
          ? { Authorization: `Bearer ${sessionData.session.access_token}` }
          : {},
      });
      const data = await res.json();
      const nextProfile = data.data || null;
      setProfile(nextProfile);
    } catch (err) {
      console.error(err);
      setProfile(null);
    }
  };

  const fetchRecommendations = async (uid) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const res = await fetch(`http://127.0.0.1:8000/food/recommendations/${uid}`, {
        headers: sessionData.session
          ? { Authorization: `Bearer ${sessionData.session.access_token}` }
          : {},
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || data.message || "Failed to load recommendations");
      }
      setRecommendations(data.data || []);
      setRecommendationError(data.warning || "");
    } catch (err) {
      console.error(err);
      setRecommendationError(err.message || "Failed to load recommendations");
      setRecommendations([]);
    }
  };

  const handleAdd = async () => {
    if (!food || !userId) return;
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      await fetch("http://127.0.0.1:8000/food/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(sessionData.session
            ? { Authorization: `Bearer ${sessionData.session.access_token}` }
            : {}),
        },
        body: JSON.stringify({ user_id: userId, food_name: food, grams: Number(grams) }),
      });
      fetchFoods(userId);
      fetchRecommendations(userId);
      setFood("");
      setGrams(100);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddRecommendation = async (rec) => {
    if (!userId) return;
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      await fetch("http://127.0.0.1:8000/food/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(sessionData.session
            ? { Authorization: `Bearer ${sessionData.session.access_token}` }
            : {}),
        },
        body: JSON.stringify({ user_id: userId, food_name: rec.food_name, grams: 100 }),
      });
      fetchFoods(userId);
      fetchRecommendations(userId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDietChange = async (e) => {
    const nextDiet = e.target.value;
    const nextProfile = {
      name: profile?.name || "",
      age: Number(profile?.age || 0),
      gender: profile?.gender || "Other",
      height: Number(profile?.height || 0),
      weight: Number(profile?.weight || 0),
      goal: profile?.goal || "Maintain Weight",
      health: profile?.health || "",
      allergies: profile?.allergies || "",
      diet: nextDiet,
      activity: profile?.activity || "Low",
    };

    setSavingDiet(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session || !userId) return;

      await supabase.auth.updateUser({
        data: nextProfile,
      });

      const res = await fetch("http://127.0.0.1:8000/auth/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
        body: JSON.stringify({ user_id: userId, ...nextProfile }),
      });
      const data = await res.json();
      setProfile(data.data || { id: userId, ...nextProfile });
      fetchRecommendations(userId);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingDiet(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/", { replace: true });
  };

  const todayEntries = getTodayEntries(entries);
  const dailyBudget = getDailyCalorieTarget(profile);
  const dailyTarget = dailyBudget.calories;
  const resetTime = new Date();
  resetTime.setDate(resetTime.getDate() + 1);
  resetTime.setHours(0, 0, 0, 0);
  const resetLabel = resetTime.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

  const totalCalories = todayEntries.reduce(
    (sum, item) => sum + Number(item.calories || 0), 0
  );
  const caloriesLeft = Math.max(0, dailyTarget - totalCalories);
  const calorieProgress = Math.min(100, Math.round((totalCalories / dailyTarget) * 100));

  const totalMacros = todayEntries.reduce(
    (acc, item) => {
      acc.carbs   += item.carbs   || 0;
      acc.protein += item.protein || 0;
      acc.fats    += item.fats    || 0;
      return acc;
    },
    { carbs: 0, protein: 0, fats: 0 }
  );

  const chartData = [
    { name: "Carbs",   value: totalMacros.carbs   },
    { name: "Protein", value: totalMacros.protein },
    { name: "Fats",    value: totalMacros.fats    },
  ];
  const hasMacroData = chartData.some((item) => item.value > 0);

  return (
    <div className="app-page dashboard-page">
      <div className="dashboard">
        <nav className="app-nav">
          <div className="app-nav-left">
            <span className="brand-mark">DB</span>
            <span>Diet Buddy</span>
          </div>
          <div className="app-nav-actions">
            <Link className="ghost-link" to="/diet">Log diet</Link>
            <button className="ghost-link" type="button" onClick={handleLogout}>
              Sign out
            </button>
          </div>
        </nav>

        <header className="dashboard-header">
          <div>
            <p className="eyebrow">Dashboard</p>
            <h1>Food tracker</h1>
          </div>
          <div className="metric-strip">
            <div className="metric">
              <span>Total calories</span>
              <strong>{totalCalories.toFixed(1)}</strong>
            </div>
            <div className="metric">
              <span>Left today</span>
              <strong>{caloriesLeft.toFixed(0)}</strong>
            </div>
            <div className="metric">
              <span>Recommendations</span>
              <strong>{recommendations.length}</strong>
            </div>
          </div>
        </header>

        <section className="calorie-budget">
          <div className="budget-header">
            <div>
              <h3>Daily eating budget</h3>
              <p>
                {dailyBudget.bmi ? `BMI ${dailyBudget.bmi.toFixed(1)} · ${dailyBudget.label}` : dailyBudget.label}
                {" · "}Resets at {resetLabel}.
              </p>
            </div>
            <strong>{totalCalories.toFixed(0)} / {dailyTarget} cal</strong>
          </div>
          <div className="budget-track" aria-label="Daily calorie progress">
            <span style={{ width: `${calorieProgress}%` }} />
          </div>
          <div className="diet-setting">
            <label htmlFor="dietType">Diet preference</label>
            <select
              id="dietType"
              value={profile?.diet || "Vegetarian"}
              onChange={handleDietChange}
              disabled={!userId || savingDiet}
            >
              <option>Vegetarian</option>
              <option>Non-Vegetarian</option>
              <option>Vegan</option>
            </select>
          </div>
        </section>

      {/* TOP SECTION */}
      <div className="top-section">

        <div className="tracker">
          <div className="section-heading">
            <h3>Add food</h3>
            <span>{userId ? "Ready" : "Login required"}</span>
          </div>
          <div className="tracker-controls">
            <input
              value={food}
              onChange={(e) => setFood(e.target.value)}
              placeholder="Food"
            />
            <input
              type="number"
              value={grams}
              onChange={(e) => setGrams(e.target.value)}
              placeholder="Grams"
            />
            <button onClick={handleAdd}>Add</button>
          </div>
          <ul>
            {todayEntries.length === 0 && (
              <li className="empty-row">
                <span>No foods logged yet</span>
                <strong>0 cal</strong>
              </li>
            )}
            {todayEntries.map((item, index) => (
              <li key={index}>
                <span>{item.food_name}</span>
                <strong>{item.grams}g · {item.calories} cal</strong>
              </li>
            ))}
          </ul>
        </div>

        <div className="chart">
          <div className="section-heading">
            <h3>Macros breakdown</h3>
            <span>grams</span>
          </div>
          <div className="chart-frame">
            {hasMacroData ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    outerRadius={92}
                    label
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-chart">
                <strong>No macro data yet</strong>
                <span>Add a food to build your breakdown.</span>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* RECOMMENDATIONS */}
      <div className="recommendations">
        <h3>Today's Top Recommendations</h3>
        {recommendationError && (
          <p className="rec-error">{recommendationError}</p>
        )}
        <div className="rec-grid">
          {recommendations.map((rec, index) => (
            <div key={rec.id} className="rec-card">
              <span className="rec-rank">#{index + 1}</span>
              <p className="rec-name">{rec.food_name}</p>
              <p className="rec-cal">{rec.calories} cal / 100g</p>
              <p className="rec-reason">{rec.reason}</p>
              <div className="rec-macros">
                <span className="macro-pill carb">C {rec.carbs}g</span>
                <span className="macro-pill protein">P {rec.protein}g</span>
                <span className="macro-pill fat">F {rec.fats}g</span>
              </div>
              <button
                className="rec-add-btn"
                onClick={() => handleAddRecommendation(rec)}
              >
                + Add to tracker
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* TABLE */}
      <div className="bottom">
        <div className="section-heading">
          <h3>Food log</h3>
          <span>{profile?.diet || "Diet"} · {totalCalories.toFixed(1)} calories</span>
        </div>
        <table>
          <thead>
            <tr>
              <th>Food</th>
              <th>Grams</th>
              <th>Calories</th>
            </tr>
          </thead>
          <tbody>
            {todayEntries.length === 0 && (
              <tr>
                <td colSpan="3">No food entries yet.</td>
              </tr>
            )}
            {todayEntries.map((item, index) => (
              <tr key={index}>
                <td>{item.food_name}</td>
                <td>{item.grams}g</td>
                <td>{item.calories}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      </div>
    </div>
  );
}
