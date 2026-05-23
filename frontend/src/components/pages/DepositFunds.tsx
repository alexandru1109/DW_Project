import React, { useState, useEffect } from 'react';
import Navbar from '../Home/Navbar';
import './DepositFunds.css';
import Chatbot from './Chatbot';
import axios from '../../config/axiosConfig';

const DepositFunds: React.FC = () => {
  const [chatbotVisible, setChatbotVisible] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [stocks, setStocks] = useState<any[] | null>(null);
  const [formData, setFormData] = useState({
    cardNumber: '',
    expirationDate: '',
    cvv: '',
    cardHolderName: '',
    transferAmount: '',
  });

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
  const handleSubmit1 = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("authToken");
      if (token) {
        const response = await axios.post(
          "/balance/add",
          { amount: formData.transferAmount },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setBalance(response.data.balance ?? balance); // Actualizăm soldul local
        alert("Balance successfully added!");
  
        // Notificăm Navbar că soldul s-a schimbat
        window.dispatchEvent(new Event("balanceUpdated"));
      }
    } catch (error) {
      console.error("Error adding balance:", error);
      alert("Error processing payment. Please try again.");
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
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        const response = await axios.post('/balance/add', { amount: formData.transferAmount }, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setBalance(response.data.balance ?? balance);
        alert('Balance successfully added!');
      }
    } catch (error) {
      console.error('Error adding balance:', error);
      alert('Error processing payment. Please try again.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    fetchBalance();
    fetchStocks();
  }, []);

  const toggleChatbot = () => {
    setChatbotVisible(!chatbotVisible);
  };

  return (
    <div className="deposit-funds-container">
      <Navbar />

      <div className="layout-container">
        <div className="layout-content-container">
          <h1 className="title">Deposit funds</h1>
          <p className="description">
            Choose a funding method to deposit money into your account. For ACH and wire transfers, please allow 1-3
            business days for the funds to appear in your account.
          </p>

          <div className="balance-section">
            <h2>Your Balance</h2>
            <p className="balance-amount">{balance !== null ? `$${balance.toFixed(2)}` : 'Loading...'}</p>
          </div>

          <h3 className="section-title">Wire Transfer</h3>
          <p className="section-description">Please use the following information to complete your transfer:</p>
          <div className="details-grid">
            <div className="detail">
              <p className="label">Account number</p>
              <p className="value">1234567890</p>
            </div>
            <div className="detail">
              <p className="label">Bank name</p>
              <p className="value">Stockbank</p>
            </div>
            <div className="detail">
              <p className="label">Bank address</p>
              <p className="value">123 Wall Street, New York, NY 10005</p>
            </div>
            <div className="detail">
              <p className="label">SWIFT code</p>
              <p className="value">STOCKUS33</p>
            </div>
          </div>
          <div className="button-container">
            <button className="button">Copy instructions</button>
          </div>

          <h3 className="section-title">ACH Transfer</h3>
          <p className="section-description">Enter your card details and the amount to complete the transfer:</p>
          <form className="ach-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="transferAmount" className="form-label">Transfer Amount</label>
              <input
                type="number"
                id="transferAmount"
                name="transferAmount"
                className="form-input"
                value={formData.transferAmount}
                onChange={handleInputChange}
                placeholder="Enter amount"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="cardNumber" className="form-label">Card Number</label>
              <input
                type="text"
                id="cardNumber"
                name="cardNumber"
                className="form-input"
                value={formData.cardNumber}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="expirationDate" className="form-label">Expiration Date</label>
              <input
                type="text"
                id="expirationDate"
                name="expirationDate"
                className="form-input"
                placeholder="MM/YY"
                value={formData.expirationDate}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="cvv" className="form-label">CVV</label>
              <input
                type="text"
                id="cvv"
                name="cvv"
                className="form-input"
                value={formData.cvv}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="cardHolderName" className="form-label">Cardholder Name</label>
              <input
                type="text"
                id="cardHolderName"
                name="cardHolderName"
                className="form-input"
                value={formData.cardHolderName}
                onChange={handleInputChange}
                required
              />
            </div>
            <button type="submit" className="button">Submit Payment</button>
          </form>

          <h3 className="section-title">Check</h3>
          <p className="section-description">
            Please make the check payable to: Stockbank, Inc. and mail to: 123 Wall Street, New York, NY 10005
          </p>
          <div className="button-container">
            <button className="button">Copy instructions</button>
          </div>

        </div>
      </div>

      <button className="chatbot-icon" onClick={toggleChatbot}>
        💬
      </button>
      {chatbotVisible && <Chatbot />}

    </div>
  );
};

export default DepositFunds;
