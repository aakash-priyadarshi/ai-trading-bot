const { autoDailyTrade } = require('../services/autoTrader');
const { placeDailyTrade } = require('../services/alpacaTrader');
const { getPrediction } = require('../services/mlService');

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
  const { symbol, days } = req.body;
  try {
    const predictions = await getPrediction({ symbol, days });
    res.json(predictions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

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