import { Request, Response } from 'express';
import { getChatbotResponse } from '../services/llamaService';

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

  try {
    const responseText = await getChatbotResponse(message);
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
