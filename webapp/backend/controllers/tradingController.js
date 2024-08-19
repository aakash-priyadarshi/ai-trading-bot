//backend/controllers/tradingController.js:
const { autoDailyTrade } = require('../services/autoTrader');
const { placeDailyTrade } = require('../services/alpacaTrader');
const { getPrediction } = require('../services/mlService');
const { fetchRealTimeData } = require('../fetchRealTimeData');
const StockData = require('../models/StockData');

let isAutoTradingEnabled = false;
let autoTradingFrequency = '0 18 * * 1-5'; // Default: 6 PM every weekday

exports.toggleAutoTrading = (req, res) => {
  isAutoTradingEnabled = !isAutoTradingEnabled;
  res.json({ isAutoTradingEnabled });
};

exports.setAutoTradingFrequency = (req, res) => {
  const { frequency } = req.body;
  autoTradingFrequency = frequency;
  res.json({ autoTradingFrequency });
};

exports.getAutoTradingStatus = (req, res) => {
  res.json({ isAutoTradingEnabled, autoTradingFrequency });
};

exports.manualTrade = async (req, res) => {
  const { symbol, action, quantity } = req.body;
  try {
    const order = await placeDailyTrade(symbol, quantity, action);
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.predictFuturePrices = async (req, res) => {
  const { symbol, current_price, prediction_days } = req.body;
  try {
    console.log('Received prediction request:', req.body);
    const predictions = await getPrediction({ 
      symbol, 
      current_price, 
      prediction_days 
    });
    console.log('Sending prediction response:', predictions);
    res.json(predictions);
  } catch (error) {
    console.error('Error in predictFuturePrices:', error);
    res.status(500).json({ error: error.message || 'An error occurred during prediction' });
  }
};

async function getCurrentPrice(symbol) {
  try {
    // First, try to get the latest price from Alpaca API
    const realtimeData = await fetchRealTimeData(symbol, '1Min');
    if (realtimeData && realtimeData.length > 0) {
      return realtimeData[realtimeData.length - 1].closePrice;
    }

    // If Alpaca API fails or returns no data, fall back to the database
    const latestData = await StockData.findOne(
      { 'metadata.symbol': symbol },
      {},
      { sort: { timestamp: -1 } }
    );

    if (!latestData) {
      throw new Error(`No data found for symbol ${symbol}`);
    }

    return latestData.closePrice;
  } catch (error) {
    console.error(`Error fetching current price for ${symbol}:`, error.message);
    throw error;
  }
}

exports.runAutoTrading = async () => {
  if (isAutoTradingEnabled) {
    console.log('Running auto-trading routine');
    const trackedSymbols = ['AAPL', 'AMZN', 'BRK.B', 'GOOGL', 'JNJ', 'JPM', 'META', 'MSFT', 'NVDA', 'TSLA'];
    for (const symbol of trackedSymbols) {
      await autoDailyTrade(symbol);
    }
  }
};

module.exports.isAutoTradingEnabled = isAutoTradingEnabled;
module.exports.autoTradingFrequency = autoTradingFrequency;