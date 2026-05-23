import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './ResetPassword.css';

const ResetPassword: React.FC = () => {
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email || '';

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, code, newPassword })
            });

            if (response.ok) {
                navigate('/login');
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Invalid code or unable to reset password');
            }
        } catch (err: any) {
            setError(err.message || 'Invalid code or unable to reset password. Please try again.');
        }
    };

    return (
        <div className="reset-container">
            <div className="left-panel"></div>
            <div className="right-panel">
                <div className="reset-card">
                    <h2>Reset Password</h2>
                    {error && <p className="error-message3">{error}</p>}
                    <form onSubmit={handleVerify}>
                        <input
                            type="text"
                            placeholder="Enter your code"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Enter new password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                        <button type="submit">Verify</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
