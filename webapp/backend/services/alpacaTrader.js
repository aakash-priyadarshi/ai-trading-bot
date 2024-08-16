// backend/services/alpacaTrader.js

const Alpaca = require('@alpacahq/alpaca-trade-api');

const alpaca = new Alpaca({
  keyId: process.env.ALPACA_API_KEY,
  secretKey: process.env.ALPACA_SECRET_KEY,
  paper: true,
  usePolygon: false
});

async function placeDailyTrade(symbol, qty, side) {
  try {
    const order = await alpaca.createOrder({
      symbol: symbol,
      qty: qty,
      side: side,
      type: 'market',
      time_in_force: 'day'
    });
    console.log('Daily order placed:', order);
    return order;
  } catch (error) {
    console.error('Error placing daily order:', error);
    throw error;
  }
}

module.exports = { placeDailyTrade };