import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from '../../config/axiosConfig';
import './Otp.css';

const Otp: React.FC = () => {
    const [otp, setOtp] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;

    useEffect(() => {
        console.log('Email:', email);
        if (!email) {
            navigate('/login');
        }
    }, [email, navigate]);

    const handleVerifyOtp = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
            const response = await axios.post('/auth/verify-otp', { email, otp });
            const { token } = response.data;
            localStorage.setItem('authToken', token);
            navigate('/home');
        } catch (error) {
            setErrorMessage('Codul nu este valid. Te rugăm să încerci din nou.');
            console.error('There was an error verifying the OTP!', error);
        }
    };

    return (
        <div className="otp-container2">
            <div className="left-panel2"></div>
            <div className="right-panel2">
                <div className="otp-card2">
                    <h2>Enter code</h2>
                    {errorMessage && <div className="error-message">{errorMessage}</div>}
                    <form onSubmit={handleVerifyOtp}>
                        <input
                            type="text"
                            placeholder="Enter email code"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            required
                        />
                        <button type="submit">Verify</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Otp;
