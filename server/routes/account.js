import express from 'express';
import {register, login, logout, deleteCredentials} from '../controllers/accountController.js'

const router = express.Router();

//rejestracja nowego użytkownika
//INPUT: pola w body: email, password
//OUTPUT: success: true, user_id, emailConfirmed, token  LUB success: false, error
router.post('/register', register);

//logowanie istniejącego użytkownika
//INPUT: pola w body: email, password
//OUTPUT: success: true, token LUB success: false, error
router.post('/login', login);

//wylogowywanie zalogowanego użytkownika
//OUTPUT: success: true, message LUB success: false, error
router.post("/logout", logout);

//rollback credentiali użytkownika na wypadek, gdyby rejestracja się popsuła <3
router.delete('/delete-credentials/:userId', deleteCredentials);

export default router;