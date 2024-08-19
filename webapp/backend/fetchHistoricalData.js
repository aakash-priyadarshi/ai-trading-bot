//backend/fetchHistoricalData.js:
const yahooFinance = require('yahoo-finance2').default;
const StockData = require('./models/StockData');
const { getFormattedSymbol } = require('./symbolFormatter');

async function fetchAndInsertData(symbol, period1, period2, timeframe) {
  const formattedSymbol = getFormattedSymbol(symbol, 'yahoo');
  try {
    if (period1 === period2) {
      // Adjust period1 to ensure it is before period2
      period1 = new Date(new Date(period1).getTime() - 86400000).toISOString().split('T')[0]; // Subtract one day
    }
    const data = await yahooFinance.historical(formattedSymbol, { period1, period2, interval: timeframe });

    const barSet = data.map(d => ({
      metadata: { symbol, timeframe },
      timestamp: new Date(d.date),
      openPrice: d.open,
      highPrice: d.high,
      lowPrice: d.low,
      closePrice: d.close,
      volume: d.volume
    }));

    await StockData.insertMany(barSet);
    console.log(`Inserted historical data for ${symbol} from ${period1} to ${period2} with timeframe ${timeframe}`);
  } catch (error) {
    console.error(`Error fetching historical data for ${symbol}:`, error.message);
  }
}

async function fetchMissingHistoricalData() {
  const symbols = ['AAPL', 'AMZN', 'BRK.B', 'GOOGL', 'JNJ', 'JPM', 'META', 'MSFT', 'NVDA', 'TSLA'];
  const endDate = new Date().toISOString().split('T')[0];
  const startDate = new Date(Date.now() - 5 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // Last year

  const timeframes = ['1d', '1wk', '1mo'];

  for (const symbol of symbols) {
    for (const timeframe of timeframes) {
      try {
        await fetchAndInsertData(symbol, startDate, endDate, timeframe);
      } catch (error) {
        console.error(`Error fetching historical data for ${symbol} with timeframe ${timeframe}:`, error.message);
      }
    }
  }
}

module.exports = { fetchMissingHistoricalData, fetchAndInsertData };