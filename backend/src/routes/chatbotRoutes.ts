import express from 'express';
import { chatWithBot, getInitialMessages } from '../controllers/chatbotController';

const router = express.Router();

router.post('/message', chatWithBot);
router.get('/messages', getInitialMessages);

export default router;
