import React, { useEffect, useState } from "react";
import "./Userdashboard.css";

export default function Userdashboard() {
  const [user, setUser] = useState({
    username: "",
    email: "",
    profilePic: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
  });

  useEffect(() => {
    // Get logged-in user info from localStorage
    const loggedInUser = JSON.parse(localStorage.getItem("user"));
    if (loggedInUser) {
      setUser(loggedInUser);
    }
  }, []);

  return (
    <div className="dashboard">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-logo">
          Job<span>Connect</span>
        </div>
        <div className="navbar-links">
          <a href="/">🏠 Home</a>
          <a href="/jobs">💼 Jobs</a>
          <a href="#">Notification</a>
          <div className="navbar-user">
            <span className="username">{user.username}</span> ⬇️
          </div>
          <button className="btn-outline">+ Add Business</button>
          <button className="btn-yellow">Try Premium for ₹0</button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="main-content">
        {/* Left Sidebar */}
        <aside className="sidebar-left">
          <img
            src={user.profilePic}
            alt="profile"
            className="profile-img"
          />
          <h2>{user.username}</h2>
          <p className="email">{user.email}</p>
          <hr />
          <p className="section-title">👥 Connections</p>
          <a href="#">Connect with alumni</a>
          <hr />
          <p className="hint-text">Access exclusive tools & insights</p>
          <button className="btn-yellow full-width">Try Premium for ₹0</button>
        </aside>

        {/* Feed */}
        <main className="feed">
          <div className="banner">
            <img
              src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d"
              alt="banner"
              className="banner-img"
            />
            <h2 className="banner-text">Hi {user.username}!</h2>
          </div>

          {/* Post Box */}
          <div className="post-box">
            <input type="text" placeholder="Start a post" />
            <div className="post-actions">
              <button>📷 Media</button>
              <button>📅 Event</button>
              <button>✍️ Write article</button>
            </div>
          </div>

          {/* Example Post */}
          <div className="post">
            <h3>pooja</h3>
            <p className="company">Atlassian</p>
            <p>
              Jira’s pre-built templates for any type of work or team help
              projects start faster and finish on time.
            </p>
            <img
              src="https://images.unsplash.com/photo-1519389950473-47ba0277781c"
              alt="post"
              className="post-img"
            />
          </div>
        </main>

        {/* Right Sidebar */}
        <aside className="sidebar-right">
          <h3 className="section-title">LinkedIn News</h3>
          <div className="news-item">
            <p className="news-title">MintLounge</p>
            <p className="news-date">Sep 14, 2025</p>
            <p>👜 Many young professionals in India are...</p>
            <a href="#">Read more</a>
          </div>
          <div className="news-item">
            <p className="news-title">India’s Talent Landscape</p>
            <p className="news-date">Sep 14, 2025</p>
            <p>India’s talent market is reshaped by trends...</p>
            <a href="#">Read more</a>
          </div>
          <div className="news-item">
            <p className="news-title">Premium Smartphone Growth</p>
            <p className="news-date">Sep 14, 2025</p>
            <p>Apple and Samsung defied the slowdown...</p>
            <a href="#">Read more</a>
          </div>
        </aside>
      </div>
    </div>
  );
}
