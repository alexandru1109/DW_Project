# LSTM Network & Spark Data Processing

This microservice handles the heavy lifting for data analytics, specifically focusing on machine learning predictions (LSTM) and large-scale data manipulation (Apache Spark).

## Tech Stack
- **Language**: Python 3
- **Web Framework**: Flask
- **Machine Learning**: TensorFlow (Keras), Scikit-Learn
- **Data Manipulation**: Pandas, NumPy
- **Big Data Engine**: Apache Spark (PySpark)

## Getting Started

### Prerequisites
- Python 3.9+
- Java 8 or 11 (required to run Apache Spark locally)

### Installation
1. Navigate to this directory:
   ```bash
   cd lstm_network
   ```
2. Create and activate a virtual environment (recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   ```
3. Install the dependencies:
   ```bash
   pip install -r requirements.txt
   ```

### Running the Application (Flask)
Start the Python REST API that serves predictions:
```bash
python app.py
# or
flask run
```

## Apache Spark Integration

We use PySpark to process stock data at scale and simulate real-time data streaming.

### 1. Batch Processing
To process large datasets of historical CSV files, calculate moving averages, and scale features using PySpark ML:
```bash
python training/spark_batch.py
```
*(This can also be triggered remotely via the Node.js backend `/api/spark/batch` endpoint).*

### 2. Streaming Processing (Simulation)
To run the Structured Streaming job that listens for new files in `data/stream_in/`:
```bash
python training/spark_stream.py
```
*Drop JSON files containing stock ticks into `lstm_network/data/stream_in/` to see the stream process them in real time.*
