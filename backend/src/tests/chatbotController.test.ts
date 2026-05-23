import request from 'supertest';
import express from 'express';
import { chatWithBot } from '../controllers/chatbotController';
import { getChatbotResponse } from '../services/llamaService';

// Creează o aplicație Express pentru testare
const app = express();
app.use(express.json());
app.post('/api/chat', chatWithBot);

// Mock-uiește funcția getChatbotResponse
jest.mock('../services/llamaService');

describe('Chatbot Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 200 and bot response when message is provided', async () => {
    // Setează răspunsul mock pentru getChatbotResponse
    const mockResponse = 'Hello, this is a bot response';
    (getChatbotResponse as jest.Mock).mockResolvedValue(mockResponse);

    try {
      // Trimite o cerere POST către endpoint-ul de chat
      const response = await request(app)
        .post('/api/chat')
        .send({ message: 'Hello bot' });

      // Verifică răspunsul
      expect(response.status).toBe(200);
      expect(response.body.response).toBe(mockResponse);
    } catch (error) {
      fail('Unexpected error occurred: ' + (error as Error).message);
    }
  });

  it('should return 400 when message is not provided', async () => {
    try {
      // Trimite o cerere POST fără mesaj
      const response = await request(app)
        .post('/api/chat')
        .send({});

      // Verifică răspunsul
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Message is required');
    } catch (error) {
      fail('Unexpected error occurred: ' + (error as Error).message);
    }
  });

  it('should return 500 when there is an error with the chatbot service', async () => {
    // Setează răspunsul mock pentru getChatbotResponse să arunce o eroare
    (getChatbotResponse as jest.Mock).mockRejectedValue(new Error('Service error'));

    try {
      // Trimite o cerere POST cu un mesaj
      const response = await request(app)
        .post('/api/chat')
        .send({ message: 'Hello bot' });

      // Verifică răspunsul
      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Error chatting with bot');
    } catch (error) {
      fail('Unexpected error occurred: ' + (error as Error).message);
    }
  });
});
