import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from '../../config/axiosConfig'; // Ensure your Axios instance is correctly configured
import './OtpReset.css'; // Include appropriate CSS for styling

const OtpReset: React.FC = () => {
    const [otp, setOtp] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email; // Retrieve email from the navigation state

    // Redirect to login if email is not present in the navigation state
    if (!email) {
        console.error('Email is missing in navigation state'); // Debugging log
        navigate('/login');
        return null;
    }

    const handleVerifyOtp = async (event: React.FormEvent) => {
        event.preventDefault();

        try {
            console.log(`Verifying OTP for email: ${email}, OTP: ${otp}`); // Debugging log
            const response = await axios.post('/auth/confirm-password-change', { email, otp });

            if (response.status === 200) {
                setSuccessMessage('OTP verified successfully. Password has been reset.');
                setErrorMessage('');
                console.log('Password reset successful. Redirecting to login page.'); // Debugging log
                setTimeout(() => navigate('/login'), 3000); // Redirect to login page after success
            } else {
                setErrorMessage('Invalid OTP. Please try again.');
                console.error('Error: OTP verification failed'); // Debugging log
            }
        } catch (error: any) {
            setErrorMessage(
                error.response?.data?.message || 'Invalid OTP. Please try again.'
            );
            console.error('Error verifying OTP:', error); // Debugging log
        }
    };

    return (
        <div className="otp-container1">
            <div className="left-panel1"></div>
            <div className="right-panel1">
                <div className="otp-card1">
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

export default OtpReset;
