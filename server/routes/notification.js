import express from 'express';
import { showNotifications, readNotification, readAllNotifications } from '../controllers/notificationController.js';

const router = express.Router({ mergeParams: true });

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
    OUTPUT: success: false, error
    URL:    GET /api/notifications
*/
router.get('/', showNotifications);


/*
    Oznaczenie wszystkich powiadomień jako odczytane
    OUTPUT: success: true, message
    OUTPUT: success: false, error
    URL:    PATCH /api/notifications/read
*/
router.patch('/read', readAllNotifications);


/*
    Oznaczenie pojedyńczego powiadomienia jako odczytane
    PARAMS: notificationId
    OUTPUT: success: true, message
    OUTPUT: success: false, error
    URL:    PATCH /api/notifications/:notificationId/read
*/
router.patch('/:notificationId/read', readNotification);


export default router;