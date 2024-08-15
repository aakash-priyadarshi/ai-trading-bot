const mongoose = require('mongoose');

const stockDataSchema = new mongoose.Schema({
  metadata: {
    symbol: String,
    timeframe: String
  },
  timestamp: Date,
  openPrice: Number,
  highPrice: Number,
  lowPrice: Number,
  closePrice: Number,
  volume: Number,
  tradeCount: Number,
  vwap: Number
}, { timeseries: { timeField: 'timestamp', metaField: 'metadata' } });

const StockData = mongoose.model('StockData', stockDataSchema, 'stock_prices'); // Explicitly set the collection name

module.exports = StockData;
