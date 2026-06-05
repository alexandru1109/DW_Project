import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../config/axiosConfig';

const VerifyAccount: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [message, setMessage] = useState<string>('Verifying your account...');

  useEffect(() => {
    const verifyToken = async () => {
      try {
        // Send the token to the existing backend endpoint
        await axios.get(`/auth/verify/${token}`);
        setMessage('Your account has been successfully verified!');
        setTimeout(() => navigate('/login'), 3000); // Redirect after 3 seconds
      } catch (error) {
        setMessage('Verification failed. The token may be invalid or expired.');
      }
    };

    verifyToken();
  }, [token, navigate]);

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h1>{message}</h1>
    </div>
  );
};

export default VerifyAccount;
