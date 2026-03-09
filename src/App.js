import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import "./styles/Admin.css";

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Current session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="App">
      {!session ? <Login /> : <Dashboard session={session} />}
    </div>
  );
}

export default App;