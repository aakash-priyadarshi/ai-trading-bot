### Step 1: Initialize Project

1. **Create a new project directory**:
    ```bash
    mkdir trading-bot-dashboard
    cd trading-bot-dashboard
    npm init -y
    ```

2. **Install necessary packages**:
    ```bash
    npm install express axios kiteconnect dotenv socket.io chart.js
    ```

### Step 2: Create .env File

1. **Create a `.env` file in the root directory**:
    ```plaintext
    API_KEY=your_api_key
    API_SECRET=your_api_secret
    REQUEST_TOKEN=your_request_token
    ```

2. **Add `.env` to `.gitignore`**:
    ```plaintext
    .env
    ```

### Step 3: Set Up Basic Server

1. **Create `index.js` file** with basic Express server setup and Socket.io integration:
    ```javascript
    const express = require('express');
    const http = require('http');
    const socketIo = require('socket.io');
    const axios = require('axios');
    const { KiteConnect } = require('kiteconnect');
    require('dotenv').config(); // Load environment variables from .env file

    const app = express();
    const server = http.createServer(app);
    const io = socketIo(server);

    const PORT = process.env.PORT || 3000;

    // Zerodha API credentials from .env file
    const apiKey = process.env.API_KEY;
    const apiSecret = process.env.API_SECRET;
    const requestToken = process.env.REQUEST_TOKEN;

    const kc = new KiteConnect({ api_key: apiKey });

    async function getAccessToken() {
        try {
            const response = await kc.generateSession(requestToken, apiSecret);
            const accessToken = response.access_token;
            kc.setAccessToken(accessToken);
            console.log("Access Token:", accessToken);
        } catch (error) {
            console.error("Error generating session:", error);
        }
    }

    async function getMarketData() {
        try {
            const quotes = await kc.getQuote(['NSE:RELIANCE']);
            const marketData = quotes['NSE:RELIANCE'];
            return [{
                timestamp: new Date(marketData.timestamp).toISOString(),
                close: marketData.last_price
            }];
        } catch (error) {
            console.error("Error fetching market data:", error);
        }
    }

    // Set static folder
    app.use(express.static('public'));

    // Serve the index.html file
    app.get('/', (req, res) => {
        res.sendFile(__dirname + '/public/index.html');
    });

    // Socket.io connection
    io.on('connection', (socket) => {
        console.log('New client connected');

        socket.on('executeTrade', async (data) => {
            try {
                if (data.action === 'buy') {
                    const order = await kc.placeOrder('regular', {
                        exchange: 'NSE',
                        tradingsymbol: 'RELIANCE',
                        transaction_type: 'BUY',
                        quantity: 1,
                        product: 'CNC',
                        order_type: 'MARKET'
                    });
                    console.log('Buy order placed:', order);
                } else if (data.action === 'sell') {
                    const order = await kc.placeOrder('regular', {
                        exchange: 'NSE',
                        tradingsymbol: 'RELIANCE',
                        transaction_type: 'SELL',
                        quantity: 1,
                        product: 'CNC',
                        order_type: 'MARKET'
                    });
                    console.log('Sell order placed:', order);
                }
            } catch (error) {
                console.error('Error executing trade:', error);
            }
        });

        setInterval(async () => {
            const marketData = await getMarketData();
            const labels = marketData.map(item => item.timestamp);
            const prices = marketData.map(item => item.close);
            io.emit('marketData', { labels, prices });
        }, 5000);

        socket.on('disconnect', () => {
            console.log('Client disconnected');
        });
    });

    // Start server
    server.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
        getAccessToken(); // Call this to initialize the session with Zerodha
    });
    ```

### Step 4: Set Up Frontend

1. **Create `public` directory** with the following files:

    **public/index.html**:
    ```html
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Trading Bot Dashboard</title>
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <script src="/socket.io/socket.io.js"></script>
    </head>
    <body>
        <h1>Trading Bot Dashboard</h1>
        <canvas id="tradingChart" width="400" height="200"></canvas>
        <button onclick="executeTrade('buy')">Buy</button>
        <button onclick="executeTrade('sell')">Sell</button>
        <script src="script.js"></script>
    </body>
    </html>
    ```

    **public/script.js**:
    ```javascript
    const socket = io();

    const ctx = document.getElementById('tradingChart').getContext('2d');
    const tradingChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [], // Time labels
            datasets: [{
                label: 'Stock Price',
                data: [],
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
                fill: false
            }]
        },
        options: {
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'minute'
                    }
                }
            }
        }
    });

    socket.on('marketData', (data) => {
        tradingChart.data.labels = data.labels;
        tradingChart.data.datasets[0].data = data.prices;
        tradingChart.update();
    });

    function executeTrade(action) {
        socket.emit('executeTrade', { action });
    }
    ```

### Step 5: Run the Application

1. **Start the server**:
    ```bash
    node index.js
    ```

2. **Open the dashboard**:
   - Navigate to `http://localhost:3000` in your web browser to see the trading bot dashboard.

### Summary

- **Initialized the project** and installed required packages.
- **Configured environment variables** using `.env`.
- **Set up the server** using Express and integrated Socket.io for real-time communication.
- **Connected to Zerodha API** using the KiteConnect library.
- **Built the frontend dashboard** to display stock charts and allow manual trade execution.
- **Integrated the frontend with the backend** to fetch and display real-time market data and execute trades.

Next steps could include enhancing the UI, adding more features to the dashboard, and preparing for Stage 2 where we will implement the machine learning model for automated trading.
