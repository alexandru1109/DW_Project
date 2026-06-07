# Backend API (Node.js)

This is the core API server that handles business logic, user authentication, portfolio management, and acts as a bridge to the Python AI/Data Processing microservices.

## Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB (via Mongoose)
- **Authentication**: JWT (JSON Web Tokens)

## Getting Started

### Installation
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```

### Configuration
Create a `.env` file in the root of the `backend/` directory (if not already present). Example variables:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/your_db_name
JWT_SECRET=your_super_secret_key
LLAMA_API_URL=http://localhost:11434
```

### Running the Server
To start the server in development mode (with hot-reloading):
```bash
npm run dev
```

To build for production:
```bash
npm run build
npm start
```

## Main Integrations
- **Spark Jobs**: The backend can trigger local Spark processing via the `POST /api/spark/batch` endpoint using Node's `child_process`.
- **LSTM Predictions**: Proxies prediction requests to the Python Flask application.
- **Ollama**: Connects to the local Llama API for the AI Chatbot functionality.
