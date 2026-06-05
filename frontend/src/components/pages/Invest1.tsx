import React, { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../Home/Navbar";
import axios from "../../config/axiosConfig";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Filler,
    TimeScale,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import "./Invest1.css";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Filler,
    TimeScale
);

interface Stock {
  symbol: string;
  name?: string;
  currentPrice: number;
}

interface HistoryItem {
    date: string;
    price: number;
}

interface MarketStatus {
    state: string;
    exchange: string;
    timezone: string;
}

const Invest: React.FC = () => {
  const location = useLocation();
  const stock = location.state?.stock as Stock | undefined;

  const [orderType, setOrderType] = useState<"market" | "limit">("market");
  const [quantity, setQuantity] = useState(1);
  const [currentPrice, setCurrentPrice] = useState(stock?.currentPrice || 0);
  const [limitPrice, setLimitPrice] = useState(stock?.currentPrice || 0);
  const [estimatedCost, setEstimatedCost] = useState(0);
  const [marketStatus, setMarketStatus] = useState<MarketStatus | null>(null);
  
  // Chart state
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [range, setRange] = useState<string>("1mo");
  const [isLoadingChart, setIsLoadingChart] = useState(false);
  const priceIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchHistory = useCallback(async () => {
    if (!stock) return;
    setIsLoadingChart(true);
    try {
        const response = await axios.get(`/market/history/${stock.symbol}?range=${range}`);
        setHistory(response.data.history);
    } catch (error) {
        console.error("Error fetching history", error);
    } finally {
        setIsLoadingChart(false);
    }
  }, [stock, range]);

  const fetchRealTimePrice = useCallback(async () => {
    if (!stock) return;
    try {
        const response = await axios.get(`/market/price/${stock.symbol}`);
        const newPrice = response.data.currentPrice;
        setCurrentPrice(newPrice);
        setMarketStatus({
            state: response.data.marketState,
            exchange: response.data.fullExchangeName,
            timezone: response.data.exchangeTimezoneName
        });
        
        // Update history with new point if it's different from last
        setHistory(prev => {
            if (prev.length === 0) return prev;
            const last = prev[prev.length - 1];
            if (last.price !== newPrice) {
                return [...prev, { date: new Date().toISOString(), price: newPrice }];
            }
            return prev;
        });
    } catch (error) {
        console.error("Error fetching real-time price", error);
    }
  }, [stock]);

  useEffect(() => {
    fetchHistory();
    fetchRealTimePrice(); // Initial fetch
  }, [fetchHistory, fetchRealTimePrice]);

  useEffect(() => {
    priceIntervalRef.current = setInterval(fetchRealTimePrice, 10000);
    return () => {
        if (priceIntervalRef.current) clearInterval(priceIntervalRef.current);
    };
  }, [fetchRealTimePrice]);

  useEffect(() => {
    if (orderType === "market") {
      setEstimatedCost(quantity * currentPrice);
    } else if (orderType === "limit") {
      setEstimatedCost(quantity * limitPrice);
    }
  }, [quantity, limitPrice, orderType, currentPrice]);

  const handleBuy = async () => {
    if (!stock) return alert("No stock selected.");
    const price = orderType === "market" ? currentPrice : limitPrice;
    
    const transaction = {
        type: "buy",
        quantity,
        price,
        date: new Date(),
        symbol: stock.symbol,
        strategy: orderType,
    };

    try {
        await axios.post("/transactions/add", transaction);
        alert(`Successfully bought ${quantity} unit(s) of ${stock.symbol} at $${price.toFixed(2)}`);
    } catch (error: any) {
        alert(error.response?.data?.message || "Error completing purchase.");
    }
  };

  if (!stock) {
    return (
      <div className="invest-root">
        <Navbar />
        <main style={{ textAlign: 'center', marginTop: '50px' }}>
          <h1>No stock selected</h1>
          <p>Please select a stock from the search bar or market list.</p>
        </main>
      </div>
    );
  }

  const isMarketOpen = marketStatus?.state === 'REGULAR';

  const chartData = {
    labels: history.map(h => new Date(h.date)),
    datasets: [
        {
            label: 'Price',
            data: history.map(h => h.price),
            borderColor: '#4caf50',
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
            borderWidth: 2,
            pointRadius: 0,
            fill: true,
            tension: 0.2,
        }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false },
        tooltip: {
            mode: 'index' as const,
            intersect: false,
            backgroundColor: '#1f2a38',
            titleColor: '#fff',
            bodyColor: '#4caf50',
            borderColor: '#3a3d46',
            borderWidth: 1,
        },
    },
    scales: {
        x: {
            type: 'time' as const,
            time: {
                unit: (range === '1d' ? 'hour' : 'day') as any,
                displayFormats: {
                    hour: 'HH:mm',
                    day: 'MMM d'
                }
            },
            grid: { display: false },
            ticks: { color: '#9ea2a8' }
        },
        y: {
            grid: { color: '#2a313c' },
            ticks: { color: '#9ea2a8' }
        }
    },
    interaction: {
        mode: 'nearest' as const,
        axis: 'x' as const,
        intersect: false
    }
  };

  return (
    <div className="invest-root">
      <Navbar />
      <main className="invest-container">
        <div className="invest-left">
            <header className="invest-header">
                <div className="title-area">
                    <h1>{stock.symbol}</h1>
                    <div className={`market-status-badge ${isMarketOpen ? 'open' : 'closed'}`}>
                        {isMarketOpen ? '● Market Open' : '● Market Closed'}
                    </div>
                </div>
                <div className="price-display">
                    <span className="current-price">${currentPrice.toFixed(2)}</span>
                    <span className="price-label">Real-time Price</span>
                </div>
            </header>

            <section className="chart-section">
                <div className="range-buttons">
                    {['1d', '5d', '1mo', '6mo', '1y'].map(r => (
                        <button 
                            key={r} 
                            className={range === r ? 'active' : ''} 
                            onClick={() => setRange(r)}
                        >
                            {r.toUpperCase()}
                        </button>
                    ))}
                </div>
                <div className="chart-wrapper">
                    {isLoadingChart ? (
                        <div className="chart-loading">Loading chart data...</div>
                    ) : history.length > 0 ? (
                        <Line data={chartData} options={chartOptions} />
                    ) : (
                        <div className="chart-loading">No historical data available for this range.</div>
                    )}
                </div>
            </section>
        </div>

        <div className="invest-right">
            <section className="order-box">
                <h2>Trade {stock.symbol}</h2>
                {!isMarketOpen && (
                    <div className="market-warning">
                        The market for this stock is currently closed. Transactions are disabled until the next regular trading session.
                    </div>
                )}
                <div className="order-type-toggle">
                    <button 
                        className={orderType === "market" ? 'active' : ''} 
                        onClick={() => setOrderType("market")}
                    >
                        Market
                    </button>
                    <button 
                        className={orderType === "limit" ? 'active' : ''} 
                        onClick={() => setOrderType("limit")}
                    >
                        Limit
                    </button>
                </div>

                <div className="input-group">
                    <label>Quantity</label>
                    <input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                        min="1"
                    />
                </div>

                {orderType === "limit" && (
                    <div className="input-group">
                        <label>Limit Price</label>
                        <input
                            type="number"
                            value={limitPrice}
                            onChange={(e) => setLimitPrice(Math.max(0, Number(e.target.value)))}
                            min="0"
                            step="0.01"
                        />
                    </div>
                )}

                <div className="cost-summary">
                    <div className="cost-row">
                        <span>Estimated Cost</span>
                        <span className="total-cost">${estimatedCost.toFixed(2)}</span>
                    </div>
                    <button 
                        className="buy-btn" 
                        onClick={handleBuy}
                        disabled={!isMarketOpen}
                        style={{ backgroundColor: !isMarketOpen ? '#3a3d46' : '#4caf50', cursor: !isMarketOpen ? 'not-allowed' : 'pointer' }}
                    >
                        {isMarketOpen ? 'Confirm Purchase' : 'Market Closed'}
                    </button>
                </div>
            </section>
        </div>
      </main>
    </div>
  );
};

export default Invest;
