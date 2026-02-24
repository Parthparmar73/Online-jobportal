import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Modal, Button, Form, Card } from "react-bootstrap";
import "../styles/Userdashboard.css";

export default function Home() {
  const navigate = useNavigate();

  // ===== User State =====
  const [user, setUser] = useState({
    id: null,
    username: "",
    email: "",
    profilePic: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
  });

  // ===== Feed & News State =====
  const [posts, setPosts] = useState([]);
  const [news, setNews] = useState([]);
  const [jobs, setJobs] = useState([]);

  // ===== Modals =====
  const [showPostModal, setShowPostModal] = useState(false);
  const [postType, setPostType] = useState("post");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [showNewsModal, setShowNewsModal] = useState(false);
  const [selectedNews, setSelectedNews] = useState(null);

  const [showJobsModal, setShowJobsModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [viewJob, setViewJob] = useState(null);
  const [showApplyForm, setShowApplyForm] = useState(false);

  const [applicantName, setApplicantName] = useState("");
  const [applicantEmail, setApplicantEmail] = useState("");
  const [applicantMobile, setApplicantMobile] = useState("");
  const [resume, setResume] = useState(null);

  // ===== Notifications =====
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const fetchNotifications = async () => {
    if (!user?.id) return;
    try {
      const res = await axios.get(
        `http://localhost:5000/api/user/applications/${user.id}`
      );
      setNotifications(res.data);
    } catch (err) {
      console.error("Notifications fetch error:", err);
    }
  };

  // ===== Load user from localStorage =====
  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem("user"));
    if (loggedInUser) setUser(loggedInUser);
    else navigate("/login");
  }, [navigate]);

  // ===== Fetch notifications after user load =====
  useEffect(() => {
    if (user?.id) fetchNotifications();
  }, [user]);

  // ===== Fetch posts, news, jobs =====
  useEffect(() => {
    fetchPosts();
    fetchNews();
    fetchJobs();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/posts");
      setPosts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchNews = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/news");
      setNews(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchJobs = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/jobs");
      setJobs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // ===== Logout =====
  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  // ===== Post Modal Handlers =====
  const openPostModal = (type) => {
    setPostType(type);
    setShowPostModal(true);
  };
  const closePostModal = () => {
    setTitle("");
    setContent("");
    setPostType("post");
    setShowPostModal(false);
  };
  const handlePostSubmit = async () => {
    if (!content.trim()) return alert("Content cannot be empty!");
    try {
      await axios.post("http://localhost:5000/api/posts", {
        type: postType,
        title: title || null,
        content,
        user_id: user?.id,
      });
      closePostModal();
      fetchPosts();
    } catch (err) {
      console.error(err);
      alert("Error posting. Try again.");
    }
  };

  // ===== News Modal =====
  const openNewsModal = (newsItem) => {
    setSelectedNews(newsItem);
    setShowNewsModal(true);
  };
  const closeNewsModal = () => {
    setSelectedNews(null);
    setShowNewsModal(false);
  };

  // ===== Jobs Modal =====
  const openJobsModal = () => {
    setShowJobsModal(true);
    setViewJob(null);
    setShowApplyForm(false);
  };
  const closeJobsModal = () => {
    setShowJobsModal(false);
    setViewJob(null);
    setShowApplyForm(false);
    setSelectedJob(null);
    setApplicantName("");
    setApplicantEmail("");
    setApplicantMobile("");
    setResume(null);
  };
  const handleViewJob = (job) => {
    setViewJob(job);
    setShowApplyForm(false);
  };
  const handleApplyClick = (job) => {
    setSelectedJob(job);
    setShowApplyForm(true);
    setViewJob(null);
  };

  const handleJobApply = async (e) => {
    e.preventDefault();
    if (!applicantName || !applicantEmail)
      return alert("Name and Email are required");

    const formData = new FormData();
    formData.append("job_id", selectedJob?.id);
    formData.append("user_id", user?.id);
    formData.append("name", applicantName);
    formData.append("email", applicantEmail);
    formData.append("mobile", applicantMobile);
    if (resume) formData.append("resume", resume);

    try {
      await axios.post("http://localhost:5000/api/jobs/apply", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Applied successfully!");
      closeJobsModal();
      fetchNotifications(); // update notifications immediately
    } catch (err) {
      console.error(err);
      alert("Application failed.");
    }
  };

  return (
    <div className="dashboard">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-logo">
          Job<span>Connect</span>
        </div>
        <div className="navbar-links">
          <a href="/">🏠 Home</a>
          <button className="btn-outline" onClick={openJobsModal}>
            💼 Jobs
          </button>
          <button
            className="btn-outline"
            onClick={() => setShowNotifications(true)}
          >
            🔔 My Applications
          </button>
          <div className="navbar-user">
            <span className="username">{user.username}</span>
          </div>
          <button className="btn-yellow" onClick={handleLogout}>
            Logout
          </button>
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
          <div className="sidebar-banner">
            <img
              src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d"
              alt="banner"
            />
          </div>
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
            <div className="post-box-top">
              <img
                src={user.profilePic}
                alt="profile"
                className="profile-img-small"
              />
              <input
                type="text"
                placeholder="What's on your mind?"
                readOnly
                onClick={() => openPostModal("post")}
              />
            </div>
            <div className="post-box-actions">
              <button
                className="btn-outline"
                onClick={() => openPostModal("post")}
              >
                📝 Post
              </button>
              <button
                className="btn-outline"
                onClick={() => openPostModal("article")}
              >
                📄 Article
              </button>
              <button
                className="btn-outline"
                onClick={() => openPostModal("event")}
              >
                📅 Event
              </button>
            </div>
          </div>

          {/* Posts Feed */}
          {posts.length === 0 ? (
            <p>No posts yet.</p>
          ) : (
            posts.map((p) => (
              <div className="post" key={p.id}>
                <div className="post-header">
                  <img
                    src={
                      p.profilePic ||
                      "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                    }
                    alt={p.username}
                    className="profile-img-small"
                  />
                  <h4>{p.username || "Anonymous"}</h4>
                  <small>
                    {new Date(p.created_at).toLocaleString()}
                  </small>
                </div>
                {p.title && <h5>{p.title}</h5>}
                <p>{p.content}</p>
                <hr />
              </div>
            ))
          )}
        </main>

        {/* Right Sidebar */}
        <aside className="sidebar-right">
          <h3 className="section-title">LinkedIn News</h3>
          {news.map((n) => (
            <div className="news-item" key={n.id}>
              <p className="news-title">{n.title}</p>
              <p className="news-date">
                {new Date(n.created_at).toLocaleDateString()}
              </p>
              <p>{n.description.slice(0, 50)}...</p>
              <a href="#!" onClick={() => openNewsModal(n)}>
                Read more
              </a>
            </div>
          ))}
        </aside>
      </div>

      {/* Post Modal */}
      <Modal show={showPostModal} onHide={closePostModal} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            Create {postType.charAt(0).toUpperCase() + postType.slice(1)}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: "60vh", overflowY: "auto" }}>
          <Form>
            {(postType === "article" || postType === "event") && (
              <Form.Group className="mb-2">
                <Form.Label>Title</Form.Label>
                <Form.Control
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter title"
                />
              </Form.Group>
            )}
            <Form.Group className="mb-2">
              <Form.Label>Content</Form.Label>
              <Form.Control
                as="textarea"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write something..."
                rows={8}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closePostModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handlePostSubmit}>
            Post
          </Button>
        </Modal.Footer>
      </Modal>

      {/* News Modal */}
      <Modal show={showNewsModal} onHide={closeNewsModal}>
        <Modal.Header closeButton>
          <Modal.Title>{selectedNews?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{selectedNews?.description}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeNewsModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Notifications Modal */}
      <Modal
        show={showNotifications}
        onHide={() => setShowNotifications(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>My Job Applications</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {notifications.length === 0 ? (
            <p>No applications yet.</p>
          ) : (
            notifications.map((n, index) => (
              <div
                key={index}
                className="notification mb-2 p-2 border rounded"
              >
                Status: {n.status || "pending"} <br />
                {n.resume && (
                  <a
                    href={`http://localhost:5000/uploads/${n.resume}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View Resume
                  </a>
                )}
              </div>
            ))
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => setShowNotifications(false)}>Close</Button>
        </Modal.Footer>
      </Modal>

      {/* Jobs Modal */}
      <Modal size="lg" show={showJobsModal} onHide={closeJobsModal}>
        <Modal.Header closeButton>
          <Modal.Title>Available Jobs</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: "60vh", overflowY: "auto" }}>
          {!viewJob && !showApplyForm ? (
            jobs.map((job) => (
              <Card key={job.id} className="mb-3 shadow-sm">
                <Card.Body>
                  <Card.Title>{job.title}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">
                    {job.company} | {job.location}
                  </Card.Subtitle>
                  <Card.Text>
                    <strong>Vacancies:</strong> {job.total_vacancy} <br />
                    <strong>Salary:</strong> {job.salary} <br />
                    {job.description.slice(0, 100)}...
                  </Card.Text>
                  <Button
                    size="sm"
                    variant="info"
                    onClick={() => handleViewJob(job)}
                    className="me-2"
                  >
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => handleApplyClick(job)}
                  >
                    Apply Now
                  </Button>
                </Card.Body>
              </Card>
            ))
          ) : viewJob ? (
            <Card className="shadow-sm">
              <Card.Body>
                <Card.Title>{viewJob.title}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">
                  {viewJob.company} | {viewJob.location}
                </Card.Subtitle>
                <Card.Text>
                  <strong>Vacancies:</strong> {viewJob.total_vacancy} <br />
                  <strong>Salary:</strong> {viewJob.salary} <br />
                  <br />
                  {viewJob.description}
                </Card.Text>
                <Button variant="secondary" onClick={() => setViewJob(null)}>
                  Back to Jobs
                </Button>
              </Card.Body>
            </Card>
          ) : showApplyForm ? (
            <Form onSubmit={handleJobApply}>
              <h5>Apply for {selectedJob?.title}</h5>
              <Form.Group className="mb-2">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  value={applicantEmail}
                  onChange={(e) => setApplicantEmail(e.target.value)}
                  type="email"
                  required
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Mobile</Form.Label>
                <Form.Control
                  value={applicantMobile}
                  onChange={(e) => setApplicantMobile(e.target.value)}
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Resume</Form.Label>
                <Form.Control
                  type="file"
                  onChange={(e) => setResume(e.target.files[0])}
                />
              </Form.Group>
              <Modal.Footer>
                <Button variant="secondary" onClick={closeJobsModal}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Submit
                </Button>
              </Modal.Footer>
            </Form>
          ) : null}
        </Modal.Body>
      </Modal>
    </div>
  );
}
