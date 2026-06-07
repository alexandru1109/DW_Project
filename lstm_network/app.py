from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import subprocess
import json
import os

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

@app.route('/')
def index():
    return render_template('index.html')

def get_spark_prediction(symbol):
    # Determine absolute path to spark_ml.py
    base_dir = os.path.dirname(os.path.abspath(__file__))
    script_path = os.path.join(base_dir, 'training', 'spark_ml.py')
    
    # Run the PySpark script as a subprocess
    result = subprocess.run(
        ['python', script_path, '--symbol', symbol],
        capture_output=True,
        text=True
    )
    
    if result.returncode != 0:
        raise Exception(f"Spark Job Failed: {result.stderr}")
        
    # The script prints JSON to stdout as its last line
    output_lines = result.stdout.strip().split('\n')
    json_str = output_lines[-1] # The JSON should be the last thing printed
    
    return json.loads(json_str)

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    symbol = data.get('symbol')
    try:
        # Use Apache Spark MLlib instead of TensorFlow
        spark_result = get_spark_prediction(symbol)
        prediction = spark_result['predicted_price']
        historical_data = spark_result['historical_data']
        
        return jsonify({
            'prediction': prediction, 
            'historical_data': historical_data,
            'engine': spark_result['engine']
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/should_buy', methods=['POST'])
def should_buy():
    data = request.get_json()
    symbol = data.get('symbol')
    try:
        spark_result = get_spark_prediction(symbol)
        prediction = spark_result['predicted_price']
        last_close = spark_result['current_price']
        
        # Simple decision logic based on Spark RF prediction
        decision = "Buy" if prediction > last_close else "Hold/Sell"
        
        return jsonify({
            'prediction': prediction, 
            'last_close': last_close, 
            'decision': decision,
            'engine': spark_result['engine']
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
