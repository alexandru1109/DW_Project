import React, { useState, useEffect, useRef } from 'react';
import axios from '../../config/axiosConfig';
import './Chatbot.css';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
}

interface ChatbotProps {
  isVisible: boolean;
  onClose: () => void; // Function to close the chatbot
}

const Chatbot: React.FC<ChatbotProps> = ({ isVisible, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible) {
      axios
        .get<Message[]>('/chatbot/messages')
        .then((response) => setMessages(response.data))
        .catch((error) => console.error('Error fetching messages:', error));
    }
  }, [isVisible]);

  // Close chatbot when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible, onClose]);

  const handleSendMessage = () => {
    if (input.trim() === '') return;

    const userMessage: Message = { id: Date.now(), text: input, sender: 'user' };
    setMessages([...messages, userMessage]);
    setInput('');

    axios
      .post<{ text: string }>('/chatbot/message', { message: input })
      .then((response) => {
        const botMessage: Message = { id: Date.now(), text: response.data.text, sender: 'bot' };
        setMessages((prevMessages) => [...prevMessages, botMessage]);
      })
      .catch((error) => console.error('Error sending message:', error));
  };

  return (
    <div
      className={`chatbot-panel ${isVisible ? 'open' : ''}`}
      ref={dialogRef}
    >
      <div className="chatbot-header">
        <h2>Chat online</h2>
        <button className="close-button" onClick={onClose}>
          ✖
        </button>
      </div>
      <div className="chatbot-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`chatbot-message ${msg.sender}`}>
            {msg.text}
          </div>
        ))}
      </div>
      <div className="chatbot-input-container">
        <input
          type="text"
          className="chatbot-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Scrie mesajul tau aici"
          onKeyPress={(e) => (e.key === 'Enter' ? handleSendMessage() : null)}
        />
        <button className="chatbot-send-button" onClick={handleSendMessage}>
          ➤
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
