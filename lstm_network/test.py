from tensorflow.keras.models import load_model
import numpy as np

model_path = 'saved_model.h5'
symbol = 'NVDA'
api_key = 'cp36501r01qvi2qqdio0cp36501r01qvi2qqdiog'

# Load the model
model = load_model(model_path)

# Fetch and process data
from training.fetch_data import fetch_stock_data
from training.process_data import process_data

df = fetch_stock_data(symbol, api_key)
X, _, scaler = process_data(df)

# Perform prediction
predictions = model.predict(X)
predictions = scaler.inverse_transform(predictions)  # Convert predictions back to original scale

print(predictions[-1][0], df['Close'].values)
