import express from 'express';
import { handleIps } from '../controllers/ip.js';

const router = express.Router();

router.get('/', handleIps);

export default router;
