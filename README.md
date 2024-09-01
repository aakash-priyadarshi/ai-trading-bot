# AI Trading Bot - Frontend and Backend

This repository contains the frontend and backend components of the AI Trading Bot project. The system provides real-time stock market data visualization, automated trading capabilities, and integration with machine learning predictions.

## Related Repositories

This project is split into two main components:

1. **Frontend and Backend (Current Repository)**: 
   Contains the user interface, data visualization, and trading logic.
   
2. **Machine Learning Model**: 
   Houses the predictive model and data preparation scripts.
   GitHub Repository: [Trading-bot-model](https://github.com/aakash-priyadarshi/Trading-bot-model)

For a complete setup of the AI Trading Bot, you'll need to clone and configure both repositories.

## Features

- Real-time stock chart visualization using Chart.js
- Support for multiple timeframes and chart types
- WebSocket integration for live data updates
- Manual and automated trading functionalities
- Integration with external ML prediction service

## Tech Stack

- **Frontend**: React.js, Chart.js
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **APIs**: Alpaca API for stock data and trading

## Prerequisites

- Node.js (v14 or later)
- MongoDB
- Alpaca API credentials
- Access to the Machine Learning service (see [Trading-bot-model](https://github.com/aakash-priyadarshi/Trading-bot-model) repository)

## Setup

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

## Project Structure

```
webapp/
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   └── app.js
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── services/
│       └── App.js
├── .env
└── package.json
```

## API Endpoints

- `/api/v1/data/:symbol/:timeframe`: Get stock data for a specific symbol and timeframe
- `/api/v1/trading/manual`: Execute a manual trade
- `/api/v1/trading/toggle`: Toggle auto-trading on/off
- `/api/v1/trading/frequency`: Set auto-trading frequency
- `/api/v1/trading/predict`: Get future price predictions

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
