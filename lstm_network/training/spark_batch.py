import argparse
from pyspark.sql import SparkSession
from pyspark.sql.functions import col, avg
from pyspark.sql.window import Window
from pyspark.ml.feature import MinMaxScaler, VectorAssembler
import os

def process_batch(input_path, output_path):
    print("Starting Spark Batch Processing...")
    spark = SparkSession.builder \
        .appName("StockDataBatchProcessing") \
        .master("local[*]") \
        .getOrCreate()

    # Create dummy data if input doesn't exist to demonstrate functionality
    if not os.path.exists(input_path):
        print(f"Input path {input_path} not found. Creating sample data...")
        os.makedirs(os.path.dirname(input_path), exist_ok=True)
        # Create a simple CSV with Date, Symbol, Close, Volume
        sample_data = [
            ("2023-01-01", "AAPL", 150.0, 10000),
            ("2023-01-02", "AAPL", 155.0, 15000),
            ("2023-01-03", "AAPL", 153.0, 12000),
            ("2023-01-04", "AAPL", 158.0, 18000),
            ("2023-01-05", "AAPL", 160.0, 20000)
        ]
        df_sample = spark.createDataFrame(sample_data, ["Date", "Symbol", "Close", "Volume"])
        df_sample.write.csv(input_path, header=True, mode="overwrite")

    # Load data
    try:
        df = spark.read.csv(input_path, header=True, inferSchema=True)
        print("Data schema:")
        df.printSchema()
        
        # Ensure we have required columns for processing. Assuming 'Close' exists.
        if "Close" in df.columns:
            # Example Transformation 1: Calculate 3-day Moving Average (if sufficient data exists)
            # Assuming 'Date' is string or date type that can be ordered
            windowSpec = Window.partitionBy("Symbol").orderBy("Date").rowsBetween(-2, 0)
            df = df.withColumn("MA_3", avg("Close").over(windowSpec))
            
            # Example Transformation 2: Scaling the 'Close' prices using PySpark ML
            # MinMaxScaler requires vector column
            assembler = VectorAssembler(inputCols=["Close"], outputCol="Close_Vec")
            df_vector = assembler.transform(df)
            
            scaler = MinMaxScaler(inputCol="Close_Vec", outputCol="Close_Scaled")
            scalerModel = scaler.fit(df_vector)
            df_scaled = scalerModel.transform(df_vector)
            
            # Select final columns to save (drop vector column for easy saving)
            df_final = df_scaled.drop("Close_Vec")
            
            print("Processing complete. Showing top 5 rows:")
            df_final.show(5)

            # Save processed data
            df_final.write.csv(output_path, header=True, mode="overwrite")
            print(f"Saved processed data to {output_path}")
        else:
            print("Error: 'Close' column not found in input data.")
            
    except Exception as e:
        print(f"Error during batch processing: {e}")
    finally:
        spark.stop()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Spark Batch Processing for Stock Data")
    parser.add_argument("--input", type=str, default="data/sample_historical.csv", help="Input CSV path")
    parser.add_argument("--output", type=str, default="data/processed_batch", help="Output directory path")
    args = parser.parse_args()
    
    # Ensure relative paths resolve correctly from the script location or project root
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    in_path = os.path.join(base_dir, args.input)
    out_path = os.path.join(base_dir, args.output)
    
    process_batch(in_path, out_path)
