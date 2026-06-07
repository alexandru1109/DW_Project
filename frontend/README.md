# Frontend Web Application

The user interface for the Trading and Data Warehouse platform, designed for high performance and a rich aesthetic.

## Tech Stack
- **Framework**: React
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: Vanilla CSS (modularized per component)
- **HTTP Client**: Axios

## Getting Started

### Installation
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```

### Configuration
Ensure your backend URL is properly configured. If needed, create a `.env` file to override the default API endpoint:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### Running the Application
To start the Vite development server with Hot Module Replacement (HMR):
```bash
npm run dev
```

To build the application for production:
```bash
npm run build
```

To preview the production build locally:
```bash
npm run preview
```

## Project Structure highlights
- `/src/components`: Reusable UI components categorized by feature (Auth, Home, Main).
- `/src/pages`: Top-level page components representing different views (Balance, Chatbot, Transactions, etc.).
- `/src/context`: React Context providers (e.g., `AuthContext.tsx`) for global state management.
