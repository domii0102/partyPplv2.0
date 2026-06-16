import express from 'express';
import { showNotifications, readNotification, readAllNotifications, deleteNotification } from '../controllers/notificationController.js';

const router = express.Router();

/*
    Wyświetlenie listy powiadomień zalogowanego użytkownika
    QUERY: onlyUnread?
    OUTPUT: success: true, message,
            data: [
                {   
                    * notificationId,
                    * type,
                    * isRead,
                    * relatedEvent: {
                        * relatedEventId,
                        * relatedEventName
                        },
                    * relatedPostId,
                    * relatedCommentId,
                    * createdAt,
                    * author: {
                        * triggeredById,
                        * triggeredByName,
                        * triggeredBySurname,
                        * triggeredByNickname,
                        * triggeredByProfilePicture
                        }
                }, ...
            ]
    ERROR: success: false, error
    URL:    GET /api/notifications
*/
router.get('/', showNotifications);


/*
    Oznaczenie wszystkich powiadomień jako odczytane
    OUTPUT: success: true, message
    ERROR: success: false, error
    URL:    PATCH /api/notifications/read
*/
router.patch('/read', readAllNotifications);


/*
    Oznaczenie pojedyńczego powiadomienia jako odczytane
    PARAMS: notificationId
    OUTPUT: success: true, message
    ERROR: success: false, error
    URL:    PATCH /api/notifications/:notificationId/read
*/
router.patch('/:notificationId/read', readNotification);


router.delete('/:notificationId', deleteNotification);

export default router;