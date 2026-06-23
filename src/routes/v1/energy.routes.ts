import { Router } from 'express';
import { getChargingWindow, getMix } from '../../controllers/energy.controller';

const router = Router();

router.get('/mix', getMix);
router.get('/optimal-charging-window', getChargingWindow);

export default router;
