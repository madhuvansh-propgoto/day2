const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();

app.use(cors());
app.use(express.json());

// PostgreSQL connection
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "companydb",
  password: "Madhu@01",
  port: 5432,
});

// Route to get users
app.get("/users", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

app.post("/users", async (req, res) => {
  try {
    const { name, email, age, gender, company } = req.body;

    const result = await pool.query(
      "INSERT INTO users (name, email, age, gender, company) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [name, email, age, gender, company]
    );

    res.status(201).json(result.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Insert failed" });
  }
});


app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});