const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");
const multer = require("multer");

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "src/frontend/assets")));

// ================= Database =================
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "advweb",
});

db.connect((err) => {
  if (err) console.error("DB connection failed:", err);
  else console.log("DB connected");
});

// ================= Multer =================
const uploadDir = path.join(__dirname, "src/frontend/assets");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + "_" + file.originalname),
});
const upload = multer({ storage });

// ================= REGISTER =================
app.post("/register", async (req, res) => {
  const { fullname, email, password, role } = req.body;
  db.query("SELECT * FROM users WHERE email=?", [email], async (err, result) => {
    if (err) return res.json({ status: "error", message: "DB error" });
    if (result.length > 0) return res.json({ status: "error", message: "Email exists" });

    try {
      const hashed = await bcrypt.hash(password, 10);
      db.query(
        "INSERT INTO users (fullname,email,password,role,created_at) VALUES (?,?,?,?,NOW())",
        [fullname, email, hashed, role || "user"],
        (err2) => {
          if (err2) return res.json({ status: "error", message: "Registration failed" });
          res.json({ status: "success", message: "Registered successfully" });
        }
      );
    } catch (hashErr) {
      res.json({ status: "error", message: "Password hashing failed" });
    }
  });
});

// ================= LOGIN =================
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  db.query("SELECT * FROM users WHERE email=?", [email], async (err, result) => {
    if (err) return res.json({ status: "error", message: "DB error" });
    if (result.length === 0) return res.json({ status: "error", message: "User not found" });

    const user = result[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.json({ status: "error", message: "Invalid password" });

    res.json({ status: "success",id: user.id, fullname: user.fullname, email: user.email, role: user.role });
  });
});

// ================= GET USERS =================
app.get("/api/users", (req, res) => {
  db.query("SELECT id, fullname, email, role, created_at FROM users", (err, result) => {
    if (err) return res.json({ status: "error", message: "DB error" });
    console.log("Users fetched from DB:", result); // 🔹 Add this
    res.json(result);
  });
});

app.get("/api/admin/info/:email", (req, res) => {
  const { email } = req.params;

  db.query(
    "SELECT id, fullname AS name, email, role, created_at, profilePic FROM users WHERE email=? AND role='admin'",
    [email],
    (err, result) => {
      if (err) {
        console.error("Admin Info Fetch Error:", err);
        return res.status(500).json({ status: "error", message: "DB error" });
      }

      if (result.length === 0) {
        return res.status(404).json({ status: "error", message: "Admin not found" });
      }

      res.json({ status: "success", data: result[0] });
    }
  );
});

// ================= ADMIN STATS =================
app.get("/api/admin/stats", (req, res) => {
  const sql = `
    SELECT
      (SELECT COUNT(*) FROM users WHERE role='user') AS users,
      (SELECT COUNT(*) FROM users WHERE role='admin') AS admins,
      (SELECT COUNT(*) FROM jobs) AS companies
  `;
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ status: "error", message: "Stats error" });
    res.json(result[0]);
  });
});
// ================= ADD POST / ARTICLE / EVENT =================
app.post("/api/posts", (req, res) => {
  console.log("🔥 POST API Hit!");
  console.log("Request body:", req.body);

  const { user_id, type, title, content } = req.body;

  if (!type || !content) {
    return res.status(400).json({ status: "error", message: "Type and content required", received: req.body });
  }

  // Agar user_id nahi hai to NULL daal do
  const sql = "INSERT INTO posts (user_id, type, title, content, created_at) VALUES (?, ?, ?, ?, NOW())";

  db.query(sql, [user_id || null, type, title || null, content], (err, result) => {
  if (err) {
    console.error("Insert Post Error:", err);
    return res.status(500).json({ status: "error", message: "Failed to add post" });
  }
  res.json({ status: "success", message: "Post added", postId: result.insertId });
});
});

// ================= GET POSTS =================
app.get("/api/posts", (req, res) => {
  const sql = `
  SELECT p.id, p.user_id, p.type, p.title, p.content, p.created_at,
         u.fullname AS username, u.profilePic
  FROM posts p
  LEFT JOIN users u ON p.user_id = u.id
  ORDER BY p.created_at DESC
`;


  db.query(sql, (err, result) => {
    if (err) {
      console.error("Fetch Posts Error:", err);
      return res.status(500).json({ status: "error", message: "Failed to fetch posts" });
    }
    res.json(result);
  });
});


// ================= JOBS ROUTES =================

// Add Job
app.post("/api/jobs", upload.single("image"), (req, res) => {
  const { title, description, location, company, salary, total_vacancy } = req.body;
  const image = req.file ? req.file.filename : null;

  const sql = `
    INSERT INTO jobs
    (title, description, location, company, salary, total_vacancy, image, posted_on)
    VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
  `;

  db.query(
    sql,
    [title, description, location || null, company || null, salary || null, total_vacancy || 1, image],
    (err) => {
      if (err) {
        console.error("DB Insert Error:", err);
        return res.status(500).json({ status: "error", message: "Failed to add job" });
      }
      res.json({ status: "success", message: "Job added successfully" });
    }
  );
});

// Get all jobs
app.get("/api/jobs", (req, res) => {
  db.query("SELECT * FROM jobs ORDER BY posted_on DESC", (err, result) => {
    if (err) return res.status(500).json({ status: "error", message: "Failed to fetch jobs" });
    res.json(result);
  });
});

// Delete job
app.delete("/api/jobs/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM jobs WHERE id=?", [id], (err) => {
    if (err) return res.status(500).json({ status: "error", message: "Delete failed" });
    res.json({ status: "success", message: "Job deleted" });
  });
});

// Update job company (example)
app.put("/api/jobs/:id", (req, res) => {
  const { id } = req.params;
  const { company } = req.body;
  db.query("UPDATE jobs SET company=? WHERE id=?", [company, id], (err) => {
    if (err) return res.status(500).json({ status: "error", message: "Update failed" });
    res.json({ status: "success", message: "Job updated" });
  });
});
// ====== FORGOT PASSWORD ======
app.post("/forgot-password", async (req, res) => {
  const { email, newPassword } = req.body;
  if (!email || !newPassword) return res.json({ status: "error", message: "Email and new password required" });

  db.query("SELECT * FROM users WHERE email=?", [email], async (err, result) => {
    if (err) return res.json({ status: "error", message: "DB error" });
    if (result.length === 0) return res.json({ status: "error", message: "User not found" });

    try {
      const hashed = await bcrypt.hash(newPassword, 10);
      db.query("UPDATE users SET password=? WHERE email=?", [hashed, email], (err2) => {
        if (err2) return res.json({ status: "error", message: "Password update failed" });
        res.json({ status: "success", message: "Password updated successfully" });
      });
    } catch (hashErr) {
      res.json({ status: "error", message: "Password hashing failed" });
    }
  });
});
// ================= ADD NEWS =================
app.post("/api/news", (req, res) => {
  const { title, description } = req.body;

  if (!title || !description) {
    return res.status(400).json({ status: "error", message: "Title and description required" });
  }

  db.query(
    "INSERT INTO news (title, description, created_at) VALUES (?, ?, NOW())",
    [title, description],
    (err) => {
      if (err) {
        console.error("DB Insert Error:", err);
        return res.status(500).json({ status: "error", message: "Failed to add news" });
      }
      res.json({ status: "success", message: "News added successfully" });
    }
  );
});


// ================= GET NEWS =================
app.get("/api/news", (req, res) => {
  db.query("SELECT * FROM news ORDER BY created_at DESC", (err, result) => {
    if (err) {
      console.error("Fetch News Error:", err);
      return res.status(500).json({ status: "error", message: "Failed to fetch news" });
    }
    res.json(result);
  });
});

// ================= DELETE NEWS =================
app.delete("/api/news/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM news WHERE id=?", [id], (err) => {
    if (err) {
      console.error("Delete News Error:", err);
      return res.status(500).json({ status: "error", message: "Failed to delete news" });
    }
    res.json({ status: "success", message: "News deleted" });
  });
});

// ================= UPDATE NEWS =================
app.put("/api/news/:id", (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;

  if (!title || !description) {
    return res.status(400).json({ status: "error", message: "Title and description required" });
  }

  db.query("UPDATE news SET title=?, description=? WHERE id=?", [title, description, id], (err) => {
    if (err) {
      console.error("Update News Error:", err);
      return res.status(500).json({ status: "error", message: "Failed to update news" });
    }
    res.json({ status: "success", message: "News updated successfully" });
  });
});
//=======================admin info==============
// ================= ADMIN INFO (Get admin details by email) =================
app.get("/api/admin/info/:email", (req, res) => {
  const { email } = req.params;

  db.query(
    "SELECT id, fullname AS name, email, role, created_at, profilePic FROM users WHERE email=? AND role='admin'",
    [email],
    (err, result) => {
      if (err) {
        console.error("Admin Info Fetch Error:", err);
        return res.status(500).json({ status: "error", message: "DB error" });
      }

      if (result.length === 0) {
        return res.status(404).json({ status: "error", message: "Admin not found" });
      }

      res.json({ status: "success", data: result[0] });
    }
  );
});
// ================= JOB APPLICATION =================
app.post("/api/jobs/apply", upload.single("resume"), (req, res) => {
  console.log("🔥 Job Application API Hit!");
  console.log("Body:", req.body);

  const { job_id, name, email, mobile } = req.body;
  const resumeFile = req.file ? req.file.filename : null;

  if (!job_id || !name || !email) {
    return res.status(400).json({ status: "error", message: "Missing required fields" });
  }

  const sql = `
    INSERT INTO job_applications (job_id, name, email, mobile, resume, applied_on)
    VALUES (?, ?, ?, ?, ?, NOW())
  `;

  db.query(sql, [job_id, name, email, mobile || null, resumeFile], (err) => {
    if (err) {
      console.error("Job Application Insert Error:", err);
      return res.status(500).json({ status: "error", message: "Failed to apply" });
    }
    res.json({ status: "success", message: "Application submitted successfully" });
  });
});
//const nodemailer = require("nodemailer");



// ================= ACCEPT APPLICATION =================
app.put("/api/job_applications/accept/:id", (req, res) => {
  const { id } = req.params;

  const sql = "UPDATE job_applications SET status='accepted' WHERE id=?";
  db.query(sql, [id], (err) => {
    if (err) {
      console.error("Accept Error:", err);
      return res.status(500).json({ status: "error", message: "Accept failed" });
    }

    // Fetch email to send notification
    db.query("SELECT email, name FROM job_applications WHERE id=?", [id], (err2, result) => {
      if (err2 || result.length === 0)
        return res.json({ status: "success", message: "Accepted (Email failed)" });

      const userEmail = result[0].email;
      const name = result[0].name;

      // Send email
      const mailOptions = {
        from: "nirjalamandal17032@gmail.com",
        to: userEmail,
        subject: "Your Resume Has Been Selected!",
        text: `Dear ${name},

Congratulations! Your resume has been selected.

You will receive further information and details through your email shortly.

Best regards,
Admin Team`
      };

      transporter.sendMail(mailOptions, (mailErr) => {
        if (mailErr) console.log("Email Error:", mailErr);
      });

      res.json({ status: "success", message: "Application Accepted + Email Sent" });
    });
  });
});

// ================= REJECT APPLICATION =================
app.put("/api/job_applications/reject/:id", (req, res) => {
  const { id } = req.params;

  const sql = "UPDATE job_applications SET status='rejected' WHERE id=?";
  db.query(sql, [id], (err) => {
    if (err) {
      console.error("Reject Error:", err);
      return res.status(500).json({ status: "error", message: "Reject failed" });
    }

    // Fetch email to send notification
    db.query("SELECT email, name FROM job_applications WHERE id=?", [id], (err2, result) => {
      if (err2 || result.length === 0)
        return res.json({ status: "success", message: "Rejected (Email failed)" });

      const userEmail = result[0].email;
      const name = result[0].name;

      // Send email
      const mailOptions = {
        from: "yourgmail@gmail.com",
        to: userEmail,
        subject: "Application Update",
        text: `Dear ${name},

Thank you for applying. Unfortunately, your resume was not selected.

We wish you best of luck for future opportunities.

Regards,
Admin Team`
      };

      transporter.sendMail(mailOptions, (mailErr) => {
        if (mailErr) console.log("Email Error:", mailErr);
      });

      res.json({ status: "success", message: "Application Rejected + Email Sent" });
    });
  });
});

// ================= GET ALL JOB APPLICATIONS (Admin) =================
app.get("/api/job_applications", (req, res) => {
  const sql = `
    SELECT ja.id, ja.job_id, ja.name, ja.email, ja.mobile, ja.resume, ja.applied_on,
           j.title AS job_title, j.company AS company_name
    FROM job_applications ja
    LEFT JOIN jobs j ON ja.job_id = j.id
    ORDER BY ja.applied_on DESC
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("Fetch Job Applications Error:", err);
      return res.status(500).json({ status: "error", message: "Failed to fetch job applications" });
    }
    res.json(result);
  });
});
// Get logged-in user's job applications (only status and resume)
app.get("/api/user/applications/:userId", (req, res) => {
  const { userId } = req.params;

  const sql = `
    SELECT status, resume
    FROM job_applications
    WHERE email = (SELECT email FROM users WHERE id = ?)
    ORDER BY applied_on DESC
  `;

  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.error("Fetch User Applications Error:", err);
      return res.status(500).json({ status: "error", message: "Failed to fetch applications" });
    }
    res.json(result);
  });
});


// ================= DELETE JOB APPLICATION (Admin) =================
app.delete("/api/job_applications/:id", (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM job_applications WHERE id = ?", [id], (err) => {
    if (err) {
      console.error("Delete Job Application Error:", err);
      return res.status(500).json({ status: "error", message: "Failed to delete job application" });
    }
    res.json({ status: "success", message: "Job application deleted successfully" });
  });
});
// ================= EMAIL TRANSPORTER =================
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "nirjalamandal17032@gmail.com",      // ⬅️ apna Gmail dalna
    pass: "uynl vxce tuyf vnnp"         // ⬅️ Gmail App Password
  }
});

// ================= SEND OTP =================
app.post("/send-otp", async (req, res) => {
  const { email } = req.body;

  try {
    // Check if email exists in users table
    const [users] = await db.promise().query("SELECT * FROM users WHERE email=?", [email]);

    if (users.length === 0) {
      return res.json({ status: "error", message: "Email not registered" });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry

    // Save OTP in DB (insert or update)
    await db.promise().query(
      "INSERT INTO otp_verification (email, otp, expires_at) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE otp=?, expires_at=?",
      [email, otp, expiresAt, otp, expiresAt]
    );

    // Send OTP via email
    await transporter.sendMail({
      from: '"Online Job Portal" <nirjalamandal17032@gmail.com>', // Display name
      to: email,
      subject: "Your OTP for password reset",
      text: `Your OTP is ${otp}. It expires in 5 minutes.`
    });

    res.json({ status: "success", message: "OTP sent successfully" });
  } catch (err) {
    console.log(err);
    res.json({ status: "error", message: "Failed to send OTP" });
  }
});

// ================= VERIFY OTP AND RESET PASSWORD =================
app.post("/verify-otp-reset", async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const [rows] = await db.promise().query(
      "SELECT * FROM otp_verification WHERE email=? AND otp=?",
      [email, otp]
    );

    if (rows.length === 0) return res.json({ status: "error", message: "Invalid OTP" });

    const record = rows[0];
    if (new Date(record.expires_at) < new Date()) return res.json({ status: "error", message: "OTP expired" });

    const hashed = await bcrypt.hash(newPassword, 10);
    await db.promise().query("UPDATE users SET password=? WHERE email=?", [hashed, email]);

    await db.promise().query("DELETE FROM otp_verification WHERE email=?", [email]);

    res.json({ status: "success", message: "Password updated successfully" });
  } catch (err) {
    console.log(err);
    res.json({ status: "error", message: "Server error" });
  }
});
// ================= START SERVER =================
app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
