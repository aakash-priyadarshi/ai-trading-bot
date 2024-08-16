import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Chart, registerables } from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import { CandlestickController, CandlestickElement } from 'chartjs-chart-financial';
import { DateTime } from 'luxon';
import 'chartjs-adapter-luxon';
import './index.css';

Chart.register(...registerables, CandlestickController, CandlestickElement, zoomPlugin);

function App() {
  const [symbol, setSymbol] = useState('AAPL');
  const [timeframe, setTimeframe] = useState('1d');
  const [chartType, setChartType] = useState('candlestick');
  const [data, setData] = useState([]);
  const [balance, setBalance] = useState(10000);
  const [trackedSymbols, setTrackedSymbols] = useState(['AAPL', 'AMZN', 'BRK.B', 'GOOGL', 'JNJ', 'JPM', 'META', 'MSFT', 'NVDA', 'TSLA']);
  const [recentActivities, setRecentActivities] = useState([]);
  const chartRef = useRef(null);
  const wsRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const [isAutoTradingEnabled, setIsAutoTradingEnabled] = useState(false);
  const [autoTradingFrequency, setAutoTradingFrequency] = useState('0 18 * * 1-5');
  const [futurePredictions, setFuturePredictions] = useState({});

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(`/api/v1/data/${symbol}/${timeframe}`);
      if (!response.ok) {
        throw new Error(`Error fetching data: ${response.statusText}`);
      }
      const result = await response.json();
      if (result.error) {
        throw new Error(result.error);
      }
      setData(result[symbol]);
      console.log('Fetched data:', result[symbol]);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, [symbol, timeframe]);

  const fetchRealTimeData = useCallback(async () => {
    try {
      const response = await fetch(`/api/v1/data/${symbol}/${timeframe}`);
      if (!response.ok) {
        throw new Error(`Error fetching real-time data: ${response.statusText}`);
      }
      const result = await response.json();
      if (result.error) {
        throw new Error(result.error);
      }
      if (result[symbol].length > 0) {
        setData(prevData => {
          const newData = [...prevData, ...result[symbol]];
          updateChart(newData);
          return newData;
        });
      } else {
        console.log('No new real-time data available.');
      }
    } catch (error) {
      console.error('Error fetching real-time data:', error);
    }
  }, [symbol, timeframe]);

  const setupWebSocket = useCallback(() => {
    wsRef.current = new WebSocket('ws://localhost:5000');
    wsRef.current.onopen = () => {
      console.log('WebSocket connected');
    };
    wsRef.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log('WebSocket message:', message);
      setData((prevData) => {
        const newData = [...prevData, message];
        updateChart(newData);
        return newData;
      });
    };
    wsRef.current.onclose = () => {
      console.log('WebSocket disconnected');
    };
    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }, []);

  useEffect(() => {
    fetchData();
    setupWebSocket();

    const updateInterval = setInterval(() => {
      if (['1Min', '5Min', '15Min', '30Min', '1Hour', '4Hour'].includes(timeframe)) {
        fetchRealTimeData();
      }
    }, getUpdateInterval(timeframe));

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      clearInterval(updateInterval);
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [symbol, timeframe, fetchData, fetchRealTimeData, setupWebSocket]);

  useEffect(() => {
    if (data.length > 0) {
      renderChart();
    }
  }, [data, chartType]);

  const getUpdateInterval = (tf) => {
    switch (tf) {
      case '1Min': return 60000;
      case '5Min': return 300000;
      case '15Min': return 900000;
      case '30Min': return 1800000;
      case '1Hour': return 3600000;
      case '4Hour': return 14400000;
      default: return 86400000; // 1 day
    }
  };

  const renderChart = () => {
    if (!chartRef.current) return;
    const ctx = chartRef.current.getContext('2d');

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
      chartInstanceRef.current = null;
    }

    const mappedData = data.map(d => ({
      x: DateTime.fromISO(d.timestamp).toMillis(),
      o: d.openPrice,
      h: d.highPrice,
      l: d.lowPrice,
      c: d.closePrice,
      v: d.volume,
      t: d.tradeCount,
      vw: d.vwap
    }));

    const datasets = [
      {
        label: `${symbol} Stock Price`,
        data: mappedData,
        borderColor: 'rgba(75,192,192,1)',
        borderWidth: 1,
        type: 'candlestick',
        hidden: chartType !== 'candlestick'
      },
      {
        label: 'Close Price',
        data: mappedData.map(d => ({ x: d.x, y: d.c })),
        borderColor: 'rgba(255,99,132,1)',
        borderWidth: 1,
        type: 'line',
        hidden: chartType !== 'line'
      }
    ];

    const config = {
      type: chartType === 'candlestick' ? 'candlestick' : 'line',
      data: { datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            type: 'time',
            time: {
              unit: timeframe.includes('Min') ? 'minute' : 
                    timeframe === '1Hour' || timeframe === '4Hour' ? 'hour' :
                    timeframe === '1d' ? 'day' :
                    timeframe === '1wk' ? 'week' : 'month',
              tooltipFormat: 'yyyy-MM-dd HH:mm',
              displayFormats: {
                minute: 'HH:mm',
                hour: 'MM-dd HH:mm',
                day: 'yyyy-MM-dd',
                week: 'yyyy-MM-dd',
                month: 'yyyy-MM'
              }
            },
            adapters: { date: { locale: 'en-US' } },
            ticks: { 
              source: 'auto', 
              maxRotation: 0, 
              autoSkip: true,
              maxTicksLimit: 10
            }
          },
          y: { beginAtZero: false }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function(context) {
                const dataPoint = context.raw;
                if (context.dataset.type === 'line') {
                  return `Close: ${dataPoint.y}`;
                } else {
                  return [
                    `Open: ${dataPoint.o}`,
                    `High: ${dataPoint.h}`,
                    `Low: ${dataPoint.l}`,
                    `Close: ${dataPoint.c}`,
                    `Volume: ${dataPoint.v}`,
                    `Trade Count: ${dataPoint.t}`,
                    `VWAP: ${dataPoint.vw}`
                  ];
                }
              }
            }
          },
          zoom: {
            pan: { enabled: true, mode: 'x' },
            zoom: {
              wheel: { enabled: true },
              pinch: { enabled: true },
              mode: 'x',
            },
            limits:{
              x: {min: 'original', max: 'original'}
            }
          }
        }
      }
    };

    chartInstanceRef.current = new Chart(ctx, config);
    const now = DateTime.now();
    let zoomStart;
    switch (timeframe) {
      case '1Min':
        zoomStart = now.minus({ hours: 4 });
        break;
      case '5Min':
      case '15Min':
        zoomStart = now.minus({ days: 1 });
        break;
      case '30Min':
      case '1Hour':
        zoomStart = now.minus({ days: 7 });
        break;
      case '4Hour':
        zoomStart = now.minus({ days: 30 });
        break;
      case '1d':
        zoomStart = now.minus({ months: 3 });
        break;
      case '1wk':
        zoomStart = now.minus({ years: 1 });
        break;
      case '1mo':
      default:
        zoomStart = now.minus({ years: 5 });
        break;
    }
    chartInstanceRef.current.zoomScale('x', {min: zoomStart.toMillis(), max: now.toMillis()}, 'default');
  };

  const updateChart = (newData) => {
    if (!chartInstanceRef.current) return;

    const mappedData = newData.map(d => ({
      x: DateTime.fromISO(d.timestamp).toMillis(),
      o: d.openPrice,
      h: d.highPrice,
      l: d.lowPrice,
      c: d.closePrice,
      v: d.volume,
      t: d.tradeCount,
      vw: d.vwap
    }));

    const candlestickDataset = chartInstanceRef.current.data.datasets.find(dataset => dataset.type === 'candlestick');
    const lineDataset = chartInstanceRef.current.data.datasets.find(dataset => dataset.type === 'line');

    if (candlestickDataset) {
      candlestickDataset.data = mappedData;
    }
    if (lineDataset) {
      lineDataset.data = mappedData.map(d => ({ x: d.x, y: d.c }));
    }

    chartInstanceRef.current.update();
  };

  const handleOrder = async (type) => {
    const amount = parseFloat(document.getElementById('amount').value);
    const price = parseFloat(document.getElementById('price').value);
    try {
      const response = await fetch('/api/v1/trading/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol, action: type, quantity: amount, price })
      });
      const data = await response.json();
      console.log('Manual trade executed:', data);
      
      if (type === 'buy') {
        setBalance(balance - amount * price);
      } else {
        setBalance(balance + amount * price);
      }
      setRecentActivities([...recentActivities, { type: type === 'buy' ? 'Buy' : 'Sell', symbol, amount, price }]);
    } catch (error) {
      console.error('Error executing manual trade:', error);
    }
  };

  const toggleAutoTrading = async () => {
    try {
      const response = await fetch('/api/v1/trading/toggle', { method: 'POST' });
      const data = await response.json();
      setIsAutoTradingEnabled(data.isAutoTradingEnabled);
    } catch (error) {
      console.error('Error toggling auto-trading:', error);
    }
  };

  const setFrequency = async (frequency) => {
    try {
      const response = await fetch('/api/v1/trading/frequency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ frequency })
      });
      const data = await response.json();
      setAutoTradingFrequency(data.autoTradingFrequency);
    } catch (error) {
      console.error('Error setting auto-trading frequency:', error);
    }
  };

  const predictFuturePrices = async (symbol, days) => {
    try {
      const response = await fetch('/api/v1/trading/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol, days })
      });
      const data = await response.json();
      setFuturePredictions({ ...futurePredictions, [symbol]: data });
    } catch (error) {
      console.error('Error predicting future prices:', error);
    }
  };

  useEffect(() => {
    // Fetch initial auto-trading status and predictions for tracked symbols
    fetch('/api/v1/trading/status').then(res => res.json()).then(data => {
      setIsAutoTradingEnabled(data.isAutoTradingEnabled);
      setAutoTradingFrequency(data.autoTradingFrequency);
    }).catch(error => console.error('Error fetching auto-trading status:', error));

    trackedSymbols.forEach(symbol => predictFuturePrices(symbol, 30));
  }, []);

  return (
    <div className="App container">
      <div className="chart-container">
        <h1>Stock Market Chart</h1>
        <select value={symbol} onChange={(e) => setSymbol(e.target.value)}>
          {trackedSymbols.map(sym => (
            <option key={sym} value={sym}>{sym}</option>
          ))}
        </select>
        <select value={timeframe} onChange={(e) => setTimeframe(e.target.value)}>
          <option value="1Min">1 Minute</option>
          <option value="5Min">5 Minutes</option>
          <option value="15Min">15 Minutes</option>
          <option value="30Min">30 Minutes</option>
          <option value="1Hour">1 Hour</option>
          <option value="4Hour">4 Hours</option>
          <option value="1d">1 Day</option>
          <option value="1wk">1 Week</option>
          <option value="1mo">1 Month</option>
        </select>
        <select value={chartType} onChange={(e) => setChartType(e.target.value)}>
          <option value="line">Line Chart</option>
          <option value="candlestick">Candlestick Chart</option>
        </select>
        <div style={{ width: '100%', height: '400px' }}>
          <canvas id="stockChart" ref={chartRef}></canvas>
        </div>
      </div>
      <div className="widgets-container">
        <div className="widget">
          <h2>Account Balance</h2>
          <div className="balance">${balance.toFixed(2)}</div>
        </div>
        <div className="widget">
          <h2>Tracked Symbols</h2>
          <div className="tracked-symbols">
            {trackedSymbols.map(sym => (
              <div key={sym}>{sym}</div>
            ))}
          </div>
        </div>
        <div className="widget">
          <h2>Place Order</h2>
          <div className="order-form">
            <input type="number" id="amount" placeholder="Amount" />
            <input type="number" id="price" placeholder="Price" />
            <button onClick={() => handleOrder('buy')}>Buy</button>
            <button onClick={() => handleOrder('sell')}>Sell</button>
          </div>
        </div>
        <div className="widget">
          <h2>Recent Activities</h2>
          <div className="recent-activities">
            {recentActivities.map((activity, index) => (
              <div key={index}>
                {activity.type} {activity.amount} {activity.symbol} at ${activity.price.toFixed(2)}
              </div>
            ))}
          </div>
        </div>
        <div className="widget">
          <h2>Auto-Trading Controls</h2>
          <div className="auto-trading-controls">
            <button onClick={toggleAutoTrading}>
              {isAutoTradingEnabled ? 'Disable Auto-Trading' : 'Enable Auto-Trading'}
            </button>
            <select value={autoTradingFrequency} onChange={(e) => setFrequency(e.target.value)}>
              <option value="0 18 * * 1-5">Daily at 6 PM</option>
              <option value="0 */4 * * 1-5">Every 4 hours</option>
              <option value="0 */1 * * 1-5">Hourly</option>
            </select>
          </div>
        </div>
        <div className="widget">
          <h2>Future Price Predictions</h2>
          <div className="future-predictions">
            {Object.entries(futurePredictions).map(([sym, predictions]) => (
              <div key={sym} className="prediction-item">
                <h3>{sym}</h3>
                <ul>
                  {predictions.map((pred, index) => (
                    <li 
                      key={index} 
                      style={{
                        color: pred.action === 'buy' ? 'green' : pred.action === 'sell' ? 'red' : 'black'
                      }}
                    >
                      {pred.date}: ${pred.predicted_close.toFixed(2)} - {pred.action.toUpperCase()}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;