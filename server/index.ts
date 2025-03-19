import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import routes from "./routes";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api", routes);

// Welcome route
app.get("/", (_req, res) => {
  res.json({ message: "Welcome to 3D Print Shop API" });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
