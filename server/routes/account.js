import express from 'express';
import { register, login, logout, deleteCredentials, checkAccount } from '../controllers/accountController.js'
import { verifyEmail, resendVerificationCode, requestPasswordReset, resetPassword } from '../controllers/accountController.js';
import {authMiddleware} from '../middleware/authMiddleware.js';

const router = express.Router();

//rejestracja nowego użytkownika 
//INPUT: pola w body: email, password
//OUTPUT: success: true, user_id, emailConfirmed, token  LUB success: false, error
//Co do outputu to nie zwraca emailConfirmed bo zawsze bedzie na false, do weryfikcji jest kolejny endpoint
router.post('/register', register);

//logowanie istniejącego użytkownika
//INPUT: pola w body: email, password
//OUTPUT: success: true, token LUB success: false, error
router.post('/login', login);

//wylogowywanie zalogowanego użytkownika
//OUTPUT: success: true, message LUB success: false, error
router.post("/logout", authMiddleware, logout);

//żeby sprawdzić na jakim etapie rejestracji jest użytkownik, który próbuje się zalogować
router.get("/checkAccount/:email", checkAccount)


/* chyba jest niepotrzebny, więc na razie zakomentowany
router.delete('/delete-credentials/:userId', deleteCredentials);
*/

//weryfikacja maila
//INPUT: pola w body: email, token
//OUTPUT: success: true LUB success: false, error
router.post("/verifyEmail", verifyEmail);

//ponowne wysłanie kodu na maila
//INPUT: pola w body: email
//OUTPUT: success: true LUB success: false, error
router.post("/resendVerificationCode", resendVerificationCode);

//sprawdzanie poprawnosci kodu weryfikacyjnego
//INPUT: pola w body: email, token
//OUTPUT: success: true LUB success: false, error
router.post("/requestPasswordReset", authMiddleware, requestPasswordReset);

//zmiana hasła
//INPUT: pola w body: email, token, password
//OUTPUT: success: true LUB success: false, error
router.post("/resetPassword", authMiddleware, resetPassword);

export default router;