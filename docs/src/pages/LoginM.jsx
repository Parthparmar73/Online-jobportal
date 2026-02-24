// src/pages/LoginM.jsx
import React, { useState } from "react";
import axios from "axios";

import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

import logo from "../assets/linkdin.png";
import webVideo from "../assets/web.mp4";
import cityBg from "../assets/building1.jpg";

const eyeIcon = "https://cdn-icons-png.flaticon.com/512/709/709612.png";

export default function LoginM() {
  const [currentForm, setCurrentForm] = useState("login"); // login, register, forgot
  const [step, setStep] = useState(1); // forgot password step
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  
  const navigate = useNavigate();

  const togglePassword = () => setPasswordVisible(!passwordVisible);
  const toggleConfirmPassword = () => setConfirmPasswordVisible(!confirmPasswordVisible);

  // ================= LOGIN HANDLER =================
  const handleLogin = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      const res = await axios.post("http://localhost:5000/login", { email, password });

      if (res.data.status === "success") {
        localStorage.setItem("name", res.data.fullname);
        localStorage.setItem("email", res.data.email);
        localStorage.setItem("role", res.data.role);
        const userData = {
          id: res.data.id,
          username: res.data.fullname,
          email: res.data.email,
          profilePic: res.data.profilePic || "https://cdn-icons-png.flaticon.com/512/149/149071.png",
        };
        localStorage.setItem("user", JSON.stringify(userData));
        alert(`Welcome ${res.data.fullname}`);
        if (res.data.role === "admin") navigate("/admin");
        else navigate("/home");
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      console.log(err);
      alert("Server error");
    }
  };

  // ================= REGISTER HANDLER =================
  const handleRegister = async (e) => {
    e.preventDefault();
    const fullname = e.target.fullname.value;
    const email = e.target.email.value;
    const password = e.target.password.value;
    const confirm = e.target.confirm.value;
    const role = e.target.role.value;

    if (password !== confirm) {
      alert("Passwords do not match");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/register", { fullname, email, password, role });
      if (res.data.status === "success") {
        alert("Registered successfully!");
        setCurrentForm("login");
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      console.log(err);
      alert("Server error");
    }
  };

  // ================= FORGOT PASSWORD - STEP 1: SEND OTP =================
  const handleSendOtp = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/send-otp", { email: userEmail });
      if (res.data.status === "success") {
        alert("OTP sent to your email!");
        setStep(2); // move to OTP + new password
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      console.log(err);
      alert("Server error");
    }
  };

  // ================= FORGOT PASSWORD - STEP 2: RESET PASSWORD =================
  const handleResetPassword = async (e) => {
    e.preventDefault();
    const otp = e.target.otp.value;
    const newPassword = e.target.newPassword.value;

    try {
      const res = await axios.post("http://localhost:5000/verify-otp-reset", {
        email: userEmail,
        otp,
        newPassword
      });
      if (res.data.status === "success") {
        alert("Password updated successfully!");
        setCurrentForm("login");
        setStep(1);
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      console.log(err);
      alert("Server error");
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center vh-100 position-relative overflow-hidden">
      {/* Background Video */}
      <video autoPlay muted loop className="position-absolute w-100 h-100" style={{ objectFit: "cover", zIndex: -1 }}>
        <source src={webVideo} type="video/mp4" />
      </video>
      <div className="position-absolute w-100 h-100" style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: -1 }} />

      <div className="login-container d-flex shadow-lg rounded-4 overflow-hidden position-relative z-1">
        {/* LEFT PANEL */}
        <div className="left-panel d-flex flex-column justify-content-center text-white"
             style={{ width: "85%", padding: "40px", height: "550px", backgroundImage: `url(${cityBg})`, backgroundSize: "cover", backgroundPosition: "center", position: "relative" }}>
          <div className="position-absolute w-100 h-100" style={{ backgroundColor: "rgba(0,0,0,0.5)", top: 0, left: 0 }} />
          <div className="position-relative">
            <h1 className="fw-bold">
              {currentForm === "register" ? "HELLO FRIEND!" : currentForm === "forgot" ? "FORGOT PASSWORD" : "WELCOME BACK"}
            </h1>
            <p className="fs-5">
              {currentForm === "register" ? "Fill up your details and join us!" : currentForm === "forgot" ? "Reset your password using OTP" : "Nice to see you again!"}
            </p>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="right-panel bg-white p-4 d-flex flex-column justify-content-center"
             style={{ width: "500px", padding: "40px", height: "550px" }}>
          <div className="text-center mb-3">
            <img src={logo} alt="Logo" width={70} />
            <h4 className="mt-2">
              {currentForm === "register" ? "Register Account" : currentForm === "forgot" ? "Reset Password" : "Login Account"}
            </h4>
          </div>

          {/* LOGIN FORM */}
          {currentForm === "login" && (
            <form onSubmit={handleLogin}>
              <input name="email" type="email" className="form-control mb-3" placeholder="Email ID" required />
              <div className="mb-3 position-relative">
                <input name="password" type={passwordVisible ? "text" : "password"} className="form-control" placeholder="Enter Password" required />
                <img src={eyeIcon} alt="toggle" className="position-absolute end-0 top-50 translate-middle-y me-2" style={{ width: "20px", cursor: "pointer" }} onClick={togglePassword} />
              </div>
              <div className="mb-3 form-check">
                <input type="checkbox" className="form-check-input" id="remember" />
                <label htmlFor="remember" className="form-check-label">Remember me</label>
              </div>
              <button type="submit" className="btn btn-primary w-100 mb-2">Login</button>
              <div className="text-center">
                <a href="#" onClick={() => setCurrentForm("forgot")} className="small me-2">Forgot Password?</a> |
                <a href="#" onClick={() => setCurrentForm("register")} className="small ms-2">Register</a>
              </div>
            </form>
          )}

          {/* REGISTER FORM */}
          {currentForm === "register" && (
            <form onSubmit={handleRegister}>
              <input name="fullname" type="text" className="form-control mb-3" placeholder="Full Name" required />
              <input name="email" type="email" className="form-control mb-3" placeholder="Email" required />
              <div className="mb-3 position-relative">
                <input name="password" type={passwordVisible ? "text" : "password"} className="form-control" placeholder="Create Password" required />
                <img src={eyeIcon} alt="toggle" className="position-absolute end-0 top-50 translate-middle-y me-2" style={{ width: "20px", cursor: "pointer" }} onClick={togglePassword} />
              </div>
              <div className="mb-3 position-relative">
                <input name="confirm" type={confirmPasswordVisible ? "text" : "password"} className="form-control" placeholder="Confirm Password" required />
                <img src={eyeIcon} alt="toggle" className="position-absolute end-0 top-50 translate-middle-y me-2" style={{ width: "20px", cursor: "pointer" }} onClick={toggleConfirmPassword} />
              </div>
              <select name="role" className="form-control mb-3" required>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              <div className="form-check mb-3">
                <input type="checkbox" className="form-check-input" id="agree" required />
                <label htmlFor="agree" className="form-check-label">I Agree to Terms and Conditions</label>
              </div>
              <button type="submit" className="btn btn-success w-100 mb-2">Register</button>
              <div className="mt-2 text-center">
                <a href="#" onClick={() => setCurrentForm("login")}>← Back to Login</a>
              </div>
            </form>
          )}

          {/* FORGOT PASSWORD FORM */}
          {currentForm === "forgot" && (
            <form onSubmit={step === 1 ? handleSendOtp : handleResetPassword}>
              {step === 1 && (
                <>
                  <input
                    type="email"
                    className="form-control mb-3"
                    placeholder="Enter your email"
                    required
                    onChange={(e) => setUserEmail(e.target.value)}
                  />
                  <button type="submit" className="btn btn-primary w-100 mb-2">Send OTP</button>
                </>
              )}

              {step === 2 && (
                <>
                  <input name="otp" type="text" className="form-control mb-3" placeholder="Enter OTP" required />
                  <div className="mb-3 position-relative">
                    <input
                      name="newPassword"
                      type={passwordVisible ? "text" : "password"}
                      className="form-control"
                      placeholder="Enter new password"
                      required
                    />
                    <img src={eyeIcon} alt="toggle" className="position-absolute end-0 top-50 translate-middle-y me-2" style={{ width: "20px", cursor: "pointer" }} onClick={togglePassword} />
                  </div>
                  <button type="submit" className="btn btn-warning w-100 mb-2">Reset Password</button>
                </>
              )}

              <div className="mt-2 text-center">
                <a href="#" onClick={() => { setCurrentForm("login"); setStep(1); }}>← Back to Login</a>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
