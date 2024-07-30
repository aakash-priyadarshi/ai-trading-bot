import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { CandlestickController, CandlestickElement } from 'chartjs-chart-financial';
import './index.css';
import 'chartjs-adapter-moment';

// Register the candlestick chart type
Chart.register(CandlestickController, CandlestickElement);

function App() {
  const [symbol, setSymbol] = useState('AAPL');
  const [timeframe, setTimeframe] = useState('1D');
  const [chartType, setChartType] = useState('line');
  const [data, setData] = useState([]);
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

    const config = {
      type: chartType,
      data: {
        labels: chartData.map(d => new Date(d.Timestamp)),
        datasets: [{
          label: `${symbol} Stock Price`,
          data: chartType === 'line' ? chartData.map(d => ({
            x: new Date(d.Timestamp),
            y: d.ClosePrice
          })) : chartData.map(d => ({
            x: new Date(d.Timestamp),
            o: d.OpenPrice,
            h: d.HighPrice,
            l: d.LowPrice,
            c: d.ClosePrice
          })),
          borderColor: 'rgba(75,192,192,1)',
          borderWidth: 1,
        }],
      },
      options: {
        scales: {
          x: {
            type: 'time',
            time: {
              unit: 'day'
            }
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function(context) {
                const dataPoint = context.raw;
                if (chartType === 'line') {
                  return `Close: ${dataPoint.y}`;
                } else {
                  return [
                    `Open: ${dataPoint.o}`,
                    `High: ${dataPoint.h}`,
                    `Low: ${dataPoint.l}`,
                    `Close: ${dataPoint.c}`,
                    `Volume: ${dataPoint.v}`
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

  return (
    <div className="App">
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
      <canvas id="stockChart"></canvas>
    </div>
  );
}

export default App;
