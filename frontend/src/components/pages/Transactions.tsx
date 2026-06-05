import React, { useEffect, useState } from 'react';
import axios from '../../config/axiosConfig';
import Navbar from '../Home/Navbar';
import './Transactions.css';

interface Transaction {
    _id: string;
    type: string;
    quantity: number;
    price: number;
    date: string;
    symbol: string;
    strategy: string;
    logo?: string; // Optional property for the logo URL
}

const Transactions: React.FC = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [balance, setBalance] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchTransactions = async () => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                setError('Authentication token is missing.');
                return;
            }

            const { data } = await axios.post('/transactions/get', null, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (data && Array.isArray(data.transactions)) {
                // Fetch logos for each transaction symbol
                const transactionsWithLogos = await Promise.all(
                    data.transactions.map(async (transaction: Transaction) => {
                        const logoUrl = await fetchLogo(transaction.symbol);
                        return { ...transaction, logo: logoUrl };
                    })
                );
                setTransactions(transactionsWithLogos);
            } else {
                setError('No transactions found.');
            }
        } catch (error) {
            console.error('Error fetching transactions:', error);
            setError('Error fetching transactions.');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchLogo = async (symbol: string): Promise<string> => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                console.error('Authentication token is missing.');
                return '/default-logo.png'; // Fallback logo
            }

            const { data } = await axios.get(`/transactions/logo-get/${symbol}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (data && data.logo) {
                return data.logo; // Return the logo URL
            } else {
                console.error(`Logo not found for symbol: ${symbol}`);
                return '/default-logo.png'; // Fallback logo
            }
        } catch (error) {
            console.error(`Error fetching logo for symbol ${symbol}:`, error);
            return '/default-logo.png'; // Fallback logo
        }
    };

    const fetchBalance = async () => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                setBalance(0);
                return;
            }

            const { data } = await axios.get('/balance/get', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setBalance(data?.balance || 0);
        } catch (error) {
            console.error('Error fetching balance:', error);
            setBalance(0);
        }
    };

    useEffect(() => {
        fetchTransactions();
        fetchBalance();
    }, []);

    return (
        <div className="transaction-list-container">
            <Navbar />
            <div className="transaction-list-content">
                <h1>Transactions</h1>
                {isLoading ? (
                    <p>Loading...</p>
                ) : error ? (
                    <p>{error}</p>
                ) : (
                    <div className="transaction-list">
                        {transactions.map((transaction) => (
                            <div key={transaction._id} className="transaction-item">
                                <div className="transaction-header">
                                    <img
                                        src={transaction.logo || '/default-logo.png'}
                                        alt={`${transaction.symbol} logo`}
                                        className="transaction-logo"
                                    />
                                    <h2>Transaction ID: {transaction._id}</h2>
                                </div>
                                <div className="transaction-details">
                                    <table className="transaction-table">
                                        <tbody>
                                            <tr>
                                                <th>Type:</th>
                                                <td className="transaction-row-highlight">{transaction.type}</td>
                                            </tr>
                                            <tr>
                                                <th>Quantity:</th>
                                                <td>{transaction.quantity}</td>
                                            </tr>
                                            <tr>
                                                <th>Price:</th>
                                                <td className="transaction-row-highlight">${transaction.price.toFixed(2)}</td>
                                            </tr>
                                            <tr>
                                                <th>Date:</th>
                                                <td>{new Date(transaction.date).toLocaleString()}</td>
                                            </tr>
                                            <tr>
                                                <th>Symbol:</th>
                                                <td>{transaction.symbol}</td>
                                            </tr>
                                            <tr>
                                                <th>Strategy:</th>
                                                <td>{transaction.strategy}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Transactions;
