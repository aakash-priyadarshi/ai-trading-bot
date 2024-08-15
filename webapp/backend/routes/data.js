const express = require('express');
const StockData = require('../models/StockData');
const { fetchMissingHistoricalData, fetchAndInsertData } = require('../fetchHistoricalData');
const { fetchRealTimeData } = require('../fetchRealTimeData');
const { getFormattedSymbol } = require('../symbolFormatter');

const router = express.Router();

// Combined Data Route
router.get('/:symbol/:timeframe', async (req, res) => {
  let { symbol, timeframe } = req.params;

  try {
    console.log(`Fetching data for ${symbol} with timeframe ${timeframe}`);

    let stockData;

    if (['1Min', '5Min', '15Min', '30Min', '1Hour', '4Hour'].includes(timeframe)) {
      // Real-time data from Alpaca
      symbol = getFormattedSymbol(symbol, 'alpaca');
      stockData = await fetchRealTimeData(symbol, timeframe);
    } else {
      // Historical data from MongoDB
      symbol = getFormattedSymbol(symbol, 'yahoo');
      stockData = await StockData.find({ "metadata.symbol": symbol, "metadata.timeframe": timeframe })
        .sort({ timestamp: -1 })
        .limit(10000);  // Increase this limit if you need more data points

      if (stockData.length === 0) {
        console.log(`No data found in MongoDB for ${symbol} with timeframe ${timeframe}. Fetching from Yahoo.`);
        const endDate = new Date().toISODate();
        const startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISODate(); // Last year
        await fetchAndInsertData(symbol, startDate, endDate, timeframe);
        stockData = await StockData.find({ "metadata.symbol": symbol, "metadata.timeframe": timeframe })
          .sort({ timestamp: -1 })
          .limit(10000);
      }
    }

    console.log(`Sending data for ${symbol}: ${JSON.stringify(stockData)}`);
    res.json({ [symbol]: stockData });
  } catch (error) {
    console.error(`Error fetching data for ${symbol}:`, error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;