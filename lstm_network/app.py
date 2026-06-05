from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import main

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    symbol = data.get('symbol')
    try:
        prediction, historical_data = main.predict(symbol)
        # Convert historical data to list to ensure JSON serializability
        return jsonify({'prediction': prediction, 'historical_data': historical_data.tolist()})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/should_buy', methods=['POST'])
def should_buy():
    data = request.get_json()
    symbol = data.get('symbol')
    try:
        prediction, historical_data = main.predict(symbol)
        decision = main.should_buy(prediction, historical_data[-1])
        return jsonify({'prediction': prediction, 'last_close': historical_data[-1], 'decision': decision})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
