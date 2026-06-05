import requests
import pandas as pd

def fetch_stock_data(symbol, api_key):
    url = f'https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol={symbol}&apikey={api_key}'
    response = requests.get(url)
    
    if response.status_code != 200:
        raise ValueError(f"Error fetching data from Alpha Vantage API: {response.status_code} - {response.text}")
    
    data = response.json()
    
    if 'Time Series (Daily)' in data:
        df = pd.DataFrame(data['Time Series (Daily)']).T
        df = df.rename(columns={
            '1. open': 'Open',
            '2. high': 'High',
            '3. low': 'Low',
            '4. close': 'Close',
            '5. volume': 'Volume'
        })
        df.index = pd.to_datetime(df.index)
        df = df.sort_index()
        df = df.astype(float)
        return df
    else:
        raise ValueError(f"Error fetching data for symbol {symbol}: {data.get('Note', 'Unknown error')}")
