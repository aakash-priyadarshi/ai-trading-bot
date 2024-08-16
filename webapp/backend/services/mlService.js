// backend/services/mlService.js

const axios = require('axios');

async function getPrediction(data) {
  try {
    const response = await axios.post('http://localhost:5000/predict', data);
    return response.data;
  } catch (error) {
    console.error('Error getting prediction:', error);
    throw error;
  }
}

module.exports = { getPrediction };