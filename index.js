const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const axios = require('axios');
const KiteConnect = require('kiteconnect').KiteConnect;
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const PORT = process.env.PORT || 3000;

const apiKey = process.env.API_KEY;
const apiSecret = process.env.API_SECRET;
const requestToken = process.env.REQUEST_TOKEN;

const kc = new KiteConnect({ api_key: apiKey });

// Middleware to serve static files
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

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

    // Periodically fetch market data and send to client
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

// Start the server
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
