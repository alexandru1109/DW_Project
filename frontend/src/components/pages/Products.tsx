import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom"; 
import axios from "../../config/axiosConfig";
import "./Products.css";
import Navbar from "../Home/Navbar";

interface Stock {
  symbol: string;
  currentPrice: number;
  highPrice?: number;
  lowPrice?: number;
  openPrice?: number;
  previousClosePrice?: number;
  logo?: string; 
}

interface SearchResult {
  symbol: string;
  shortname: string;
  longname: string;
  exchange: string;
  type: string;
}

const StockList10: React.FC = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [symbol, setSymbol] = useState("");
  const [prediction, setPrediction] = useState<string | null>(null);
  const [decision, setDecision] = useState<string | null>(null);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const response = await axios.get("/market/market-summary10");
        if (response.data && Array.isArray(response.data.stocks)) {
          const stocksWithLogos = await Promise.all(
            response.data.stocks.map(async (stock: Stock) => {
              const logo = await fetchLogo(stock.symbol);
              return { ...stock, logo };
            })
          );
          setStocks(stocksWithLogos);
        } else {
          setError("Invalid response format");
        }
      } catch (error) {
        setError("Error fetching stocks");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStocks();
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length === 0) {
      setSearchResults([]);
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await axios.get(`/market/search?query=${searchQuery}`);
        if (response.data && Array.isArray(response.data.results)) {
          setSearchResults(response.data.results);
        }
      } catch (err) {
        console.error("Search error", err);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchQuery]);

  const fetchLogo = async (sym: string): Promise<string> => {
    try {
      const response = await axios.get(`/market/logo/${sym}`);
      if (response.data && response.data.logo) {
        return response.data.logo; 
      }
      return "/default-logo.png";
    } catch (error) {
      return "/default-logo.png"; 
    }
  };

  const handlePredict = async () => {
    if (!symbol) return alert("Select or enter a symbol first");
    try {
      const response = await axios.post("/lstm/predict", { symbol });
      setPrediction(response.data.prediction);
    } catch (error) {
      console.error("Error fetching prediction:", error);
    }
  };

  const handleShouldBuy = async () => {
    if (!symbol) return alert("Select or enter a symbol first");
    try {
      const response = await axios.post("/lstm/should_buy", { symbol });
      setDecision(response.data.decision);
    } catch (error) {
      console.error("Error fetching decision:", error);
    }
  };

  const handleBuy = async (sym: string, price: number) => {
    const quantity = 1;
    const transaction = {
      type: "buy",
      quantity,
      price,
      date: new Date(),
      symbol: sym,
      strategy: "default",
    };

    try {
      await axios.post("/transactions/add", transaction);
      alert(`Bought ${quantity} unit(s) of ${sym} at $${price}`);
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.message) {
        if (error.response.data.message.includes("insufficient funds")) {
          alert("Fonduri insuficiente");
        } else {
          alert("Eroare la cumpărare");
        }
      } else {
        alert("Eroare la cumpărare");
      }
    }
  };

  const handleSell = async (sym: string, price: number) => {
    const quantity = 1;
    const transaction = {
      type: "sell",
      quantity,
      price,
      date: new Date(),
      symbol: sym,
      strategy: "default",
    };

    try {
      await axios.post("/transactions/add", transaction);
      alert(`Sold ${quantity} unit(s) of ${sym} at $${price}`);
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.message) {
        if (error.response.data.message.includes("insufficient stock")) {
          alert("Stoc insuficient");
        } else {
          alert("Eroare la vânzare");
        }
      } else {
        alert("Eroare la vânzare");
      }
    }
  };

  const handleRedirectToInvest = (stock: Stock) => {
    navigate("/invest", { state: { stock } });
  };

  const handleSelectSearchResult = async (result: SearchResult) => {
    setSymbol(result.symbol);
    setSearchQuery("");
    setSearchResults([]);
    
    try {
      const priceRes = await axios.get(`/market/price/${result.symbol}`);
      const currentPrice = priceRes.data.currentPrice;
      const logo = await fetchLogo(result.symbol);
      
      const newStock: Stock = {
        symbol: result.symbol,
        currentPrice: currentPrice,
        logo: logo
      };
      
      // Navigate to Invest page immediately
      handleRedirectToInvest(newStock);
    } catch (error) {
      console.error("Error fetching price for search result", error);
      alert("Could not fetch real-time price for this symbol.");
    }
  };

  return (
    <div className="stock-list-container">
      <Navbar />
      <div className="stock-list-content">
        <div className="stock-input-box">
          <div className="search-container">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for any stock or ETF..."
              className="search-input"
            />
            {isSearching && <div className="search-loading">Searching...</div>}
            {searchResults.length > 0 && (
              <div className="search-results">
                {searchResults.map((result) => (
                  <div 
                    key={result.symbol} 
                    className="search-result-item"
                    onClick={() => handleSelectSearchResult(result)}
                  >
                    <span className="search-result-symbol">{result.symbol}</span>
                    <span className="search-result-name">{result.shortname || result.longname}</span>
                    <span className="search-result-exchange">{result.exchange}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="ai-actions" style={{ marginTop: '20px' }}>
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              placeholder="Symbol for AI prediction"
            />
            <div className="buttons-container">
              <button onClick={handlePredict}>Predict</button>
              <button onClick={handleShouldBuy}>Should Buy</button>
            </div>
            {prediction && <div className="result-message">Prediction: {prediction}</div>}
            {decision && <div className="result-message">Decision: {decision}</div>}
          </div>
        </div>

        {isLoading ? (
          <p>Loading market summary...</p>
        ) : error ? (
          <p>{error}</p>
        ) : (
          <div className="stock-list">
            {stocks.map((stock) => (
              <div key={stock.symbol} className="stock-item" onClick={() => handleRedirectToInvest(stock)}>
                <div className="stock-header">
                  <img
                    src={stock.logo || "/default-logo.png"}
                    alt={`${stock.symbol} logo`}
                    className="stock-logo"
                  />
                  <h2>{stock.symbol}</h2>
                </div>
                <div className="stock-details">
                  <div className="stock-label">Current Price:</div>
                  <div className="stock-value">${stock.currentPrice?.toFixed(2)}</div>
                </div>
                <div className="stock-buttons">
                  <button
                    className="buy-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBuy(stock.symbol, stock.currentPrice);
                    }}
                  >
                    Buy
                  </button>
                  <button
                    className="sell-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSell(stock.symbol, stock.currentPrice);
                    }}
                  >
                    Sell
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StockList10;
