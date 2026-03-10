import express from 'express';
import { register, login, logout, deleteCredentials } from '../controllers/accountController.js'
import { verifyEmail, resendVerificationCode, requestPasswordReset, resetPassword } from '../controllers/accountController.js';

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
router.post("/logout", logout);

//rollback credentiali użytkownika na wypadek, gdyby rejestracja się popsuła <3
router.delete('/delete-credentials/:userId', deleteCredentials);

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
router.post("/requestPasswordReset", requestPasswordReset);

//zmiana hasła
//INPUT: pola w body: email, token, password
//OUTPUT: success: true LUB success: false, error
router.post("/resetPassword", resetPassword);

export default router;