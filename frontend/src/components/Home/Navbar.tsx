import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";
import axios from "../../config/axiosConfig";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [balance, setBalance] = useState<number | null>(null); // Local balance for Navbar
  const [profilePicture, setProfilePicture] = useState<string | null>(null); // Profile picture state

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  // Fetch balance for Navbar
  const fetchBalance = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (token) {
        const response = await axios.get("/balance/get", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setBalance(response.data.balance ?? 0); // Update balance
      }
    } catch (error) {
      console.error("Error fetching balance for Navbar:", error);
      setBalance(0); // Default to 0 in case of an error
    }
  };

  // Fetch profile picture
  const fetchProfilePicture = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (token) {
        const response = await axios.get("/users/profile-picture", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setProfilePicture(response.data.profilePicture); // Set profile picture
      }
    } catch (error) {
      console.error("Error fetching profile picture for Navbar:", error);
      setProfilePicture(null); // Set to null if not found
    }
  };

  useEffect(() => {
    fetchBalance(); // Fetch balance
    fetchProfilePicture(); // Fetch profile picture
  }, []);

  return (
    <header className="navbar">
      <div className="navbar-left">
        <div className="logo">
          {/* Logo */}
        </div>
        <h2>Trading</h2>
      </div>
      <div className="navbar-right">
        <button className="menu-toggle" onClick={toggleMenu}>
          {menuOpen ? "✖" : "☰"}
        </button>
        <nav className={`navbar-links ${menuOpen ? "open" : ""}`}>
          <button className="menu-close" onClick={closeMenu}>
            &times; {/* Simbol X pentru a închide */}
          </button>
          <Link to="/home" onClick={closeMenu}>
            Home
          </Link>
          <Link to="/stocks" onClick={closeMenu}>
            Market
          </Link>
          <Link to="/transactions" onClick={closeMenu}>
            History
          </Link>
          <Link to="/profile" onClick={closeMenu}>
            Account
          </Link>
          <Link to="/depozit" onClick={closeMenu}>
            Depozit
          </Link>
          <div className="balance-display">
            {balance !== null ? `Balance: $${balance.toFixed(2)}` : "Loading..."}
          </div>
        </nav>
        <div className="navbar-buttons">
          <Link to="/profile">
            <div className="profile-pic">
              {profilePicture ? (
                <img
                  src={`http://localhost:5869${profilePicture}`}
                  alt="Profile"
                  className="profile-pic"
                />
              ) : (
                <div className="profile-pic"></div>
              )}
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
