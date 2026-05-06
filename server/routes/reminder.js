import express from 'express';
import { eventExists } from '../middleware/forumAccess.js';
import { isEventOwner } from '../middleware/postOwner.js';
import { sendReminder } from '../controllers/reminderController.js';

const router = express.Router({ mergeParams: true });

/*
    Wysłanie przypomnienia do wszystkich członków eventu
    MIDDLEWARE:  eventExists, isEventOwner
    PARAMS:      eventId
    OUTPUT:      success: true,
                 data: {
                     sentTo
                 }
    ERROR:       success: false, error
    URL:         POST /api/events/:eventId/reminder
*/
router.post('/', eventExists, isEventOwner, sendReminder);

export default router;