import axios from 'axios';
import { getChatbotResponse } from '../services/llamaService';

jest.mock('axios');

describe('Llama Service Response', () => {
  const LLAMA_API_URL = process.env.LLAMA_API_URL || 'http://localhost:11434';

  it('should connect to the Ollama API and return chatbot response', async () => {
    const mockResponse = {
      status: 200,
      data: {
        text: 'Hello, this is a bot response'
      }
    };
    (axios.post as jest.Mock).mockResolvedValue(mockResponse);

    try {
      const response = await getChatbotResponse('Hello bot');

      expect(response).toEqual(mockResponse.data.text);
      expect(axios.post).toHaveBeenCalledWith(`${LLAMA_API_URL}/api/generate`, {
        model: 'llama3',
        prompt: 'Hello bot',
        options: {
          num_ctx: 4096
        }
      });
    } catch (error) {
      fail('Failed to connect to Ollama API');
    }
  });

  it('should throw an error if the request fails', async () => {
    const mockError = new Error('Service error');
    (axios.post as jest.Mock).mockRejectedValue(mockError);

    await expect(getChatbotResponse('Hello bot')).rejects.toThrow('Failed to fetch chatbot response');
  });
});
