const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public")); // to serve HTML/CSS/JS

const DB_FILE = "./db.json";

// Load database
function loadDB() {
  return JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
}

// Save database
function saveDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// 🧑‍🎓 Student — submit request
app.post("/api/request", (req, res) => {
  const db = loadDB();
  const { name, reason } = req.body;
  const newReq = {
    id: Date.now(),
    name,
    reason,
    status: "Pending",
    remark: ""
  };
  db.requests.push(newReq);
  saveDB(db);
  res.json({ message: "Request submitted!", data: newReq });
});

// 👨‍🏫 Moderator — view all requests
app.get("/api/requests", (req, res) => {
  const db = loadDB();
  res.json(db.requests);
});

// Moderator — update status
app.post("/api/update", (req, res) => {
  const { id, status, remark } = req.body;
  const db = loadDB();
  const reqIndex = db.requests.findIndex(r => r.id === id);
  if (reqIndex === -1) return res.status(404).json({ message: "Not found" });
  db.requests[reqIndex].status = status;
  db.requests[reqIndex].remark = remark;
  saveDB(db);
  res.json({ message: "Updated successfully!" });
});

// 🚪 Gatekeeper — check request ID
app.get("/api/verify/:id", (req, res) => {
  const db = loadDB();
  const pass = db.requests.find(r => r.id == req.params.id);
  if (!pass) return res.status(404).json({ message: "Invalid pass" });
  res.json(pass);
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
