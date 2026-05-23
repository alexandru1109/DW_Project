#!/bin/bash

# Function to handle cleanup on script exit
cleanup() {
    echo "Stopping all processes..."
    # Kill the entire process group of this script
    kill -- -$$ 2>/dev/null
    exit
}

# Trap SIGINT (Ctrl+C) and SIGTERM
trap cleanup SIGINT SIGTERM

echo "==================================="
echo "Starting Trading 2.0 Services"
echo "==================================="

echo "[0/4] Checking/Starting local MongoDB..."
# Check if MongoDB is already running on default port 27017
if ! lsof -i:27017 > /dev/null 2>&1; then
    if [ ! -f "./local_mongo/bin/mongod" ]; then
        echo "Local MongoDB not found. Downloading..."
        mkdir -p local_mongo/data
        cd local_mongo
        curl -O https://fastdl.mongodb.org/linux/mongodb-linux-x86_64-ubuntu2204-7.0.12.tgz
        tar -zxvf mongodb-linux-x86_64-ubuntu2204-7.0.12.tgz --strip-components=1
        rm mongodb-linux-x86_64-ubuntu2204-7.0.12.tgz
        cd ..
    fi
    echo "Starting MongoDB..."
    ./local_mongo/bin/mongod --dbpath ./local_mongo/data --logpath ./local_mongo/mongodb.log --fork
else
    echo "MongoDB is already running."
fi

echo "Waiting for MongoDB to be ready..."
until ./local_mongo/bin/mongod --version > /dev/null 2>&1; do
  sleep 1
done
# Simple check to see if it's accepting connections could be added, but fork returns when ready mostly.
sleep 2 

echo "[1/4] Checking dependencies..."

# Check and install Backend dependencies
cd backend
echo "Installing/verifying backend dependencies..."
npm install --no-fund --no-audit
cd ..

# Check and install Frontend dependencies
cd frontend
echo "Installing/verifying frontend dependencies..."
npm install --no-fund --no-audit
cd ..

# Check and install LSTM dependencies
cd lstm_network
echo "Installing/verifying python dependencies..."
pip install -r requirements.txt --quiet
cd ..


echo "[2/4] Starting Backend (Port 5869 expected)..."
cd backend
npm run dev &
cd ..

echo "[3/4] Starting Frontend (Vite)..."
cd frontend
npm start &
cd ..

echo "[4/4] Starting LSTM Network API (Flask expected on port 5000)..."
cd lstm_network
python3 app.py &
cd ..

echo "==================================="
echo "All services are starting up!"
echo "Press Ctrl+C to stop all services."
echo "==================================="

# Wait for all background processes
wait
