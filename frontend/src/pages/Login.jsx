// src/pages/Login.jsx
import React from "react";
import "../styles/Login.css";
import linkdinImg from "../assets/linkdin.png";
import googleImg from "../assets/google.png";
import guestImg from "../assets/guest.png";
import emailImg from "../assets/email.webp";
import buildingImg from "../assets/we3.jpeg";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

export default function Login() {
  const navigate = useNavigate(); // ✅ Step 1: Initialize navigation

  // ✅ Step 2: Define guest login logic here (before return)
  const handleGuestLogin = () => {
    const guestId = uuidv4().slice(0, 8); // unique short ID

    const guestUser = {
      id: guestId,
      username: `Guest_${guestId}`,
      email: `guest_${guestId}@example.com`,
      profilePic: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
    };

    localStorage.setItem("user", JSON.stringify(guestUser));
    navigate("/guest_login"); // redirect to guest dashboard
  };

  return (
    <div className="login-container container-fluid d-flex p-0">
      <div className="row flex-grow-1 w-100 no-gutters">
        {/* Left: Login Form */}
        <div className="col-md-6 col-left d-flex justify-content-center align-items-center">
          <div className="login-box text-center">
            <img src={linkdinImg} alt="LinkedIn" width="200" />
            <h2 className="mt-3">Welcome to your professional network</h2>

            <a href="/LoginM" className="btn login-btn google">
              <img src={googleImg} width="30" alt="Google"/> Continue with Google
            </a>

            <button
                 className="btn login-btn Guest"
                 onClick={() => handleGuestLogin()}
            >
              <img src={guestImg} width="30" alt="Guest"/> Continue as Guest
            </button>

            <a href="/LoginM" className="btn login-btn email">
              <img src={emailImg} width="30" alt="Email"/> Sign in with Email
            </a>

            <small className="text-muted d-block mt-3">
              By clicking Continue, you agree to our 
              <a href="#"> User Agreement</a>, 
              <a href="#"> Privacy Policy</a>, and 
              <a href="#"> Cookie Policy</a>.
            </small>
            <p className="mt-3">
              New to LinkedIn? <a href="/LoginM?mode=register">Sign up</a>
            </p>
          </div>
        </div>

        {/* Right: Background Image */}
<div className="col-md-6 left-panel position-relative p-0">
  <img src={buildingImg} alt="Welcome" className="w-100 h-100 object-cover" />

  {/* Black overlay div */}
  <div className="black-overlay"></div>

  <div className="overlay-text top-text">
    <h1>The future depends on what you do TODAY.</h1>
  </div>
</div>


      </div>
    </div>
  );
}
