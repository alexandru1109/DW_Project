import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Verify.css';

const Verify: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [message, setMessage] = useState('Confirming your email...');
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const confirmEmail = async () => {
      if (!token) {
        setMessage('Invalid or missing token. Unable to confirm email.');
        setIsError(true);
        return;
      }

      try {
        const response = await axios.post(`http://localhost:5869/api/auth/verify/${token}`);
        
        if (response.status === 200) {
          setMessage('Your email has been successfully confirmed! Redirecting to login...');
          setIsError(false);
          setTimeout(() => navigate('/login'), 5000);
        } else {
          throw new Error('Unexpected response from the server.');
        }
      } catch (error: any) {
        setMessage(error.response?.data?.message || 'Error confirming your email. Please try again.');
        setIsError(true);
      }
    };

    confirmEmail();
  }, [token, navigate]);

  return (
    <div className="verify-container">
      <div className="left-panel"></div>
      <div className="right-panel">
        <div className={`verify-card ${isError ? 'error' : 'success'}`}>
          <h2>Email Confirmation</h2>
          <p>{message}</p>
          {isError && (
            <button onClick={() => navigate('/resend-verification')} className="resend-button">
              Resend Verification Email
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Verify;
