const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();

app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "companydb",
  password: "Madhu@01",
  port: 5432,
});

// GET all active users
app.get("/users", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE isactive = true ORDER BY name"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// INSERT user
app.post("/users", async (req, res) => {
  try {
    const { name, email, age, gender, company } = req.body;

    const result = await pool.query(
      "INSERT INTO users (name, email, age, gender, company) VALUES ($1,$2,$3,$4,$5) RETURNING *",
      [name, email, age, gender, company]
    );

    res.status(201).json(result.rows[0]);

  } catch (err) {

    // UNIQUE constraint violation
    if (err.code === "23505") {
      return res.status(409).json({
        error: "Email already exists"
      });
    }

    console.error(err);
    res.status(500).json({ error: "Insert failed" });
  }
});

// SOFT DELETE using UUID
app.delete("/users/:uuid", async (req, res) => {
  try {
    const { uuid } = req.params;

    await pool.query(
      "UPDATE users SET isactive = false WHERE uuid = $1",
      [uuid]
    );

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Delete failed" });
  }
});
// UPDATE USER
app.put("/users/:uuid", async (req, res) => {
  try {
    const { uuid } = req.params;
    const { name, email, age, gender, company } = req.body;

    const result = await pool.query(
      "UPDATE users SET name=$1, email=$2, age=$3, gender=$4, company=$5 WHERE uuid=$6 RETURNING *",
      [name, email, age, gender, company, uuid]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Update failed" });
  }
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
