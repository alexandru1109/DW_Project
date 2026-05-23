import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const LLAMA_API_URL = process.env.LLAMA_API_URL || '';

interface Message {
  role: string;
  content: string;
}

interface ChatbotResponse {
  model: string;
  created_at: string;
  message: Message;
  done: boolean;
}

export const getChatbotResponse = async (message: string): Promise<string> => {
  if (!LLAMA_API_URL) {
    console.error('LLAMA_API_URL is not set');
    throw new Error('LLAMA_API_URL is not set');
  }

  console.log('Sending request to chatbot service:', LLAMA_API_URL);

  try {
    const response = await axios.post(`${LLAMA_API_URL}/api/chat`, {
      model: 'llama3',
      messages: [
        {
          role: 'user',
          content: message
        }
      ]
    }, {
      responseType: 'stream'
    });

    let responseText = '';

    // Handle data stream
    response.data.on('data', (chunk: Buffer) => {
      const lines = chunk.toString('utf8').split('\n').filter(line => line.trim() !== '');
      for (const line of lines) {
        try {
          const parsedLine = JSON.parse(line);
          if (parsedLine.message && parsedLine.message.role === 'assistant') {
            responseText += `${parsedLine.message.content} `;
          }
        } catch (error) {
          console.error('Failed to parse line as JSON:', line);
        }
      }
    });

    // Handle end and error events
    await new Promise<void>((resolve, reject) => {
      response.data.on('end', () => resolve());
      response.data.on('error', (err: Error) => reject(err));
    });

    return responseText.trim();
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Axios error:', error.message, error.response?.data);
    } else {
      console.error('Unexpected error:', error);
    }
    throw new Error('Failed to fetch chatbot response');
  }
};
