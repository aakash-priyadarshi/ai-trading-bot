// frontend/src/App.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Chart from 'chart.js/auto';

function App() {
    const [data, setData] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:5000/historical/AAPL').then((response) => {
            setData(response.data);
        });
    }, []);

    useEffect(() => {
        const ctx = document.getElementById('chart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map((_, index) => index),
                datasets: [
                    {
                        label: 'Stock Price',
                        data: data.map((d) => d.close),
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1,
                    },
                ],
            },
        });
    }, [data]);

    return (
        <div>
            <h1>AI Trading Bot</h1>
            <canvas id="chart" width="400" height="200"></canvas>
        </div>
    );
}

export default App;
