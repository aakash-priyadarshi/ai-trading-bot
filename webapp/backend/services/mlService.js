// backend/services/mlService.js

const axios = require('axios');

async function getPrediction(data) {
  try {
    console.log('Sending prediction request:', data);
    const response = await axios.post('http://localhost:5000/api/v1/trading/predict', data);
    console.log('Received prediction response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in getPrediction:', error.response ? error.response.data : error.message);
    throw error;
  }
}

module.exports = { getPrediction };