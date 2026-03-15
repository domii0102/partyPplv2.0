import express from 'express';
import { upload } from '../config/multerConfig.js';
import { createProfile } from '../controllers/userController.js';

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

export default router;