// backend/symbolFormatter.js
function getFormattedSymbol(symbol, api) {
    if (api === 'yahoo') {
      return symbol === 'BRK.B' ? 'BRK-B' : symbol;
    } else if (api === 'alpaca') {
      return symbol === 'BRK-B' ? 'BRK.B' : symbol;
    }
    return symbol;
  }
  
  module.exports = { getFormattedSymbol };
  