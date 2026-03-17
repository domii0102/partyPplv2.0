import express from 'express';
import { upload } from '../config/multerConfig.js';
import { createProfile, getCurrentUser } from '../controllers/userController.js';
import {authMiddleware} from '../middleware/authMiddleware.js';

const router = express.Router();


/*
Oczekuje całości w multipart-formdata, czyli:
    * avatar (opcjonalny, max 1), pole ma się nazywać avatar
    * nickname
    * name
    * surname
    * dateOfBirth
*/
router.post('/', upload.single('avatar'), createProfile);

router.use(authMiddleware);

router.get('/me', authMiddleware, getCurrentUser);



export default router;