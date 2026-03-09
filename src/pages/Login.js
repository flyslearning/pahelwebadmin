import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import { Lock, Mail, Eye, EyeOff, ShieldCheck } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) alert(error.message);
    setLoading(false);
  };

  // --- Inline Styles ---
  const styles = {
    screen: {
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #fdf2f5 0%, #fae1e8 100%)",
      fontFamily: "'Segoe UI', Roboto, sans-serif",
      padding: "20px",
    },
    card: {
      background: "rgba(255, 255, 255, 0.8)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      padding: "40px",
      borderRadius: "24px",
      boxShadow: "0 20px 40px rgba(229, 90, 123, 0.15)",
      width: "100%",
      maxWidth: "420px",
      border: "1px solid rgba(255, 255, 255, 0.5)",
      textAlign: "center",
    },
    iconWrapper: {
      width: "64px",
      height: "64px",
      background: "#e55a7b",
      borderRadius: "18px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      margin: "0 auto 24px",
      color: "#fff",
      boxShadow: "0 8px 16px rgba(229, 90, 123, 0.3)",
    },
    title: {
      fontSize: "28px",
      fontWeight: "700",
      color: "#2d3436",
      marginBottom: "8px",
      fontFamily: "'Zilla Slab', serif",
    },
    subtitle: {
      fontSize: "15px",
      color: "#636e72",
      marginBottom: "32px",
    },
    inputGroup: {
      position: "relative",
      marginBottom: "20px",
      textAlign: "left",
    },
    inputIcon: {
      position: "absolute",
      left: "16px",
      top: "50%",
      transform: "translateY(-50%)",
      color: "#e55a7b",
    },
    input: {
      width: "100%",
      padding: "14px 16px 14px 48px",
      borderRadius: "12px",
      border: "1px solid #eee",
      background: "#fff",
      fontSize: "16px",
      outline: "none",
      transition: "all 0.3s ease",
      boxSizing: "border-box",
    },
    eyeIcon: {
      position: "absolute",
      right: "16px",
      top: "50%",
      transform: "translateY(-50%)",
      cursor: "pointer",
      color: "#b2bec3",
    },
    button: {
      width: "100%",
      padding: "16px",
      borderRadius: "12px",
      border: "none",
      background: loading ? "#fab1a0" : "#e55a7b",
      color: "white",
      fontSize: "16px",
      fontWeight: "600",
      cursor: loading ? "not-allowed" : "pointer",
      transition: "transform 0.2s ease, box-shadow 0.2s ease",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "10px",
      marginTop: "10px",
    },
    footer: {
      marginTop: "24px",
      fontSize: "13px",
      color: "#b2bec3",
    }
  };

  return (
    <div style={styles.screen}>
      <div style={styles.card}>
        <div style={styles.iconWrapper}>
          <ShieldCheck size={32} />
        </div>
        
        <h2 style={styles.title}>Welcome Back</h2>
        <p style={styles.subtitle}>Secure Admin Access for PAHEL Shedule Ride Admin</p>

        <form onSubmit={handleLogin}>
          {/* Email Field */}
          <div style={styles.inputGroup}>
            <Mail size={18} style={styles.inputIcon} />
            <input 
              type="email" 
              placeholder="Admin Email" 
              style={styles.input}
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>

          {/* Password Field */}
          <div style={styles.inputGroup}>
            <Lock size={18} style={styles.inputIcon} />
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Password" 
              style={styles.input}
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
            <div onClick={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </div>
          </div>

          <button 
            type="submit" 
            style={styles.button}
            onMouseOver={(e) => !loading && (e.currentTarget.style.boxShadow = "0 8px 20px rgba(229, 90, 123, 0.4)")}
            onMouseOut={(e) => (e.currentTarget.style.boxShadow = "none")}
            disabled={loading}
          >
            {loading ? "Verifying..." : "Sign In to Dashboard"}
          </button>
        </form>

        <div style={styles.footer}>
          &copy; 2026 PAHEL Intelligence System. Confidential.
        </div>
      </div>
    </div>
  );
};

export default Login;