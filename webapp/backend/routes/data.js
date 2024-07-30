const express = require('express');
const Alpaca = require('@alpacahq/alpaca-trade-api');

const router = express.Router();

const API_KEY = process.env.ALPACA_API_KEY;
const API_SECRET = process.env.ALPACA_API_SECRET;
const API_BASE_URL = process.env.ALPACA_API_BASE_URL || 'https://paper-api.alpaca.markets';

const alpaca = new Alpaca({
  keyId: API_KEY,
  secretKey: API_SECRET,
  paper: true,
  baseUrl: API_BASE_URL
});

// Historical Data Route
router.get('/historical/:symbol/:timeframe', async (req, res) => {
  const { symbol, timeframe } = req.params;

  try {
    console.log(`Fetching historical data for ${symbol} with timeframe ${timeframe}`);

    // Use the `getBarsV2` method to fetch historical data
    const bars = alpaca.getBarsV2(
      symbol,
      {
        timeframe: timeframe,
        limit: 100 // Adjust the limit as needed
      }
    );

    // Collect all bars in an array
    const barSet = [];
    for await (const bar of bars) {
      barSet.push(bar);
    }

    console.log(`Received data for ${symbol}: ${JSON.stringify(barSet)}`);
    res.json({ [symbol]: barSet });
  } catch (error) {
    console.error(`Error fetching historical data for ${symbol}:`, error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
