import express from 'express';
import { upload } from '../config/multerConfig.js';
import { createProfile, getCurrentUser, getUser, updateProfile } from '../controllers/userController.js';
import {authMiddleware} from '../middleware/authMiddleware.js';

const router = express.Router();

/*
tworzenie profilu
INPUT:
Oczekuje całości w multipart-formdata, czyli:
    * avatar (opcjonalny, max 1), pole ma się nazywać avatar
    * nickname
    * name
    * surname
    * dateOfBirth
OUTPUT: success: true, data LUB success: false, error
*/
router.post('/', upload.single('avatar'), createProfile);

router.use(authMiddleware);

//wyświetlenie profilu aktualnie zalogowanego użytkownika
//OUTPUT: success: true, data LUB success: false, error
router.get('/me', authMiddleware, getCurrentUser);


//wyświetlenie profilu konkretnego użytkownika
//OUTPUT: success: true, data LUB success: false, error
router.get('/:id', getUser);


//aktualizacja profilu
//INPUT: taki sam jak w tworzeniu
//OUTPUT: success: true, data LUB success: false, error
router.put('/', updateProfile);





export default router;