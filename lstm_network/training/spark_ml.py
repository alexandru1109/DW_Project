import argparse
import yfinance as yf
import pandas as pd
from pyspark.sql import SparkSession
from pyspark.sql.functions import col, lag, rand
from pyspark.sql.window import Window
from pyspark.ml.feature import VectorAssembler
from pyspark.ml.regression import RandomForestRegressor
import json
import sys

def predict_with_spark(symbol):
    try:
        # 1. Fetch data using yfinance
        stock_data = yf.download(symbol, period="2y", interval="1d", progress=False)
        if stock_data.empty:
            raise ValueError(f"No data found for symbol {symbol}")
        
        # Flatten MultiIndex columns if they exist (yfinance sometimes returns MultiIndex)
        if isinstance(stock_data.columns, pd.MultiIndex):
            stock_data.columns = stock_data.columns.get_level_values(0)

        stock_data = stock_data.reset_index()
        # Ensure Date is string for PySpark
        stock_data['Date'] = stock_data['Date'].astype(str)
        # Keep only necessary columns
        pdf = stock_data[['Date', 'Open', 'High', 'Low', 'Close', 'Volume']].dropna()

        # 2. Initialize Spark
        # Using a quiet spark session
        spark = SparkSession.builder \
            .appName("SparkMLPrediction") \
            .master("local[*]") \
            .config("spark.ui.showConsoleProgress", "false") \
            .config("spark.driver.memory", "2g") \
            .getOrCreate()
        
        spark.sparkContext.setLogLevel("ERROR")

        # Convert to Spark DataFrame
        df = spark.createDataFrame(pdf)

        # 3. Feature Engineering with Spark
        # Create a window ordered by Date
        windowSpec = Window.orderBy("Date")
        
        # We want to predict the 'Close' price of the NEXT day.
        # So our label/target is lead(Close, 1)
        # But wait, lag/lead in PySpark: lead(col, 1) is next day.
        # Alternatively, we predict current 'Close' based on previous day's features.
        
        df = df.withColumn("Prev_Close", lag("Close", 1).over(windowSpec))
        df = df.withColumn("Prev_Open", lag("Open", 1).over(windowSpec))
        df = df.withColumn("Prev_High", lag("High", 1).over(windowSpec))
        df = df.withColumn("Prev_Low", lag("Low", 1).over(windowSpec))
        df = df.withColumn("Prev_Vol", lag("Volume", 1).over(windowSpec))

        # Drop rows with nulls due to lag
        df_clean = df.na.drop()

        # Assemble features
        feature_cols = ["Prev_Close", "Prev_Open", "Prev_High", "Prev_Low", "Prev_Vol"]
        assembler = VectorAssembler(inputCols=feature_cols, outputCol="features")
        
        df_assembled = assembler.transform(df_clean)

        # 4. Train/Test Split (Time series aware - just take last N for test, but for simple MLlib we can just train on all but last row to predict the very last row's next day)
        # We will train on all historical data to maximize knowledge
        rf = RandomForestRegressor(featuresCol="features", labelCol="Close", numTrees=50, maxDepth=5, seed=42)
        
        model = rf.fit(df_assembled)

        # 5. Make Prediction for the "next" day.
        # To predict tomorrow, we use today's actual Close, Open, High, Low as the "Prev_" features for tomorrow.
        last_row = pdf.iloc[-1]
        future_data = [(
            "Future", 
            float(last_row['Close']), 
            float(last_row['Open']), 
            float(last_row['High']), 
            float(last_row['Low']), 
            float(last_row['Volume'])
        )]
        
        df_future = spark.createDataFrame(future_data, ["Date", "Prev_Close", "Prev_Open", "Prev_High", "Prev_Low", "Prev_Vol"])
        df_future_assembled = assembler.transform(df_future)
        
        predictions = model.transform(df_future_assembled)
        predicted_price = predictions.select("prediction").collect()[0][0]

        # Stop Spark
        spark.stop()

        # Output the result as JSON to stdout so Node/Flask can read it
        historical_close = pdf['Close'].tail(60).tolist()
        result = {
            "symbol": symbol,
            "current_price": float(last_row['Close']),
            "predicted_price": float(predicted_price),
            "historical_data": historical_close,
            "engine": "Apache Spark MLlib (RandomForest)"
        }
        
        print(json.dumps(result))
        
    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--symbol", type=str, required=True, help="Stock symbol to predict")
    args = parser.parse_args()
    
    predict_with_spark(args.symbol)
