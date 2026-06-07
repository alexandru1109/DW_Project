# Data Warehouse & Trading Analysis Platform

A comprehensive Data Warehouse (DW) and Trading Analysis platform integrating a modern web stack (MERN) with advanced Machine Learning (LSTM for stock price prediction) and Big Data processing (Apache Spark).

## Architecture

The project is split into three main microservices/components:

1. **[Frontend](./frontend/)**: User Interface built with React, Vite, and TypeScript. Handles data visualization, user authentication, and portfolio management.
2. **[Backend](./backend/)**: RESTful API built with Node.js, Express, and TypeScript. Acts as the gateway between the database (MongoDB), frontend, and Python microservices.
3. **[LSTM Network & Data Processing](./lstm_network/)**: Python backend utilizing TensorFlow/Keras for Deep Learning predictions and Apache Spark for large-scale data batching and streaming.

## Prerequisites

Make sure you have the following installed on your machine:
- Node.js (v18+)
- Python (v3.9+)
- MongoDB (Running locally or accessible via URI)
- Java (Required for Apache Spark)

## Quick Start

### 1. Database Setup
Ensure MongoDB is running. The default local connection usually points to `mongodb://localhost:27017/`.

### 2. Python Environment (LSTM & Spark)
Navigate to the Python directory, install dependencies, and start the Flask app:
```bash
cd lstm_network
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

### 3. Backend (Node.js)
Open a new terminal, install dependencies, and start the development server:
```bash
cd backend
npm install
npm run dev
```

### 4. Frontend (React)
Open another terminal, install dependencies, and start the Vite UI server:
```bash
cd frontend
npm install
npm run dev
```

*(Alternatively, you can run the `start-all.sh` script if your environment is configured for it).*

## Key Features
- **Stock Tracking & Portfolio:** Monitor stock prices and manage portfolios.
- **AI Chatbot Integration:** Embedded assistant powered by Llama.
- **Predictive Analytics:** Stock price prediction using LSTM Neural Networks.
- **Big Data Processing:** Apache Spark integration for handling large historical datasets and real-time streaming simulations.
