import express from 'express';
import { eventExists, isMember, eventNotFinished } from '../middleware/forumAccess.js';
import { isPostOwner, isCommentOwner } from '../middleware/postOwner.js';
import { showComments, createComment, deleteComment, createReply, editComment } from '../controllers/commentController.js';

const router = express.Router({ mergeParams: true });

/*
    Wyświetlenie listy komentarzy danego posta
    MIDDLEWARE:  eventExists, isMember
    PARAMS: eventId, postId
    QUERY: page, limit
    OUTPUT: success: true, message,
            data: [
                {   
                    * commentId,
                    * textContent,
                    * createdAt,
                    * author: {
                        * nickname,
                        * avatar
                    },
                    * replies: [
                        {
                            * commentId,
                            * textContent,
                            * createdAt,
                            * author: {
                                * nickname,
                                * avatar
                            }
                        }, ...
                    ]
                }, ...
            ]
    OUTPUT: success: false, error
    URL:    GET /api/events/:eventId/forum/posts/:postId/comments
*/
router.get('/', eventExists, isMember, showComments);


/*
    Tworzenie nowego komentarza
    MIDDLEWARE:  eventExists, isMember, eventNotFinished
    PARAMS: eventId, postId
    BODY: textContent
    OUTPUT: success: true, message,
            data: {
                * commentId,
                * textContent,
                * createdAt, 
                * author: {
                        * nickname,
                        * avatar
                    }
            }
    OUTPUT: success: false, error
    URL:    POST /api/events/:eventId/forum/posts/:postId/comments
*/
router.post('/', eventExists, isMember, eventNotFinished, createComment);


/*
    Usunięcie komentarzu
    MIDDLEWARE:  eventExists, isMember
    ! Usunąć komentarz może: autor komentarza, autor postu, właściciel wydarzenia, admin
    PARAMS: eventId, postId, commentId
    OUTPUT: success: true, message
    OUTPUT: success: false, error
    URL:    DELETE /api/events/:eventId/forum/posts/:postId/comments/:commentId
*/
router.delete('/:commentId', eventExists, isMember, deleteComment);


/*
    Odpowiadanie na komentarz
    MIDDLEWARE:  eventExists, isMember, eventNotFinished
    PARAMS: eventId, postId, commentId
    BODY: textContent
    OUTPUT: success: true, message,
            data: {
                * commentId,
                * textContent,
                * createdAt,
                * author: {
                        * nickname,
                        * avatar
                    },
                * parentId
            }
    OUTPUT: success: false, error
    URL:    POST /api/events/:eventId/forum/posts/:postId/comments/:commentId/reply
*/
router.post('/:commentId/reply', eventExists, isMember, eventNotFinished, createReply);


/*
    Edytowanie istniejącego komentarza
    MIDDLEWARE:  eventExists, isMember, eventNotFinished, isCommentOwner
    PARAMS: eventId, postId, commentId
    BODY: textContent
    OUTPUT: success: true, message,
            data: {
                * commentId,
                * textContent
            }
    OUTPUT: success: false, error
    URL:    PUT /api/events/:eventId/forum/posts/:postId/comments/:commentId
*/
router.put('/:commentId', eventExists, isMember, eventNotFinished, isCommentOwner, editComment);


export default router;