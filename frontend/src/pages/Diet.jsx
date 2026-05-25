import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function Diet() {
  const navigate = useNavigate();

  const [dietData, setDietData] = useState({
    breakfast: "",
    lunch: "",
    dinner: "",
    snacks: ""
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setDietData({ ...dietData, [e.target.name]: e.target.value });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/", { replace: true });
  };

  const handleSubmit = async () => {
    // ✅ Basic validation
    if (
      !dietData.breakfast &&
      !dietData.lunch &&
      !dietData.dinner &&
      !dietData.snacks
    ) {
      alert("Enter at least one meal");
      return;
    }

    setLoading(true);

    try {
      // 🔥 STEP 1: Get logged-in user
      const { data, error } = await supabase.auth.getUser();
      const { data: sessionData } = await supabase.auth.getSession();

      if (error || !data.user || !sessionData.session) {
        alert("You are not logged in");
        navigate("/");
        return;
      }

      const userId = data.user.id;

      // 🔥 STEP 2: Send data to backend
      const res = await fetch("http://127.0.0.1:8000/diet/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionData.session.access_token}`
        },
        body: JSON.stringify({
          user_id: userId,
          breakfast: dietData.breakfast,
          lunch: dietData.lunch,
          dinner: dietData.dinner,
          snacks: dietData.snacks
        })
      });

      const result = await res.json();

      // ❌ Backend error handling
      if (!res.ok) {
        console.error(result);
        alert(result.detail || result.message || "Failed to save diet");
        return;
      }

      console.log("Diet saved:", result);

      alert("Diet saved successfully!");

      // 🔥 STEP 3: Go to dashboard
      navigate("/dashboard");

    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }

    setLoading(false);
  };

  const filledMeals = Object.values(dietData).filter(Boolean).length;

  return (
    <div className="app-page diet-page">
      <div className="app-shell">
        <nav className="app-nav">
          <div className="app-nav-left">
            <span className="brand-mark">DB</span>
            <span>Diet Buddy</span>
          </div>
          <div className="app-nav-actions">
            <Link className="ghost-link" to="/dashboard">Dashboard</Link>
            <button className="ghost-link" type="button" onClick={handleLogout}>
              Sign out
            </button>
          </div>
        </nav>

        <main className="diet-layout">
          <section className="meal-card">
            <div className="meal-header">
              <div>
                <h1>Today's diet</h1>
                <p>Log what you ate today, then jump into your dashboard for totals.</p>
              </div>
              <span className="meal-badge">{filledMeals}/4 filled</span>
            </div>

            <div className="meal-grid">
              <div className="meal-field">
                <label htmlFor="breakfast">Breakfast</label>
                <input
                  id="breakfast"
                  name="breakfast"
                  placeholder="Oats, banana, milk"
                  onChange={handleChange}
                />
              </div>

              <div className="meal-field">
                <label htmlFor="lunch">Lunch</label>
                <input
                  id="lunch"
                  name="lunch"
                  placeholder="Rice, dal, salad"
                  onChange={handleChange}
                />
              </div>

              <div className="meal-field">
                <label htmlFor="dinner">Dinner</label>
                <input
                  id="dinner"
                  name="dinner"
                  placeholder="Paneer wrap"
                  onChange={handleChange}
                />
              </div>

              <div className="meal-field">
                <label htmlFor="snacks">Snacks</label>
                <input
                  id="snacks"
                  name="snacks"
                  placeholder="Nuts, fruit"
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="meal-actions">
              <button className="primary-btn" onClick={handleSubmit} disabled={loading}>
                {loading ? "Saving..." : "Save Diet"}
              </button>
            </div>
          </section>

          <aside className="daily-summary">
            <div className="summary-photo" aria-hidden="true" />
            <div className="summary-content">
              <h2>Daily check</h2>
              <div className="summary-list">
                <div className="summary-item">
                  <span>Meals logged</span>
                  <strong>{filledMeals}</strong>
                </div>
                <div className="summary-item">
                  <span>Remaining</span>
                  <strong>{4 - filledMeals}</strong>
                </div>
                <div className="summary-item">
                  <span>Status</span>
                  <strong>{filledMeals ? "In progress" : "Empty"}</strong>
                </div>
              </div>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}
