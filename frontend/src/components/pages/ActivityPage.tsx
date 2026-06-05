import React, { useEffect, useState } from "react";
import axios from "../../config/axiosConfig"; // Configurația Axios
import Navbar from "../Home/Navbar";
import "./ActivityPage.css";

interface Transaction {
  _id: string;
  type: string;
  quantity: number;
  price: number;
  date: string;
  symbol: string;
  strategy: string;
}

const ActivityPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          setError("User not authenticated");
          setIsLoading(false);
          return;
        }

        const response = await axios.post(
          "/transactions/get",
          null,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data && Array.isArray(response.data.transactions)) {
          setTransactions(response.data.transactions);
        } else {
          setError("No transactions found...");
        }
      } catch (error: any) {
        console.error("Error fetching transactions:", error);
        setError("Failed to fetch transactions");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  return (
    <div className="activity-container">
      <Navbar />
      <div className="layout-content-container">
        <h1 className="activity-title">Activity</h1>
        {isLoading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : transactions.length > 0 ? (
          transactions.map((transaction, index) => (
            <div key={index} className="activity-item">
              <div className="activity-details">
                <div className="activity-icon">
                  {transaction.type === "buy" ? "📈" : "📉"}
                </div>
                <div>
                  <p className="activity-description">
                    {transaction.type === "buy" ? "Buy" : "Sell"} {transaction.symbol}
                  </p>
                  <p className="activity-amount">
                    {transaction.type === "buy" ? "-" : "+"} $
                    {(transaction.quantity * transaction.price).toFixed(2)}
                  </p>
                  <p className="activity-date">
                    {new Date(transaction.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="activity-arrow">➡️</div>
            </div>
          ))
        ) : (
          <p>No transactions found</p>
        )}
      </div>
    </div>
  );
};

export default ActivityPage;
