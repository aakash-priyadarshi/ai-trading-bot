const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const http = require('http');
const WebSocket = require('ws');

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Import routes
const dataRoutes = require('./routes/data');
app.use('/api/v1/data', dataRoutes);

app.use(express.static(path.join(__dirname, '../frontend/build')));

// Serve the frontend index.html for any other route
app.get('*', (req, res, next) => {
  if (!req.path.startsWith('/api/')) {
    return res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
  }
  next(); // Continue to the next middleware if it's an API route
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('Client connected');
  ws.on('message', (message) => {
    console.log('Received message:', message);
  });
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
