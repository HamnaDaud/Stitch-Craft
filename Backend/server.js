const express = require("express");

const app = express();
const PORT = 5000;

// Middleware
app.use(express.json());


// Healthcheck API
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "OK",
        message: "Server is running",
        timestamp: new Date()
    });
});

// Test Route
app.get("/", (req, res) => {
    res.send("🚀 Backend server is running");
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});