import { Request, Response } from 'express';
import { getChatbotResponse } from '../services/llamaService';
import { BalanceRepository } from '../dal/balanceRepository';
import { StockRepository } from '../dal/stockRepository';
import jwt from 'jsonwebtoken';

const balanceRepo = new BalanceRepository();
const stockRepo = new StockRepository();

// Define the Message type
interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
}

export const chatWithBot = async (req: Request, res: Response) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ message: 'Message is required' });
  }

  // Get User ID from JWT if available
  const userId = (req as any).user?.id;
  let contextString = "No user context available.";

  if (userId) {
    try {
      const balance = await balanceRepo.findLatest(userId);
      const stocks = await stockRepo.findAllLatestForUser(userId);
      
      const balanceAmount = balance ? balance.amount : 0;
      const holdings = stocks.map(s => `${s.quantity} shares of ${s.symbol} at avg price ${s.averagePrice.toFixed(2)}`).join(', ');
      
      contextString = `User has an available balance of $${balanceAmount.toFixed(2)}. User portfolio holdings: ${holdings || 'None'}.`;
    } catch (e) {
      console.warn("Could not fetch grounding context for LLM", e);
    }
  }

  try {
    const responseText = await getChatbotResponse(message, contextString);
    return res.status(200).json({ text: responseText });
  } catch (error) {
    console.error('Error communicating with the chatbot service:', error);
    res.status(500).json({ message: 'Failed to fetch chatbot response' });
  }
};

export const getInitialMessages = async (req: Request, res: Response) => {
  try {
    // Define initial messages with proper typing
    const initialMessages: Message[] = [
      { id: 1, text: "Welcome to the chatbot!", sender: "bot" }
      // You can add more predefined messages here
    ];

    return res.status(200).json(initialMessages);
  } catch (error) {
    console.error('Error fetching initial messages:', error);
    res.status(500).json({ message: 'Failed to fetch initial messages' });
  }
};
