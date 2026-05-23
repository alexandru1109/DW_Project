import React from 'react';
import './Card.css';

interface CardProps {
    title: string;
    value: string;
    change: string;
    color: string;
}

const Card: React.FC<CardProps> = ({ title, value, change, color }) => {
    return (
        <div className="card">
            <h3>{title}</h3>
            <p>{value}</p>
            <p style={{ color }}>{change}</p>
        </div>
    );
};

export default Card;
