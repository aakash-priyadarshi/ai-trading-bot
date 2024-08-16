// backend/services/autoTrader.js

const { placeDailyTrade } = require('./alpacaTrader');
const { getPrediction } = require('./mlService');
const { fetchHistoricalData } = require('../fetchHistoricalData');

async function autoDailyTrade(symbol) {
  try {
    // Fetch the latest available data for the symbol
    const historicalData = await fetchHistoricalData(symbol, '1d', 10); // Fetch last 10 days of data

    // Prepare data for prediction
    const predictionData = preparePredictionData(historicalData);

    // Get prediction for next day's closing price
    const prediction = await getPrediction(predictionData);

    // Get the latest closing price
    const latestClose = historicalData[historicalData.length - 1].closePrice;

    // Simple trading logic: Buy if predicted price is higher, Sell if lower
    if (prediction.predicted_close > latestClose * 1.01) { // 1% threshold
      await placeDailyTrade(symbol, 1, 'buy');
    } else if (prediction.predicted_close < latestClose * 0.99) { // 1% threshold
      await placeDailyTrade(symbol, 1, 'sell');
    } else {
      console.log(`No trade for ${symbol}. Prediction within 1% of current price.`);
    }

    console.log(`Auto-trade decision made for ${symbol} based on prediction for ${prediction.date}`);
  } catch (error) {
    console.error('Error in auto-trading:', error);
  }
}

function preparePredictionData(historicalData) {
  // Transform historical data into the format expected by your ML model
  // This will depend on what features your model was trained on
  return historicalData.map(d => ({
    open: d.openPrice,
    high: d.highPrice,
    low: d.lowPrice,
    close: d.closePrice,
    volume: d.volume,
    // Add any other features your model expects
  }));
}

module.exports = { autoDailyTrade };