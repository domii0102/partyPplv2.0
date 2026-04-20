import express from 'express';
import { canCreateInvites,  canManageInvites} from '../middleware/userPermissionsMiddleware.js';
import { showEventInvites, inviteUser, inviteViaLink, changeExpirationDate, deleteInvite, showUserInvites, showInvite, acceptInvite, rejectInvite } from '../controllers/invitationController.js';


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
router.get('/', canManageInvites, showEventInvites);


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
router.post('/users', canCreateInvites, inviteUser);


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
router.post('/link', canCreateInvites, inviteViaLink);

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
router.get('/user/:userId', showUserInvites);


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
router.post('/:invitationId/reject', rejectInvite);


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
router.patch('/:invitationId', canManageInvites, changeExpirationDate);


/*
    Zarządzanie zaproszeniami - usunięcie zaproszenia
    PARAMS:
        * eventId,
        * invitationId
    OUTPUT: success: true, message
    OUTPUT: success: false, error
    URL:    /api/events/:eventId/invites/:invitationId
*/
router.delete('/:invitationId', canManageInvites, deleteInvite);


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


export default router;