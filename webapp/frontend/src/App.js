import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { CandlestickController, CandlestickElement } from 'chartjs-chart-financial';
import { DateTime } from 'luxon';
import 'chartjs-adapter-luxon';
import './index.css';

// Register the candlestick chart type
Chart.register(CandlestickController, CandlestickElement);

function App() {
  const [symbol, setSymbol] = useState('AAPL');
  const [timeframe, setTimeframe] = useState('1D');
  const [chartType, setChartType] = useState('candlestick');
  const [data, setData] = useState([]);
  const [balance, setBalance] = useState(10000); // Example balance
  const [trackedSymbols, setTrackedSymbols] = useState(['AAPL', 'GOOGL', 'AMZN']);
  const [recentActivities, setRecentActivities] = useState([]);
  const chartRef = useRef(null);
  const wsRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    fetchData();
    setupWebSocket();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [symbol, timeframe, chartType]);

  const fetchData = async () => {
    try {
      const response = await fetch(`/api/v1/data/historical/${symbol}/${timeframe}`);
      if (!response.ok) {
        throw new Error(`Error fetching data: ${response.statusText}`);
      }
      const result = await response.json();
      if (result.error) {
        throw new Error(result.error);
      }
      setData(result[symbol]);
      renderChart(result[symbol]);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const setupWebSocket = () => {
    wsRef.current = new WebSocket('ws://localhost:5000/api/v1/data/stream');
    wsRef.current.onopen = () => {
      console.log('WebSocket connected');
    };
    wsRef.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log('WebSocket message:', message);
      // Update chart with new data
      setData((prevData) => [...prevData, message]);
      renderChart([...data, message]);
    };
    wsRef.current.onclose = () => {
      console.log('WebSocket disconnected');
    };
    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  };

  const renderChart = (chartData) => {
    const ctx = document.getElementById('stockChart').getContext('2d');

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const datasets = [
      {
        label: `${symbol} Stock Price`,
        data: chartData.map(d => ({
          x: new Date(d.Timestamp),
          o: d.OpenPrice,
          h: d.HighPrice,
          l: d.LowPrice,
          c: d.ClosePrice,
          v: d.Volume,
          t: d.TradeCount,
          vw: d.VWAP
        })),
        borderColor: 'rgba(75,192,192,1)',
        borderWidth: 1,
        type: 'candlestick',
        hidden: chartType !== 'candlestick'
      },
      {
        label: 'Close Price',
        data: chartData.map(d => ({
          x: new Date(d.Timestamp),
          y: d.ClosePrice
        })),
        borderColor: 'rgba(255,99,132,1)',
        borderWidth: 1,
        type: 'line',
        hidden: chartType !== 'line'
      }
    ];

    const config = {
      type: chartType,
      data: {
        datasets: datasets
      },
      options: {
        scales: {
          x: {
            type: 'time',
            time: {
              unit: 'day'
            }
          },
          y: {
            beginAtZero: false
          }
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
          }
        }
      }
    };

    chartInstanceRef.current = new Chart(ctx, config);
  };

  const handleOrder = (type) => {
    const amount = parseFloat(document.getElementById('amount').value);
    const price = parseFloat(document.getElementById('price').value);
    if (type === 'buy') {
      setBalance(balance - amount * price);
      setRecentActivities([...recentActivities, { type: 'Buy', symbol, amount, price }]);
    } else {
      setBalance(balance + amount * price);
      setRecentActivities([...recentActivities, { type: 'Sell', symbol, amount, price }]);
    }
  };

  return (
    <div className="App container">
      <div className="chart-container">
        <h1>Stock Market Chart</h1>
        <select value={symbol} onChange={(e) => setSymbol(e.target.value)}>
          <option value="AAPL">AAPL</option>
          <option value="GOOGL">GOOGL</option>
          <option value="AMZN">AMZN</option>
        </select>
        <select value={timeframe} onChange={(e) => setTimeframe(e.target.value)}>
          <option value="1Min">1 Minute</option>
          <option value="5Min">5 Minutes</option>
          <option value="15Min">15 Minutes</option>
          <option value="30Min">30 Minutes</option>
          <option value="1Hour">1 Hour</option>
          <option value="1Day">1 Day</option>
          <option value="1Week">1 Week</option>
          <option value="1Month">1 Month</option>
          <option value="1Year">1 Year</option>
        </select>
        <select value={chartType} onChange={(e) => setChartType(e.target.value)}>
          <option value="line">Line Chart</option>
          <option value="candlestick">Candlestick Chart</option>
        </select>
        <canvas id="stockChart" ref={chartRef}></canvas>
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
      </div>
    </div>
  );
}

export default App;
