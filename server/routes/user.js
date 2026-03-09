import express from 'express';
import { upload } from '../multerConfig.js';
import { createProfile } from '../controllers/userController.js';

const router = express.Router();

router.post('/', upload.single('avatar'), createProfile);

export default router;