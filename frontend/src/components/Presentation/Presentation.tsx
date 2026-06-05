import React from 'react';
import './Presentation.css';

const TradingPresentation = () => {
  return (
    <div className="presentation">
      <header className="header">
        <div className="header-content">
          <h1 className="title">Welcome to Trading</h1>
          <p className="subtitle">
            Your all-in-one trading platform with integrated AI and personal assistant chatbot
          </p>
          <a href="/login" className="cta-button">Get Started</a>
        </div>
      </header>

      <section className="why-us">
        <h2 className="section-title">Why Trading?</h2>
        <p className="section-description">
          Experience the future of trading with our AI-powered platform. Maximize your profits, minimize risks, and enjoy a seamless trading journey.
        </p>
        <div className="feature-cards">
          <div className="feature-card">
            <h3>AI Price Predictions</h3>
            <p>Stay ahead of the market with accurate price predictions from our AI algorithms.</p>
          </div>
          <div className="feature-card">
            <h3>Personal Assistant Chatbot</h3>
            <p>Instantly get answers to your queries and stay informed with our chatbot.</p>
          </div>
          <div className="feature-card">
            <h3>Easy and Secure Trading</h3>
            <p>Enjoy seamless trading with integrated market analysis and security features.</p>
          </div>
          <div className="feature-card">
            <h3>Dedicated Support Team</h3>
            <p>Our team of experts is always ready to assist you.</p>
          </div>
        </div>
      </section>

      <section className="meet-team">
        <h2 className="section-title">Meet the Creator</h2>
        <div className="team-cards">
          <div className="team-card">
            <h3>Alexandru Mitroi</h3>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <h2 className="cta-title">Ready to start your trading journey with us?</h2>
        <a href="/login" className="cta-button">Get Started</a>
      </section>

      <footer className="footer">
        <div className="footer-links">
          <a href="#">About Us</a>
          <a href="#">Contact Us</a>
          <a href="#">Privacy Policy</a>
        </div>
        <p>© 2025 Trading. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default TradingPresentation;
