import express from 'express';
import {upload} from '../config/multerConfig.js';
import { getEvent, getEvents,  createEvent, deleteEvent, updateEvent } from '../controllers/eventController.js';



const router = express.Router();

router.get('/:id', getEvent);

//tu można dać query "visibility", jak dacie w url ?visibility=public to zwróci wydarzenia publiczne (do dashboardu)
//jak nic nie dacie, to zwróci te co są pod profilem chyba (te które się samemu stworzyło i te w których bierzemy udział)
//ale logiki do brania udziału jeszcze nie ma więc to pójdzie do poprawy
router.get("/", getEvents);

/*
Oczekuje całości w multipart-formdata, czyli:
    * image (dokładnie jedno zdjęcie), pole ma się nazywać image
    * eventName 
    * description
    * isPublic (bool)
    * eventDateTime (plis zamieńcie we froncie na format iso bo nie chce mi się z tym je**ć <3)
    * locationLatitude (opcjonalne na razie)
    * locationLongitude (opcjonalne na razie)
    * ageRestriction 
*/
router.post("/", upload.single('image'), createEvent);
//taki sam format co w tworzeniu nowego profilu, tylko nie wszystkie pola muszą być, bo to patch (powinny być tylko te modyfikowane)
router.patch("/:id", upload.single('image'), updateEvent);


router.delete("/:id", deleteEvent);


export default router;
