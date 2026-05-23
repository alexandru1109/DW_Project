import React, { useEffect, useState, useContext } from 'react';
import axios from '../../config/axiosConfig';
import { Link } from 'react-router-dom';
import { FaChevronDown } from 'react-icons/fa';
import AuthContext from '../../context/AuthContext'; // Correct the import statement

const ProfileCard: React.FC = () => {
    const [profile, setProfile] = useState<{ name: string; role: string } | null>(null);
    const [balance, setBalance] = useState<number | null>(null);
    const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(true);
    const [isLoadingBalance, setIsLoadingBalance] = useState<boolean>(true);
    const [profileError, setProfileError] = useState<string | null>(null);
    const [balanceError, setBalanceError] = useState<string | null>(null);
    const authContext = useContext(AuthContext);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('authToken');
                if (token) {
                    const response = await axios.get('/users/profile', {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                    setProfile(response.data);
                } else {
                    setProfileError('User not authenticated');
                }
            } catch (error) {
                setProfileError('Error fetching profile');
                console.error('Error fetching profile:', error);
            } finally {
                setIsLoadingProfile(false);
            }
        };

        const fetchBalance = async () => {
            try {
                const token = localStorage.getItem('authToken');
                if (token) {
                    const response = await axios.get('/balance/get', {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                    console.log('Current balance:', response.data);
                    if (response.data && typeof response.data.balance === 'number') {
                        setBalance(response.data.balance);
                    } else {
                        console.error('Invalid balance format:', response.data);
                    }
                }
            } catch (error) {
                console.error('Error fetching balance', error);
            }
        };
    

        if (authContext?.isAuthenticated) {
            fetchProfile();
            fetchBalance();
        } else {
            setIsLoadingProfile(false);
            setIsLoadingBalance(false);
        }
    }, [authContext]);

    return (
        <Link to="/profile" className="profile-card1">
            <div className="profile-info">
                {isLoadingProfile ? (
                    <p>Loading profile...</p>
                ) : profileError ? (
                    <p>{profileError}</p>
                ) : (
                    <>
                        <div className="profile-name">{profile?.name}</div>
                        <div className="profile-title">{profile?.role}</div>
                        <div className="profile-balance">
                            Balance: {isLoadingBalance ? (
                                <span>Loading...</span>
                            ) : balanceError ? (
                                <span>{balanceError}</span>
                            ) : (
                                `$${balance?.toFixed(2)}`
                            )}
                        </div>
                    </>
                )}
                <FaChevronDown className="profile-arrow" />
            </div>
        </Link>
    );
};

export default ProfileCard;
