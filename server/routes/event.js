import express from 'express';
import { upload } from '../config/multerConfig.js';
import { getEvent, getEvents,  createEvent, deleteEvent, updateEvent, updateImage } from '../controllers/eventController.js';
import invitationRouter from './invites.js';




const router = express.Router();

//wyświetlenie konkretnego eventu
//OUTPUT: success: true,  data - w tym obiekt z eventem i wewnątrz niego image (obiekt ze zdjęciem) LUB success: false, error
router.get('/:id', getEvent);

//wyświetlenie eventów
//OUTPUT: success: true, data - w tym eventy ze zdjęciam w środku (tak jak wyżej) LUB success: false, error
//tu można dać query "visibility", jak dacie w url ?visibility=public to zwróci wydarzenia publiczne (do dashboardu)
//jak nic nie dacie, to zwróci te co są pod profilem chyba (te które się samemu stworzyło i te w których bierzemy udział)
//ale logiki do brania udziału jeszcze nie ma więc to pójdzie do poprawy
router.get("/", getEvents);

/*
tworzenie eventu
INPUT:
Oczekuje całości w multipart-formdata, czyli:
    * image (dokładnie jedno zdjęcie), pole ma się nazywać image
    * eventName 
    * description
    * isPublic (bool)
    * eventDateTime (plis zamieńcie we froncie na format iso bo nie chce mi się z tym je**ć <3)
    * locationLatitude (opcjonalne na razie)
    * locationLongitude (opcjonalne na razie)
    * ageRestriction 

OUTPUT: success: true, data: {event, image} LUB success: false, error
*/
router.post("/", upload.single('image'), createEvent);

//modyfikowanie eventu
//INPUT: taki sam format co w tworzeniu nowego eventu, ale bez zdjęcia
//OUTPUT: success: true, data - obiekt eventu z dołączonym zdjęciem LUB success: false, error
router.put("/:id", updateEvent);

//modyfikowanie eventu
//id to id eventu
//INPUT: tylko jedno zdjęcie, jak nie będzie nic to błąd, bo event musi mieć min jedno zdjęcie
//OUTPUT: success: true, data - obiekt zdjęcia LUB success: false, error
router.patch("/update-image/:id", upload.single('image'), updateImage)

//soft-delete eventu
//OUTPUT: success: true, data - obiekt z usuniętym eventem LUB success: false, error
router.delete("/:id", deleteEvent);

//zaproszenia
router.use('/:eventId/invites', invitationRouter);

export default router;
