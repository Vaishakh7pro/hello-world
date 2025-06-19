const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// ✅ Connect to MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'cinedb',
  port: 3307
});

db.connect((err) => {
  if (err) {
    console.error("❌ DB Connection Failed:", err);
    process.exit(1);
  }
  console.log('✅ Connected to MySQL database (cinedb)');
});

// ✅ SIGNUP
app.post('/signup', async (req, res) => {
  const { username, email, password, role, phone, country } = req.body;

  if (!username || !email || !password || !role || !phone) {
    return res.status(400).send("❌ All fields are required");
  }

  try {
    const hashed = await bcrypt.hash(password, 10);
    const sql = `INSERT INTO users (username, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)`;
    db.query(sql, [username, email.trim().toLowerCase(), phone, hashed, role], (err, result) => {
      if (err) {
        console.error("❌ Signup Error:", err);
        return res.status(500).send("❌ Signup failed: " + err.sqlMessage);
      }
      res.send("✅ Signup successful");
    });
  } catch (err) {
    console.error("❌ Server Error:", err);
    res.status(500).send("❌ Internal Server Error");
  }
});

// ✅ LOGIN
app.post('/login', (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).send({ message: '❌ Missing login fields' });
  }

  const sql = `SELECT * FROM users WHERE email = ? AND role = ?`;
  db.query(sql, [email.trim().toLowerCase(), role], async (err, results) => {
    if (err) return res.status(500).send({ message: '❌ Database error' });
    if (results.length === 0) return res.status(401).send({ message: '❌ Invalid credentials or role' });

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(401).send({ message: '❌ Incorrect password' });

    res.send({
      message: '✅ Login successful',
      role: user.role,
      username: user.username,
      userId: user.id,
      email: user.email
    });
  });
});

// ✅ GET USER PROFILE (DEBUGGED)
app.get('/user/profile/:email', (req, res) => {
  const encodedEmail = req.params.email;
  const email = decodeURIComponent(encodedEmail).trim().toLowerCase();

  console.log("📥 Requested user profile for:", email);

  const sql = `SELECT user_id, username, email, phone, role FROM users WHERE email = ?`;

  db.query(sql, [email], (err, results) => {
    if (err) {
      console.error("❌ SQL Error fetching profile:", err);
      return res.status(500).json({ error: "Server error" });
    }
    if (results.length === 0) {
      console.warn("⚠️ No user found for email:", email);
      return res.status(404).json({ error: "User not found" });
    }

    console.log("✅ User profile fetched:", results[0]);
    res.json(results[0]);
  });
});

// ✅ VERIFY PASSWORD
app.post('/user/verify-password', (req, res) => {
  const { email, currentPass } = req.body;
  const normalizedEmail = email.trim().toLowerCase();

  const sql = `SELECT password_hash FROM users WHERE email = ?`;
  db.query(sql, [normalizedEmail], async (err, results) => {
    if (err || results.length === 0) {
      return res.status(400).send({ valid: false });
    }

    const isMatch = await bcrypt.compare(currentPass, results[0].password_hash);
    res.send({ valid: isMatch });
  });
});

// ✅ CHANGE PASSWORD
app.post('/user/change-password', async (req, res) => {
  const { email, newPass } = req.body;
  const hashed = await bcrypt.hash(newPass, 10);

  const sql = `UPDATE users SET password_hash = ? WHERE email = ?`;
  db.query(sql, [hashed, email.trim().toLowerCase()], (err, result) => {
    if (err) {
      console.error("❌ Password update failed:", err);
      return res.status(500).send("❌ Password update failed");
    }
    res.send("✅ Password changed successfully");
  });
});

// ✅ GET USER BOOKINGS
app.get('/user/bookings/:userId', (req, res) => {
  const { userId } = req.params;

  const sql = `
    SELECT 
      b.booking_time AS date,
      b.payment_status AS is_active, -- or convert to true/false based on logic
      m.title AS movie_title,
      t.name AS theater_name
    FROM 
      bookings b
    JOIN 
      shows s ON b.show_id = s.show_id
    JOIN 
      movies m ON s.movie_id = m.movie_id
    JOIN 
      theaters t ON s.theater_id = t.theater_id
    WHERE 
      b.user_id = ?
    ORDER BY 
      b.booking_time DESC;
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("❌ Booking fetch error:", err);
      return res.status(500).json({ error: "❌ Failed to fetch bookings" });
    }

    res.json(results);
  });
});
/*now showing*/
app.get('/api/now-showing', (req, res) => {
  const sql = `
    SELECT 
      m.title, 
      m.genre, 
      m.poster_url, 
      t.name AS theater_name, 
      t.location
    FROM 
      movies m
    JOIN 
      theaters t ON m.theater_id = t.theater_id
    ORDER BY 
      m.release_date DESC;
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error('❌ Error fetching movies:', err);
      return res.status(500).json({ error: 'Failed to fetch movies' });
    }
    res.json(results);
  });
});


// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at: http://localhost:${PORT}`);
});
