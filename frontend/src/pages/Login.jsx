import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

const handleLogin = async (e) => {
  e.preventDefault();

  if (!formData.email || !formData.password) {
    alert("Email and password are required");
    return;
  }

  setLoading(true);

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    const user = data.user;

    // 🔥 STEP 2: Check if user has diet
    const res = await fetch(`http://127.0.0.1:8000/diet/${user.id}`);
    const dietData = await res.json();

    console.log("Diet data:", dietData);

    alert("Login successful!");

    // 🔥 STEP 3: Redirect based on data
    if (!dietData.data || dietData.data.length === 0) {
      // New user
      navigate("/diet");
    } else {
      // Existing user
      navigate("/dashboard");
    }

  } catch (err) {
    console.error(err);
    alert("Login failed");
  }

  setLoading(false);
};
  return (
    <div className="app-page auth-page">
      <section className="auth-art" aria-label="Prepared balanced meals">
        <div className="auth-brand">
          <span className="brand-mark">DB</span>
          <span>Diet Buddy</span>
        </div>

        <div className="auth-copy">
          <h1>Build a better plate.</h1>
          <p>Track meals, review macros, and keep your daily food choices clear without turning dinner into homework.</p>
        </div>

        <div className="auth-stat-row">
          <div className="auth-stat">
            <strong>4</strong>
            <span>daily meal slots</span>
          </div>
          <div className="auth-stat">
            <strong>3</strong>
            <span>macro groups</span>
          </div>
          <div className="auth-stat">
            <strong>1</strong>
            <span>simple tracker</span>
          </div>
        </div>
      </section>

      <main className="auth-panel">
        <div className="form-container">

        {/* Toggle */}
        <div className="form-toggle">
          <button className="active">Login</button>
          <Link to="/signup">
            <button>Signup</button>
          </Link>
        </div>

        {/* Form */}
        <form className="form" onSubmit={handleLogin}>
          <h2>Welcome back</h2>
          <p className="form-subtitle">Continue tracking your meals and calories.</p>

          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            onChange={handleChange}
          />

          <input
            type="password"
            name="password"
            placeholder="Enter your password"
            onChange={handleChange}
          />

          <button className="link-button" type="button">Forgot Password?</button>

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>

          <p>
            Not a member? <Link to="/signup">Signup now</Link>
          </p>
        </form>

      </div>
      </main>
    </div>
  );
}
