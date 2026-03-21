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
//INPUT: taki sam jak w tworzeniu, ale trzeba też dać pole deleteAvatar: boolean
//to jest do informacji czy użytkownik chce usunąć swój avatar przy updacie czy nie
//OUTPUT: success: true, data LUB success: false, error
router.put('/', upload.single('avatar'), updateProfile);





export default router;