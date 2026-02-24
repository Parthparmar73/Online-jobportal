import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/App.css';
import webVideo from './assets/web.mp4';
import Login from './pages/Login';
import LoginM from './pages/LoginM';
import Home from "./pages/Home";
import GuestLogin from "./pages/GuestLogin";
import Admin from "./pages/Admin";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Home Page */}
        <Route path="/" element={
          <div className="App">
            <video autoPlay muted loop className="video-bg">
              <source src={webVideo} type="video/mp4" />
              Your browser does not support HTML5 video.
            </video>
            <div className="overlay"></div>

            <div className="content">
              <h1 className="main-title">Online Job Portal</h1>
              <p className="sub-title">Welcome to My Website</p>
              <Link to="/login" className="btn btn-primary bt-custom">Get Started</Link>
            </div>
          </div>
        } />

        {/* Login Page */}
        <Route path="/login" element={<Login />} />

        {/* LoginM Page (Google button se open hoga) */}
        <Route path="/loginM" element={<LoginM />} />
        <Route path="/guest_login" element={<GuestLogin />} />
        <Route path="/home" element={<Home />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  );
}
