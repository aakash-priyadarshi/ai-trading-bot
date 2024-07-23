import pandas as pd
import alpaca_trade_api as tradeapi
import os

API_KEY = os.getenv('ALPACA_API_KEY')
SECRET_KEY = os.getenv('ALPACA_SECRET_KEY')
BASE_URL = 'https://paper-api.alpaca.markets'

api = tradeapi.REST(API_KEY, SECRET_KEY, BASE_URL, api_version='v2')

def get_historical_data(symbol, start, end):
    barset = api.get_barset(symbol, 'day', start=start, end=end)
    data = barset[symbol]
    df = pd.DataFrame([{
        'time': bar.t.time,
        'open': bar.o,
        'high': bar.h,
        'low': bar.l,
        'close': bar.c,
        'volume': bar.v
    } for bar in data])
    return df

# Example usage
if __name__ == "__main__":
    df = get_historical_data('AAPL', '2020-01-01', '2022-01-01')
    df.to_csv('../data/aapl_historical_data.csv', index=False)
