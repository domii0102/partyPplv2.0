import express from 'express';
import { register, login, logout, checkAccount } from '../controllers/accountController.js'
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

//sprawdzenie, na jakim etapie rejestracji jest użytkownik
//INPUT: pola w body: email
//OUTPUT: success: true, data: {emailConfirmed: boolean, hasProfile: boolean } LUB success: false, error
router.post("/check-account", checkAccount)


/* chyba jest niepotrzebny, więc na razie zakomentowany
router.delete('/delete-credentials/:userId', deleteCredentials);
*/

//weryfikacja maila
//INPUT: pola w body: email, token
//OUTPUT: success: true LUB success: false, error
router.post("/verify-email", verifyEmail);

//ponowne wysłanie kodu na maila
//INPUT: pola w body: email
//OUTPUT: success: true LUB success: false, error
router.post("/resend-verification-code", resendVerificationCode);

//sprawdzanie poprawnosci kodu weryfikacyjnego
//INPUT: pola w body: email, token
//OUTPUT: success: true LUB success: false, error
router.post("/request-password-reset", requestPasswordReset);

//zmiana hasła
//INPUT: pola w body: email, token, password
//OUTPUT: success: true LUB success: false, error
router.post("/reset-password", resetPassword);

export default router;