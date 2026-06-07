import argparse
from pyspark.sql import SparkSession
from pyspark.sql.functions import col, current_timestamp
from pyspark.sql.types import StructType, StructField, StringType, DoubleType, LongType
import os
import time

def process_stream(input_dir, output_dir, checkpoint_dir):
    print(f"Starting Spark Streaming from {input_dir}...")
    spark = SparkSession.builder \
        .appName("StockDataStreaming") \
        .master("local[*]") \
        .getOrCreate()

    # Define schema for the incoming JSON data
    # Assuming data looks like: {"Symbol": "AAPL", "Price": 150.5, "Volume": 100}
    schema = StructType([
        StructField("Symbol", StringType(), True),
        StructField("Price", DoubleType(), True),
        StructField("Volume", LongType(), True)
    ])

    # Read streaming data from the input directory
    # Using JSON format as it's common for streaming stock ticks
    df_stream = spark.readStream \
        .schema(schema) \
        .json(input_dir)

    # Basic transformation: Add a processing timestamp
    df_processed = df_stream.withColumn("ProcessedTime", current_timestamp())

    # Write the stream
    # We write to console for easy local debugging, but also to files if needed.
    # We will write to console to demonstrate the capability locally.
    
    # Using 'append' output mode as we are just adding new rows
    query = df_processed.writeStream \
        .outputMode("append") \
        .format("console") \
        .trigger(processingTime='5 seconds') \
        .start()
    
    # Also write to CSV output dir as an alternative
    query_files = df_processed.writeStream \
        .outputMode("append") \
        .format("csv") \
        .option("path", output_dir) \
        .option("checkpointLocation", checkpoint_dir) \
        .trigger(processingTime='5 seconds') \
        .start()

    try:
        # Keep the streaming process running. For a real app, this runs indefinitely.
        # Here we add a timeout just so it doesn't hang the system if run accidentally,
        # but in production, you use awaitTermination() without timeout.
        print("Streaming is active. Waiting for data... (Press Ctrl+C to stop)")
        query.awaitTermination()
        query_files.awaitTermination()
    except KeyboardInterrupt:
        print("Stopping stream...")
    finally:
        query.stop()
        query_files.stop()
        spark.stop()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Spark Streaming Simulation")
    parser.add_argument("--input", type=str, default="data/stream_in", help="Input streaming directory")
    parser.add_argument("--output", type=str, default="data/stream_out", help="Output streaming directory")
    parser.add_argument("--checkpoint", type=str, default="data/stream_checkpoint", help="Checkpoint directory")
    args = parser.parse_args()
    
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    in_dir = os.path.join(base_dir, args.input)
    out_dir = os.path.join(base_dir, args.output)
    chk_dir = os.path.join(base_dir, args.checkpoint)
    
    # Ensure directories exist
    os.makedirs(in_dir, exist_ok=True)
    os.makedirs(out_dir, exist_ok=True)
    os.makedirs(chk_dir, exist_ok=True)
    
    process_stream(in_dir, out_dir, chk_dir)
