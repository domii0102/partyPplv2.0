import express from 'express';
import { upload } from '../config/multerConfig.js';
import { canCreateInvites,  canManageInvites} from '../middleware/userPermissionsMiddleware.js';


const router = express.Router({ mergeParams: true });

/*
    Wyświetlenie listy zaproszeń DO DANEGO EVENTU
    PARAMS:
        * eventId
    OUTPUT: success: true, message,
            data: [
                {   
                    * invitationId,
                    * expiresAt,
                    * status,
                    * createdAt,
                    * type (link/personal)
                        IF LINK
                    * token
                        IF PERSONAL
                    * receiverId,
                    * name,
                    * surname,
                    * nickname
                }, ...
            ]
    OUTPUT: success: false, error
    URL:    /api/events/:eventId/invites
*/
router.post('/:eventId/invites', canManageInvites, showEventInvites);


/*
    Zaprasznie istniejącego użytkownika
    PARAMS:
        * eventId
    BODY:
        * userIds[id1, id2, ...],
        * expiresAt (date)
    OUTPUT: success: true, message,
            data: [
                {   
                    * id,
                    * eventName,
                    * receiverName,
                    * receiverSurname,
                    * receiverNickname
                }, ...
            ] 
    OUTPUT: success: false, error
    URL:    /api/events/:eventId/invites/users
*/
router.post('/:eventId/invites/users', canCreateInvites, inviteUser);


/*
    Zaprasznie poprzez stworzenie linku
    PARAMS:
        * eventId
    BODY:
        * expiresAt (date)
    OUTPUT: success: true, message,
            data: {
            * invitationId,
            * eventName,
            * token, 
            * link
            }
    OUTPUT: success: false, error
    URL:    /api/events/:eventId/invites/link
*/
router.post('/:eventId/invites/link', canCreateInvites, inviteViaLink);


/*
    Zarządzanie zaproszeniami - zmiana czasu wygaśnięcia zaproszenia
    PARAMS:
        *eventId,
        * invitationId
    BODY:
        * expiresAt (date)
    OUTPUT: success: true, message
    OUTPUT: success: false, error
    URL:    /api/events/:eventId/invites/:invitationId
*/
router.patch('/:eventId/invites/:invitationId', canManageInvites, changeExpirationDate);


/*
    Zarządzanie zaproszeniami - usunięcie zaproszenia
    PARAMS:
        * eventId,
        * invitationId
    OUTPUT: success: true, message
    OUTPUT: success: false, error
    URL:    /api/events/:eventId/invites/:invitationId
*/
router.delete('/:eventId/invites/:invitationId', canManageInvites, deleteInvite);


/*
    Wyświetlenie listy zaproszeń DANEGO UŻYTKOWNIKA
    PARAMS:
        * userId
    OUTPUT: success: true, message,
            data: [
                {   
                    * invitationId,
                    * eventName,
                    * expiresAt,
                    * status,
                    * createdAt
                }, ...
            ]
    OUTPUT: success: false, error
    URL:    /api/events/:eventId/invites/:userId
*/
router.post('/:eventId/invites/user/:userId', showUserInvites);


/*
    Wyświetlenie zaproszenia
    PARAMS:
        * token
    OUTPUT: success: true, message, 
            data: {
                * invitationId,
                * event:
                    * eventId,
                    * eventName,
                    * eventDateTime
                * organizer:
                    * name,
                    * surname,
                    * nick
            }
    OUTPUT: success: false, error
    URL:   /api/public/:token
*/
router.get('/:token', showInvite);


/*
    Zaakceptowanie zaproszenia
    PARAMS:
        * invitationId
    OUTPUT: success: true, message
    OUTPUT: success: false, error
    URL:    /api/invites/:invitationId/accept
*/
router.post('/:invitationId/accept', acceptInvite);


/*
    Odrzucanie zaproszenia
    PARAMS:
        * invitationId
    OUTPUT: success: true, message
    OUTPUT: success: false, error
    URL:    /api/invites/:invitationId/reject
*/
router.post('/invites/:invitationId/reject', rejectInvite);

export default router;