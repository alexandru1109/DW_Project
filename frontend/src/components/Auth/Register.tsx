import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../config/axiosConfig';
import './Register.css';

const Register: React.FC = () => {
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
            await axios.post('/auth/register', {
                name: `${firstName} ${lastName}`,
                email,
                password,
                phone,
                role: 'user',
                strategy: 'strategy1',
            });
            navigate('/login');
        } catch (error) {
            console.error('There was an error registering!', error);
        }
    };

    return (
        <div className="register-container">
            <div className="left-panel"></div>
            <div className="right-panel">
                <div className="register-card">
                    <h2>Register</h2>
                    <form onSubmit={handleRegister}>
                        <input
                            type="text"
                            placeholder="First Name"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                        />
                        <input
                            type="text"
                            placeholder="Last Name"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required
                        />
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <input
                            type="text"
                            placeholder="Phone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button type="submit">Register</button>
                    </form>
                    <p>
                        Already have an account? <a href="/login">Login here</a>
                    </p>
                    <div className="contact-support">
                        <p>For support, contact us:</p>
                        <p>Email: support@example.com</p>
                        <p>Phone: +1 234 567 890</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
