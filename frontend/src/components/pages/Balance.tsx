import React, { useState, useEffect } from 'react';
import axios from '../../config/axiosConfig';
import Navbar from '../Home/Navbar';
import './Balance.css';

const Balance: React.FC = () => {
    const [balance, setBalance] = useState<number | null>(null);
    const [stocks, setStocks] = useState<any[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [amount, setAmount] = useState<number>(0);

    const fetchBalance = async () => {
        try {
            const token = localStorage.getItem('authToken');
            if (token) {
                const response = await axios.get('/balance/get', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setBalance(response.data.balance ?? 0);
            }
        } catch (error) {
            setBalance(0);
            console.error('Error fetching balance:', error);
        }
    };

    const fetchStocks = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const userId = localStorage.getItem('userId');
            if (token && userId) {
                const response = await axios.get(`/stock/get/${userId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setStocks(response.data ?? []);
            }
        } catch (error) {
            setStocks([]);
            console.error('Error fetching stocks:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddBalance = async () => {
        try {
            const token = localStorage.getItem('authToken');
            if (token) {
                const response = await axios.post('/balance/add', { amount }, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setBalance(response.data.balance ?? balance);
            }
        } catch (error) {
            console.error('Error adding balance:', error);
        }
    };

    useEffect(() => {
        fetchBalance();
        fetchStocks();
    }, []);

    return (
        <div className="balance-container">
            <Navbar />
            <div className="balance-header">
                <div className="balance-info">
                    <h2>Your Balance</h2>
                    <p>{balance !== null ? `$${balance.toFixed(2)}` : 'Loading...'}</p>
                </div>
            </div>

            <div className="stocks-header">
                <h2>Your Stocks</h2>
                {isLoading ? (
                    <p>Loading...</p>
                ) : stocks && stocks.length > 0 ? (
                    <ul className="stock-list">
                        {stocks.map(stock => (
                            <li key={stock.symbol} className="stock-item">
                                <div className="stock-details">
                                    <span className="stock-symbol">{stock.symbol}</span>
                                    <span className="stock-quantity">{stock.quantity} shares</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No stocks available</p>
                )}
            </div>

            <div className="balance-actions">
                <div className="action-input">
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        placeholder="Enter amount"
                    />
                </div>
                <div className="action-buttons">
                    <button onClick={handleAddBalance}>Add Balance</button>
                </div>
            </div>
        </div>
    );
};

export default Balance;
