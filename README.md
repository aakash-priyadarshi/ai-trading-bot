# AI Trading Bot - Frontend and Backend


<p align="center">
  <a href="https://github.com/aakash-priyadarshi/ai-trading-bot/stargazers"><img src="https://img.shields.io/github/stars/aakash-priyadarshi/ai-trading-bot" alt="Stars Badge"/></a>
  <a href="https://github.com/aakash-priyadarshi/ai-trading-bot/network/members"><img src="https://img.shields.io/github/forks/aakash-priyadarshi/ai-trading-bot" alt="Forks Badge"/></a>
  <a href="https://github.com/aakash-priyadarshi/ai-trading-bot/pulls"><img src="https://img.shields.io/github/issues-pr/aakash-priyadarshi/ai-trading-bot" alt="Pull Requests Badge"/></a>
  <a href="https://github.com/aakash-priyadarshi/ai-trading-bot/issues"><img src="https://img.shields.io/github/issues/aakash-priyadarshi/ai-trading-bot" alt="Issues Badge"/></a>
  <a href="https://github.com/aakash-priyadarshi/ai-trading-bot/graphs/contributors"><img alt="GitHub contributors" src="https://img.shields.io/github/contributors/aakash-priyadarshi/ai-trading-bot?color=2b9348"></a>
  <a href="https://github.com/aakash-priyadarshi/ai-trading-bot/blob/master/LICENSE"><img src="https://img.shields.io/github/license/aakash-priyadarshi/ai-trading-bot?color=2b9348" alt="License Badge"/></a>
</p>

<p align="center">
  <img src="trading-bot.webp" alt="AI Trading Bot Demo" width="200"/>
</p>

This repository contains the frontend and backend components of the AI Trading Bot project. The system provides real-time stock market data visualization, automated trading capabilities, and integration with machine learning predictions.

> **Note**: The AI Trading Bot logo and demo images used in this README are AI-generated and the exclusive property of Aakash Priyadarshi. These images may not be used, reproduced, or distributed without explicit permission from the owner.

## 🔗 Related Repositories

This project is split into two main components:

1. **Frontend and Backend (Current Repository)**: 
   Contains the user interface, data visualization, and trading logic.
   
2. **Machine Learning Model**: 
   Houses the predictive model and data preparation scripts.
   GitHub Repository: [Trading-bot-model](https://github.com/aakash-priyadarshi/Trading-bot-model)

For a complete setup of the AI Trading Bot, you'll need to clone and configure both repositories.

## ✨ Features

- Real-time stock chart visualization using Chart.js
- Support for multiple timeframes (1Min, 5Min, 15Min, 30Min, 1Hour, 4Hour, 1D, 1W, 1M)
- Candlestick and line chart types
- WebSocket integration for live data updates
- Manual trading functionality with buy/sell options
- Automated trading with customizable frequency
- Integration with external ML prediction service
- Account balance tracking
- Recent trading activity log
- Future price predictions display

## 🛠️ Tech Stack

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React"/>
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js"/>
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js"/>
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB"/>
  <img src="https://img.shields.io/badge/Chart.js-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white" alt="Chart.js"/>
  <img src="https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white" alt="Socket.io"/>
</p>

## 📋 Prerequisites

- Node.js (v14 or later)
- MongoDB
- Alpaca API credentials

## 🚀 Setup

1. Clone the repository:
   ```
   git clone https://github.com/aakash-priyadarshi/ai-trading-bot.git
   cd ai-trading-bot
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add the following:
   ```
   ALPACA_API_KEY=your_alpaca_api_key
   ALPACA_SECRET_KEY=your_alpaca_secret_key
   MONGO_URI=your_mongodb_connection_string
   ML_SERVICE_URL=url_of_your_ml_service
   ```

4. Start the backend server:
   ```
   npm run start:server
   ```

5. In a new terminal, start the frontend development server:
   ```
   npm run start:client
   ```

6. Open your browser and navigate to `http://localhost:3000` to view the application.

## 📁 Project Structure

```
webapp/
├── backend/
│   ├── controllers/
│   │   └── tradingController.js
│   ├── models/
│   │   └── StockData.js
│   ├── routes/
│   │   └── data.js
│   ├── services/
│   │   ├── alpacaTrader.js
│   │   ├── autoTrader.js
│   │   ├── fetchHistoricalData.js
│   │   ├── fetchRealTimeData.js
│   │   └── mlService.js
│   ├── utils/
│   │   └── symbolFormatter.js
│   ├── app.js
│   └── .env
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   └── index.css
│   ├── src/
│   │   ├── components/
│   │   │   └── App.js
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── styles/
│   │   │   └── index.css
│   │   └── index.js
│   ├── .env
│   └── package.json
├── .env
├── package.json
└── README.md
```

## 🔄 API Endpoints

- `/api/v1/data/:symbol/:timeframe`: Get stock data for a specific symbol and timeframe
- `/api/v1/trading/manual`: Execute a manual trade
- `/api/v1/trading/toggle`: Toggle auto-trading on/off
- `/api/v1/trading/frequency`: Set auto-trading frequency
- `/api/v1/trading/predict`: Get future price predictions

## 📊 Data Visualization

The frontend uses Chart.js to visualize stock data. It supports:
- Candlestick and line chart types
- Multiple timeframes from 1 minute to 1 month
- Real-time updates for intraday data
- Zoom and pan functionality

## 🤖 Automated Trading

The system includes an automated trading feature that can:
- Execute trades based on predefined strategies
- Adjust trading frequency (e.g., daily, every 4 hours, hourly)
- Integrate predictions from the ML service for decision making

## 🔗 Integration with ML Service

The backend communicates with the ML service to get price predictions. These predictions are used for:
- Displaying future price estimates to users
- Informing automated trading decisions

## 🤝 Contributing

We welcome contributions to the AI Trading Bot project! Please see our [Contributing Guide](CONTRIBUTING.md) for more details on how to get started.

## 💖 Sponsor

If you find this project helpful, consider buying me a coffee!

<a href="https://www.buymeacoffee.com/aakashm30" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>

## 📞 Contact

For any queries or suggestions, feel free to reach out:

<a href="https://linktr.ee/aakashPriyadarshi" target="_blank"><img src="https://img.shields.io/badge/linktree-39E09B?style=for-the-badge&logo=linktree&logoColor=white" alt="Linktree"/></a>

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## ©️🖼️ Image Usage Rights

The AI-generated images used in this project, including the AI Trading Bot logo and demo images, are the exclusive property of Aakash Priyadarshi. These images are protected by copyright and may not be used, reproduced, modified, or distributed without explicit written permission from the owner.

For inquiries about using these images, please contact Aakash Priyadarshi through the provided Linktree contact link.
