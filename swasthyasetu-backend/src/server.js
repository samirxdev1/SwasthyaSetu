import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/api.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', apiRoutes);

// Root Route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to SwasthyaSetu Backend API Server',
    documentation: '/api/health'
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint Not Found' });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`🚀 SwasthyaSetu Backend Server running on http://localhost:${PORT}`);
});
