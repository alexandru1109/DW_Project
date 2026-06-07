import { Router } from 'express';
import { runSparkBatch } from '../controllers/sparkController';

const router = Router();

// Route to trigger the Spark batch job
// e.g., POST /api/spark/batch
router.post('/batch', runSparkBatch);

export default router;
