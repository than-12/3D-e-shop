import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import router from "./routes";
import { createTables } from "./db/create-tables";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database tables
async function initDatabase() {
  try {
    await createTables();
    console.log("Database tables created successfully");
  } catch (error) {
    console.error("Error creating database tables:", error);
  }
}

// Call the database initialization
initDatabase();

// Routes
app.use("/api", router);

// Welcome route
app.get("/", (_req, res) => {
  res.json({ message: "Welcome to 3D Print Shop API" });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
