import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function Signup() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    height: "",
    weight: "",
    goal: "",
    health: "",
    allergies: "",
    diet: "",
    activity: "",
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      alert("Email and password are required");
      return;
    }

    setLoading(true);

    try {
      // 🔥 STEP 1: Supabase Signup
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            age: Number(formData.age),
            gender: formData.gender,
            height: Number(formData.height),
            weight: Number(formData.weight),
            goal: formData.goal,
            health: formData.health,
            allergies: formData.allergies,
            diet: formData.diet,
            activity: formData.activity
          }
        }
      });

      if (error) {
        alert(error.message);
        setLoading(false);
        return;
      }

      // ⚠️ Email confirmation case
      if (!data.session) {
        alert("Check your email to confirm signup!");
        setLoading(false);
        return;
      }

      const user = data.user;
      const token = data.session.access_token;

      // 🔥 STEP 2: Send profile to backend
      const res = await fetch("http://127.0.0.1:8000/auth/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: user.id,
          name: formData.name,
          age: Number(formData.age),
          gender: formData.gender,
          height: Number(formData.height),
          weight: Number(formData.weight),
          goal: formData.goal,
          health: formData.health,
          allergies: formData.allergies,
          diet: formData.diet,
          activity: formData.activity
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        alert(result.message || "Profile save failed");
        setLoading(false);
        return;
      }

      alert("Signup successful!");
      navigate("/diet");

    } catch (err) {
      console.error(err);
      alert("Signup failed");
    }

    setLoading(false);
  };

  return (
    <div className="app-page auth-page">
      <section className="auth-art" aria-label="Fresh balanced meal">
        <div className="auth-brand">
          <span className="brand-mark">DB</span>
          <span>Diet Buddy</span>
        </div>

        <div className="auth-copy">
          <h1>Start with your baseline.</h1>
          <p>Your profile helps Diet Buddy keep meals, goals, and activity in one tidy place.</p>
        </div>

        <div className="auth-stat-row">
          <div className="auth-stat">
            <strong>Goal</strong>
            <span>weight direction</span>
          </div>
          <div className="auth-stat">
            <strong>Diet</strong>
            <span>food preference</span>
          </div>
          <div className="auth-stat">
            <strong>Daily</strong>
            <span>meal tracking</span>
          </div>
        </div>
      </section>

      <main className="auth-panel">
      <div className="form-container wide">

        <div className="form-toggle">
          <Link to="/">
            <button>Login</button>
          </Link>
          <button className="active">Signup</button>
        </div>

        <form className="form" onSubmit={handleSignup}>
          <h2>Create account</h2>
          <p className="form-subtitle">Tell Diet Buddy what to optimize around.</p>

          <div className="form-grid">
            <input name="name" placeholder="Full Name" onChange={handleChange} />
            <input type="number" name="age" placeholder="Age" onChange={handleChange} />

            <select name="gender" onChange={handleChange}>
              <option value="">Gender</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>

            <input type="number" name="height" placeholder="Height (cm)" onChange={handleChange} />
            <input type="number" name="weight" placeholder="Weight (kg)" onChange={handleChange} />

            <select name="goal" onChange={handleChange}>
              <option value="">Goal</option>
              <option>Lose Weight</option>
              <option>Gain Weight</option>
              <option>Maintain Weight</option>
            </select>

            <input name="health" placeholder="Health Conditions" onChange={handleChange} />
            <input name="allergies" placeholder="Allergies" onChange={handleChange} />

            <select name="diet" onChange={handleChange}>
              <option value="">Diet Type</option>
              <option>Vegetarian</option>
              <option>Non-Vegetarian</option>
              <option>Vegan</option>
            </select>

            <select name="activity" onChange={handleChange}>
              <option value="">Activity Level</option>
              <option>Low</option>
              <option>Moderate</option>
              <option>High</option>
            </select>

            <input type="email" name="email" placeholder="Email" onChange={handleChange} />
            <input type="password" name="password" placeholder="Password" onChange={handleChange} />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Signing up..." : "Signup"}
          </button>
        </form>

      </div>
      </main>
    </div>
  );
}
