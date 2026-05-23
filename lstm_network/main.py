from model.model import create_model, train_model
from training.fetch_data import fetch_stock_data
from training.process_data import process_data
from tensorflow.keras.models import load_model
import numpy as np
import os

api_key = 'KE1LFMJTUCSB616G'  # Your Alpha Vantage API Key
symbols = ['TSLA', 'NVDA', 'GOOGL', 'AAPL', 'AMZN']  # Stock symbols
model_path = 'saved_model.h5'

def train_and_save():
    all_X, all_y = [], []
    for symbol in symbols:
        df = fetch_stock_data(symbol, api_key)
        X, y, _ = process_data(df)
        all_X.append(X)
        all_y.append(y)
    
    all_X = np.concatenate(all_X, axis=0)
    all_y = np.concatenate(all_y, axis=0)
    
    model = create_model(input_shape=(all_X.shape[1], 1))
    train_model(model, all_X, all_y)
    model.save(model_path)

def predict(symbol):
    try:
        model = load_model(model_path)  # Load the trained model
        df = fetch_stock_data(symbol, api_key)
        X, _, scaler = process_data(df)

        print("Starting prediction...")  # Debugging
        predictions = model.predict(X)
        print("Prediction completed.")  # Debugging

        predictions = scaler.inverse_transform(predictions)  # Convert predictions back to original scale

        # Convert prediction to float to ensure it is JSON serializable
        prediction_value = float(predictions[-1][0])

        return prediction_value, df['Close'].values
    except Exception as e:
        print(f"Error in prediction: {e}")
        raise

def should_buy(predicted_price, last_close_price):
    if predicted_price > last_close_price:
        return "Buy"
    else:
        return "Don't Buy"
