import express from 'express';
import { upload } from '../config/multerConfig.js';
import { createProfile, getCurrentUser, getUser, updateProfile, updateAvatar } from '../controllers/userController.js';
import {authMiddleware} from '../middleware/authMiddleware.js';

const router = express.Router();

/*
tworzenie profilu
INPUT:
tworzenie profilu
INPUT:
Oczekuje całości w multipart-formdata, czyli:
    * avatar (opcjonalny, max 1), pole ma się nazywać avatar
    * nickname
    * name
    * surname
    * dateOfBirth
OUTPUT: success: true, data LUB success: false, error
OUTPUT: success: true, data LUB success: false, error
*/
router.post('/', upload.single('avatar'), createProfile);

router.use(authMiddleware);

//wyświetlenie profilu aktualnie zalogowanego użytkownika
//OUTPUT: success: true, data LUB success: false, error
//wyświetlenie profilu aktualnie zalogowanego użytkownika
//OUTPUT: success: true, data LUB success: false, error
router.get('/me', getCurrentUser);


//wyświetlenie profilu konkretnego użytkownika
//OUTPUT: success: true, data LUB success: false, error
router.get('/:id', getUser);


//aktualizacja profilu
//INPUT: taki sam jak w tworzeniu, ale bez zdjęcia
//OUTPUT: success: true, data - profil z avatarem (null jak nie ma) LUB success: false, error
router.put('/', updateProfile);


//aktualizacja avatara
//INPUT: albo jedno zdjęcie albo nic, wtedy obecny avatar (jeśli jest), zostanie usunięty
//OUTPUT: success: true, data - avatar (null jak nie ma) LUB success: false, error
router.patch('/update-avatar', upload.single('avatar'), updateAvatar);



export default router;