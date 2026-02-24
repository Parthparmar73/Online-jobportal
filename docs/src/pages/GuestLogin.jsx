// src/pages/GuestLogin.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function GuestLogin() {
  const navigate = useNavigate();
  const [guest, setGuest] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) navigate("/login"); // if no guest data, back to login
    else setGuest(user);
  }, [navigate]);

  if (!guest) return <div>Loading guest info...</div>;

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>👋 Welcome, {guest.username}!</h1>
      <p>Email: {guest.email}</p>
      <img
        src={guest.profilePic}
        alt="Guest Avatar"
        width="100"
        height="100"
        style={{ borderRadius: "50%", marginTop: "10px" }}
      />
      <br /><br />
      <button onClick={() => navigate("/home")} style={{ padding: "10px 20px" }}>
        Continue to Dashboard →
      </button>
    </div>
  );
}
