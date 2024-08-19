// backend/fetchRealTimeData.js:
const Alpaca = require('@alpacahq/alpaca-trade-api');
const StockData = require('./models/StockData');
const { getFormattedSymbol } = require('./symbolFormatter');

const API_KEY = process.env.ALPACA_API_KEY;
const API_SECRET = process.env.ALPACA_API_SECRET;
const API_BASE_URL = process.env.ALPACA_API_BASE_URL || 'https://paper-api.alpaca.markets';

const alpaca = new Alpaca({
  keyId: API_KEY,
  secretKey: API_SECRET,
  paper: true,
  baseUrl: API_BASE_URL
});

function formatTimeframe(timeframe) {
  const validTimeframes = ['1Min', '5Min', '15Min', '30Min', '1Hour', '2Hour', '4Hour'];
  if (validTimeframes.includes(timeframe)) {
    return timeframe;
  }
  throw new Error(`Invalid timeframe: ${timeframe}`);
}

async function fetchRealTimeData(symbol, timeframe) {
  const formattedSymbol = getFormattedSymbol(symbol, 'alpaca');
  let formattedTimeframe;
  
  try {
    formattedTimeframe = formatTimeframe(timeframe);
  } catch (error) {
    console.error(`Error formatting timeframe: ${error.message}`);
    throw error;
  }

  console.log(`Attempting to fetch real-time data for ${formattedSymbol} with timeframe ${formattedTimeframe}`);

  try {
    // Add a small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));

    const startTime = new Date(Date.now() - 24 * 60 * 60 * 1000); // Last 24 hours

    const bars = alpaca.getBarsV2(
      formattedSymbol,
      {
        timeframe: formattedTimeframe,
        start: startTime.toISOString(),
        limit: 1000 // Adjust this based on your needs and API limits
      }
    );

    const barSet = [];
    for await (const bar of bars) {
      barSet.push({
        metadata: { symbol, timeframe: formattedTimeframe },
        timestamp: bar.Timestamp,
        openPrice: bar.OpenPrice,
        highPrice: bar.HighPrice,
        lowPrice: bar.LowPrice,
        closePrice: bar.ClosePrice,
        volume: bar.Volume,
        tradeCount: bar.TradeCount,
        vwap: bar.VWAP
      });
    }

    if (barSet.length > 0) {
      await StockData.insertMany(barSet);
      console.log(`Inserted ${barSet.length} real-time data points for ${symbol} with timeframe ${formattedTimeframe}`);
    } else {
      console.log(`No new data available for ${symbol} with timeframe ${formattedTimeframe}`);
    }

    return barSet;
  } catch (error) {
    console.error(`Error fetching real-time data for ${symbol} with timeframe ${formattedTimeframe}:`, error);
    console.error('Full error object:', JSON.stringify(error, null, 2));
    throw error;
  }
}

module.exports = { fetchRealTimeData };