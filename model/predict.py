from flask import Flask, request, jsonify
from azureml.core import Workspace, Model
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from pymongo import MongoClient
import os
from dotenv import load_dotenv
import mlflow
import traceback

load_dotenv()

app = Flask(__name__)

# MongoDB setup
mongo_uri = os.getenv('MONGO_URI')
client = MongoClient(mongo_uri)
db = client.get_default_database()
stock_collection = db['stock_prices']

# Load Azure ML workspace
try:
    ws = Workspace.from_config()
    print("Workspace configuration succeeded")
except Exception as e:
    print(f"Error loading workspace configuration: {e}")
    raise

# Load the model
try:
    model_name = "Time-Series-Prophet-Model"  # Replace with your actual model name
    model = Model(ws, model_name)
    model_path = model.download(exist_ok=True)
    loaded_model = mlflow.pyfunc.load_model(model_path)
    print(f"Model '{model_name}' loaded successfully")
except Exception as e:
    print(f"Error loading model: {e}")
    print("Traceback:")
    traceback.print_exc()
    raise

def fetch_historical_data(ticker, days=30):
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)
    
    historical_data = list(stock_collection.find({
        'metadata.symbol': ticker,
        'metadata.timeframe': '1d',
        'timestamp': {'$gte': start_date, '$lte': end_date}
    }).sort('timestamp', 1))
    
    df = pd.DataFrame(historical_data)
    df['Date'] = pd.to_datetime(df['timestamp']).dt.date
    df.set_index('Date', inplace=True)
    
    column_mapping = {
        'openPrice': 'Open',
        'highPrice': 'High',
        'lowPrice': 'Low',
        'closePrice': 'Close',
        'volume': 'Volume'
    }
    
    df = df[[col for col in column_mapping.keys() if col in df.columns]]
    df.rename(columns=column_mapping, inplace=True)
    
    return df

def calculate_features(df):
    # Calculate RSI
    delta = df['Close'].diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
    rs = gain / loss
    df['RSI'] = 100 - (100 / (1 + rs))

    # Calculate MACD
    exp1 = df['Close'].ewm(span=12, adjust=False).mean()
    exp2 = df['Close'].ewm(span=26, adjust=False).mean()
    df['MACD_12_26_9'] = exp1 - exp2
    df['MACDh_12_26_9'] = df['MACD_12_26_9'] - df['MACD_12_26_9'].ewm(span=9, adjust=False).mean()
    df['MACDs_12_26_9'] = df['MACD_12_26_9'].ewm(span=9, adjust=False).mean()

    # Calculate Bollinger Bands
    df['MA'] = df['Close'].rolling(window=20).mean()
    df['BBM_20_2.0'] = df['MA']
    rolling_std = df['Close'].rolling(window=20).std()
    df['BBU_20_2.0'] = df['MA'] + (rolling_std * 2)
    df['BBL_20_2.0'] = df['MA'] - (rolling_std * 2)
    df['BBB_20_2.0'] = df['BBU_20_2.0'] - df['BBL_20_2.0']
    df['BBP_20_2.0'] = (df['Close'] - df['BBL_20_2.0']) / (df['BBU_20_2.0'] - df['BBL_20_2.0'])

    return df

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        ticker = data['symbol']
        current_price = data['current_price']
        prediction_days = data.get('prediction_days', 7)

        historical_data = fetch_historical_data(ticker)
        prediction_data = historical_data.reset_index()
        prediction_data['Ticker'] = ticker
        prediction_data = calculate_features(prediction_data)
        
        required_columns = ['Date', 'Open', 'High', 'Low', 'Close', 'Volume', 'Ticker', 
                            'RSI', 'MACD_12_26_9', 'MACDh_12_26_9', 'MACDs_12_26_9', 
                            'BBM_20_2.0', 'BBU_20_2.0', 'BBL_20_2.0', 'BBB_20_2.0', 'BBP_20_2.0', 'MA']
        for col in required_columns:
            if col not in prediction_data.columns:
                prediction_data[col] = 0

        predictions = loaded_model.predict(prediction_data)
        
        forecast_dates = [datetime.now().date() + timedelta(days=i) for i in range(1, prediction_days + 1)]
        processed_predictions = [
            {
                'date': date.strftime('%Y-%m-%d'),
                'predicted_close': float(predictions[i]),
                'action': 'buy' if predictions[i] > current_price else 'sell' if predictions[i] < current_price else 'hold'
            }
            for i, date in enumerate(forecast_dates)
        ]
        
        actual_values = historical_data['Close'].values[-prediction_days:]
        predicted_values = predictions[:prediction_days]
        mae = mean_absolute_error(actual_values, predicted_values)
        mse = mean_squared_error(actual_values, predicted_values)
        rmse = np.sqrt(mse)
        r2 = r2_score(actual_values, predicted_values)
        
        response = {
            'symbol': ticker,
            'current_price': current_price,
            'predictions': processed_predictions,
            'performance_metrics': {
                'MAE': mae,
                'MSE': mse,
                'RMSE': rmse,
                'R2': r2
            }
        }
        
        return jsonify(response)
    except Exception as e:
        print(f"Error during prediction: {str(e)}")
        print("Traceback:")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000)