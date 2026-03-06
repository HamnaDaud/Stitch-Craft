import express from 'express';
import dotenv from 'dotenv';

import mongoose from 'mongoose';
import dns from 'dns';
dns.setServers(["1.1.1.1", "8.8.8.8"]);
dotenv.config();

const app = express();

// Middleware

app.use(express.json());
app.get("/health", (req, res) => {
  res.status(200).json({message: "Healthy"})
});

app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});



// MongoDB Connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB Connection Error:', err.message);
    process.exit(1);
  });