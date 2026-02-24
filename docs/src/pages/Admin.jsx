import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../styles/Admin.css";
import userImg from "../assets/user.jfif";
import { Modal, Button } from "react-bootstrap";

export default function Admin() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const view = searchParams.get("view");
  
  const [stats, setStats] = useState({});
  const [admin, setAdmin] = useState(null);
  // New states for loading & error
  const [loadingAdmin, setLoadingAdmin] = useState(true);
  const [adminError, setAdminError] = useState(null);
  const role = localStorage.getItem("role");
  const email = localStorage.getItem("email");
  const name = localStorage.getItem("name");

  // Route protection
  useEffect(() => {
    if (!role || role !== "admin") navigate("/loginM");
  }, [role, navigate]);
 
  // Fetch admin + stats
  useEffect(() => {
  async function fetchAdmin() {
    if (!email) return;
    try {
      const res = await axios.get(`http://localhost:5000/api/admin/info/${email}`);
      const data = res.data?.data || null;
      setAdmin(data);
    } catch (err) {
      console.error(err);
      setAdminError("Failed to fetch admin info");
    } finally {
      setLoadingAdmin(false);
    }
  }
  fetchAdmin();
}, [email]);

useEffect(() => {
  async function fetchStats() {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/stats");
      setStats(res.data);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  }
  fetchStats();
}, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/loginM");
  };

  const handleNavigate = (path) => {
    navigate(path);
    const query = path.split("?")[1];
    if (query) {
      const params = new URLSearchParams(query);
      setSearchParams(params);
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <div className="admin-sidebar">
        <div className="overlay"></div>
        <div className="profile-card">
          <img src={userImg} alt="Admin" />
          <p className="mt-2 fw-bold">{name}</p>
        </div>

        <nav className="nav flex-column mt-4 w-100 px-3">
          {[
            { path: "/admin", icon: "bi-speedometer2", label: "Dashboard" },
            { path: "/admin?view=add_user", icon: "bi-person-plus-fill", label: "Add User" },
            { path: "/admin?view=manage_users", icon: "bi-people-fill", label: "Manage Users" },
            { path: "/admin?view=add_news", icon: "bi-newspaper", label: "Add News" },
            { path: "/admin?view=manage_news", icon: "bi-journal-text", label: "Manage News" },
            { path: "/admin?view=job_app", icon: "bi-list-task", label: "Job Applications" },
            { path: "/admin?view=add_job", icon: "bi-briefcase-fill", label: "Add Job" },
            { path: "/admin?view=manage_jobs", icon: "bi-list-task", label: "Manage Jobs" },
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleNavigate(item.path)}
              className="nav-link text-white py-3 sidebar-link btn btn-link d-flex align-items-center justify-content-center"
            >
              <i className={`bi ${item.icon} me-2 fs-4`}></i>
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="admin-content p-4 w-100">
        {!view && <DashboardView stats={stats} admin={admin} name={name} handleLogout={handleLogout} />}
        {view === "add_user" && (
          <div className="card p-4 mb-4">
            <h3>Add New User</h3>
            <AddUserForm />
          </div>
        )}
        {view === "manage_users" && (
          <div className="card p-4">
            <h3>All Users</h3>
            <ManageUsers />
          </div>
        )}
        {view === "add_news" && (
          <div className="card p-4 mb-4">
            <h3>Add News</h3>
            <AddNewsForm />
          </div>
        )}
        {view === "manage_news" && (
          <div className="card p-4">
            <h3>Manage News</h3>
            <ManageNews />
          </div>
        )}
        {view === "add_job" && (
          <div className="card card-scrollable mb-4">
            <h3>Add Job</h3>
            <AddJobForm />
          </div>
        )}
        {view === "manage_jobs" && (
          <div className="card p-4">
            <h3>Manage Jobs</h3>
            <ManageJobs />
          </div>
        )}
        {view === "job_app" && (
  <div className="card p-4">
    <ManageJobApplications />
  </div>
)}

      </div>
    </div>
  );
}

// ---------------- DASHBOARD VIEW ----------------
function DashboardView({ stats, admin, name, handleLogout }) {
  return (
    <>
      {/* Welcome Section */}
      <div className="admin-welcome position-relative">
        <div className="admin-welcome-overlay"></div>
        <div className="admin-welcome-content text-center">
          <h1>Welcome, {name || "Admin"}!</h1>
          <p>Your admin overview is here</p>

          {/* Logout button inside welcome */}
          <div className="mt-3">
            <button className="btn btn-danger" onClick={handleLogout}>
              <i className="bi bi-box-arrow-right me-2"></i> Logout
            </button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="admin-stats-row mt-4">
        <div className="admin-stat-card">
          <i className="bi bi-people-fill text-primary"></i>
          <h6>Total Users</h6>
          <h3>{stats.users || 0}</h3>
        </div>
        <div className="admin-stat-card">
          <i className="bi bi-building text-danger"></i>
          <h6>Companies</h6>
          <h3>{stats.companies || 0}</h3>
        </div>
        <div className="admin-stat-card">
          <i className="bi bi-person-badge-fill text-warning"></i>
          <h6>Total Admins</h6>
          <h3>{stats.admins || 0}</h3>
        </div>
        <div className="admin-stat-card">
          <i className="bi bi-person-fill text-success"></i>
          <h6>Total Regular Users</h6>
          <h3>{stats.regulars || 0}</h3>
        </div>
      </div>

      {/* Admin Info */}
{admin ? (
  <div className="admin-info-card card shadow my-3">
    <div className="card-header">Logged In Admin Information</div>
    <div className="card-body row align-items-center">
      <div className="col-md-3 text-center">
        {admin.profilePic ? (
          <img src={admin.profilePic || "https://cdn-icons-png.flaticon.com/512/149/149071.png" } alt="Profile" style={{ width: '120px', borderRadius: '50%' }} />
        ) : (
          <i className="bi bi-person-circle text-secondary" style={{ fontSize: "120px" }}></i>
        )}
      </div>
      <div className="col-md-9">
        <p><strong>Name:</strong> {admin.name || "N/A"}</p>
        <p><strong>Email:</strong> {admin.email || "N/A"}</p>
        <p><strong>Role:</strong> {admin.role || "N/A"}</p>
        <p><strong>Joined:</strong> {admin.created_at ? new Date(admin.created_at).toLocaleDateString() : "N/A"}</p>
      </div>
    </div>
  </div>
) : (
  <p className="text-center my-3 text-muted">Loading admin info...</p>
)}

    </>
  );
}

// ---------------- ADD USER ----------------
function AddUserForm() {
  const [formData, setFormData] = useState({ fullname: "", email: "", password: "", role: "user" });
  const [message, setMessage] = useState("");

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/register", formData);
      setMessage("User added successfully!");
      setFormData({ fullname: "", email: "", password: "", role: "user" });
    } catch (err) {
      console.error(err);
      setMessage("Error adding user.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {message && <div className="alert alert-info">{message}</div>}
      <div className="mb-3">
        <label className="form-label">Full Name</label>
        <input type="text" name="fullname" className="form-control" value={formData.fullname} onChange={handleChange} required />
      </div>
      <div className="mb-3">
        <label className="form-label">Email</label>
        <input type="email" name="email" className="form-control" value={formData.email} onChange={handleChange} required />
      </div>
      <div className="mb-3">
        <label className="form-label">Password</label>
        <input type="password" name="password" className="form-control" value={formData.password} onChange={handleChange} required />
      </div>
      <div className="mb-3">
        <label className="form-label">Role</label>
        <select name="role" className="form-select" value={formData.role} onChange={handleChange}>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <button type="submit" className="btn btn-primary">Add User</button>
    </form>
  );
}

// ================== Manage Users ==================
function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/users");
        setUsers(res.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (loading) return <p>Loading users...</p>;

  return (
    <div className="p-3">
      <table className="table table-bordered table-hover mt-3">
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Full Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Created At</th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.fullname}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>{new Date(user.created_at).toLocaleDateString()}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center">No users found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// ================== Add News ==================
function AddNewsForm() {
  const [formData, setFormData] = useState({ title: "", description: "" });
  const [message, setMessage] = useState("");

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/news", formData);
      setMessage("News added successfully!");
      setFormData({ title: "", description: "" });
    } catch (err) {
      console.error(err);
      setMessage("Error adding news.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {message && <div className="alert alert-info">{message}</div>}
      <div className="mb-3">
        <label>Title</label>
        <input type="text" name="title" className="form-control" value={formData.title} onChange={handleChange} required />
      </div>
      <div className="mb-3">
        <label>Description</label>
        <textarea name="description" className="form-control" value={formData.description} onChange={handleChange} rows={5} required></textarea>
      </div>
      <button type="submit" className="btn btn-primary">Add News</button>
    </form>
  );
}

// ================== Manage News ==================
function ManageNews() {
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNews, setSelectedNews] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/news");
      setNewsList(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this news?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/news/${id}`);
      setNewsList(newsList.filter((item) => item.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete news");
    }
  };

  const handleEdit = async (id) => {
    const newsItem = newsList.find((item) => item.id === id);
    const newTitle = prompt("Edit title", newsItem.title);
    const newDescription = prompt("Edit description", newsItem.description);

    if (newTitle && newDescription) {
      try {
        await axios.put(`http://localhost:5000/api/news/${id}`, { title: newTitle, description: newDescription });
        fetchNews();
      } catch (err) {
        console.error(err);
        alert("Failed to update news");
      }
    }
  };

  const handleView = (news) => {
    setSelectedNews(news);
    setShowModal(true);
  };

  if (loading) return <p>Loading news...</p>;

  return (
    <>
      <div className="d-flex flex-wrap gap-3 justify-content-start" style={{ overflowX: "auto" }}>
        {newsList.map((news) => (
          <div key={news.id} style={{ minWidth: "80px", maxWidth: "240px", flex: "1 0 auto" }}>
            <div className="card h-100 shadow-sm">
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">{news.title}</h5>
                <p className="card-text text-truncate" style={{ maxHeight: "3em" }}>{news.description}</p>
                <div className="mt-auto d-flex justify-content-between">
                  <button className="btn btn-sm btn-info" onClick={() => handleView(news)}>View</button>
                  <button className="btn btn-sm btn-warning" onClick={() => handleEdit(news.id)}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(news.id)}>Delete</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>News Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedNews && (
            <div>
              <h5>{selectedNews.title}</h5>
              <p>{selectedNews.description}</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
// ================== Manage Job Applications ==================
function ManageJobApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);
  
  const fetchApplications = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/job_applications");
      setApplications(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching job applications:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [refresh]);
  // ------------------ ACCEPT APPLICATION ------------------
  const handleAccept = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/job_applications/accept/${id}`);
      alert("Application Accepted!");
      fetchApplications();
    } catch (err) {
      console.error("Accept failed:", err);
      alert("Failed to accept!");
    }
  };

  // ------------------ REJECT APPLICATION ------------------
  const handleReject = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/job_applications/reject/${id}`);
      alert("Application Rejected!");
      fetchApplications();
    } catch (err) {
      console.error("Reject failed:", err);
      alert("Failed to reject!");
    }
  };

  if (loading) return <p>Loading job applications...</p>;

  return (
    <div className="card p-3 mt-3 card-scrollable">
      <h3 className="mb-3">Job Applications</h3>
      <div style={{ maxHeight: "400px", overflowY: "auto" }}>
        <table className="table table-striped table-bordered align-middle">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Job ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Mobile</th>
              <th>Resume</th>
              <th>Applied On</th>
              {/*<th>Status</th>*/}
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {applications.length > 0 ? (
              applications.map((app) => (
                <tr key={app.id}>
                  <td>{app.id}</td>
                  <td>{app.job_id}</td>
                  <td>{app.name}</td>
                  <td>{app.email}</td>
                  <td>{app.mobile || "N/A"}</td>

                  <td>
                    {app.resume ? (
                      <a
                        href={`http://localhost:5000/uploads/${app.resume}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-outline-primary"
                      >
                        View Resume
                      </a>
                    ) : (
                      "No File"
                    )}
                  </td>

                  <td>
                    {app.applied_on
                      ? new Date(app.applied_on).toLocaleString()
                      : "N/A"}
                  </td>

                  {/* Status 
                  <td>
                    {app.status === "accepted" && (
                      <span className="badge bg-success">Accepted</span>
                    )}
                    {app.status === "rejected" && (
                      <span className="badge bg-danger">Rejected</span>
                    )}
                    {!app.status && (
                      <span className="badge bg-secondary">Pending</span>
                    )}
                  </td>*/}

                  {/* ACTION BUTTONS */}
                  <td>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => handleAccept(app.id)}
                        disabled={app.status === "accepted"}
                      >
                        Accept
                      </button>

                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleReject(app.id)}
                        disabled={app.status === "rejected"}
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="text-center">
                  No applications found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
const handleStatusChange = async (newStatus) => {
  await axios.post("http://localhost:8000/api/updateApplicationStatus", {
    id: selectedApplicant.id,
    status: newStatus,
  });

  // 🔥 application list refresh
  setRefresh((prev) => !prev);

  setShowStatusModal(false);
};

// ================== Add Job ==================
function AddJobForm() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    company: "",
    salary: "",
    total_vacancy: 1,
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/jobs", formData);
      setMessage("Job added successfully!");
      setFormData({ title: "", description: "", location: "", company: "", salary: "", total_vacancy: 1 });
    } catch (err) {
      console.error(err);
      setMessage("Error adding job");
    }
  };

  return (
    <div className="card p-4">
      {message && <div className="alert alert-info">{message}</div>}
      <form onSubmit={handleSubmit}>
        <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Job Title" required className="form-control mb-2" />
        <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" required className="form-control mb-2" rows={3} />
        <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="Location" className="form-control mb-2" />
        <input type="text" name="company" value={formData.company} onChange={handleChange} placeholder="Company" className="form-control mb-2" />
        <input type="text" name="salary" value={formData.salary} onChange={handleChange} placeholder="Salary" className="form-control mb-2" />
        <input type="number" name="total_vacancy" value={formData.total_vacancy} onChange={handleChange} placeholder="Total Vacancy" className="form-control mb-2" min={1} />
        <button type="submit" className="btn btn-primary">Add Job</button>
      </form>
    </div>
  );
}

// ================== Manage Jobs ==================
function ManageJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/jobs");
      setJobs(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this job?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/jobs/${id}`);
      setJobs(jobs.filter((j) => j.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete job");
    }
  };

  const handleView = (job) => {
    setSelectedJob(job);
    setEditData(job);
    setShowModal(true);
    setIsEditing(false);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData({ ...editData, [name]: value });
  };

  const handleSaveEdit = async () => {
    try {
      await axios.put(`http://localhost:5000/api/jobs/${editData.id}`, editData);
      fetchJobs();
      setIsEditing(false);
      setShowModal(false);
      alert("Job updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to update job");
    }
  };

  if (loading) return <p>Loading jobs...</p>;

  return (
    <>
      <div className="d-flex flex-wrap gap-4">
        {jobs.map((job) => (
          <div key={job.id} className="card shadow-sm" style={{ width: "250px", borderRadius: "12px" }}>
            <div className="card-body">
              <h5 className="card-title">{job.title}</h5>
              <p className="text-muted small mb-1"><i className="bi bi-building me-1"></i> {job.company}</p>
              <p className="text-muted small mb-1"><i className="bi bi-geo-alt me-1"></i> {job.location}</p>
              <p className="fw-bold text-success mb-2"><i className="bi bi-cash-coin me-1"></i> {job.salary}</p>
              <div className="d-flex justify-content-between">
                <button className="btn btn-sm btn-info" onClick={() => handleView(job)}>View</button>
                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(job.id)}>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{isEditing ? "Edit Job" : "Job Details"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedJob && !isEditing && (
            <>
              <h4>{selectedJob.title}</h4>
              <p>{selectedJob.description}</p>
              <p><strong>Company:</strong> {selectedJob.company}</p>
              <p><strong>Location:</strong> {selectedJob.location}</p>
              <p><strong>Salary:</strong> {selectedJob.salary}</p>
              <p><strong>Vacancy:</strong> {selectedJob.total_vacancy}</p>
              <p><strong>Posted:</strong> {new Date(selectedJob.created_at).toLocaleDateString()}</p>
            </>
          )}

          {isEditing && (
            <form>
              <input type="text" name="title" value={editData.title} onChange={handleEditChange} className="form-control mb-2" placeholder="Job Title" />
              <textarea name="description" value={editData.description} onChange={handleEditChange} className="form-control mb-2" rows={3} placeholder="Description" />
              <input type="text" name="company" value={editData.company} onChange={handleEditChange} className="form-control mb-2" placeholder="Company" />
              <input type="text" name="location" value={editData.location} onChange={handleEditChange} className="form-control mb-2" placeholder="Location" />
              <input type="text" name="salary" value={editData.salary} onChange={handleEditChange} className="form-control mb-2" placeholder="Salary" />
              <input type="number" name="total_vacancy" value={editData.total_vacancy} onChange={handleEditChange} className="form-control mb-2" min={1} placeholder="Total Vacancy" />
            </form>
          )}
        </Modal.Body>
        <Modal.Footer>
          {!isEditing ? (
            <>
              <Button variant="warning" onClick={() => setIsEditing(true)}>Edit</Button>
              <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
            </>
          ) : (
            <>
              <Button variant="success" onClick={handleSaveEdit}>Save</Button>
              <Button variant="secondary" onClick={() => setIsEditing(false)}>Cancel</Button>
            </>
          )}
        </Modal.Footer>
      </Modal>
    </>
  );
}
