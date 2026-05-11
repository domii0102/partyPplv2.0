import express from 'express';
import { eventExists, isMember, eventNotFinished } from '../middleware/forumAccess.js';
import { isPostOwner } from '../middleware/postOwner.js';
import { showEventPosts, showPost, createPost, editPost, deletePost, likePost } from '../controllers/postController.js';

const router = express.Router({ mergeParams: true });

/*
    Wyświetlenie listy postów danego eventu
    MIDDLEWARE:  eventExists, isMember
    PARAMS: eventId
    QUERY: page?, limit?
    OUTPUT: success: true, message,
            data: [
                {   
                    * postId,
                    * textContent,
                    * createdAt,
                    * author: {
                        * nickname,
                        * avatar
                    },
                    * images: [],
                    * likesCount,
                    * commentsCount 
                }, ...
            ]
    ERROR: success: false, error
    URL:    GET /api/events/:eventId/forum/posts
*/
router.get('/', eventExists, isMember, showEventPosts);


/*
    Wyświetlenie pojedynczego postu
    MIDDLEWARE:  eventExists, isMember
    PARAMS: eventId, postId
    OUTPUT: success: true, message,
            data: {   
                    * postId,
                    * textContent,
                    * createdAt,
                    * author: {
                        * nickname,
                        * avatar
                    },
                    * images: [],
                    * likesCount,
                    * commentsCount
                }
    ERROR: success: false, error
    URL:    GET /api/events/:eventId/forum/posts/:postId
*/
router.get('/:postId', eventExists, isMember, showPost);


/*
    Tworzenie nowego postu
    MIDDLEWARE:  eventExists, isMember, eventNotFinished
    PARAMS: eventId
    BODY:
        * textContent,
        * images?: [
            {
                * url,
                * publicId
            }, ...
        ]
    OUTPUT: success: true, message,
            data: {
                * postId,
                * textContent,
                * createdAt, 
                * author: {
                        * nickname,
                        * avatar
                    },
                * images: []
            }
    ERROR: success: false, error
    URL:    POST /api/events/:eventId/forum/posts
*/
router.post('/', eventExists, isMember, eventNotFinished, createPost);


/*
    Edytowanie istniejącego postu
    MIDDLEWARE:  eventExists, isMember, eventNotFinished, isPostOwner
    PARAMS: eventId, postId
    BODY:
        * textContent?,
        * images?: [
            {
                * url,
                * publicId
            }, ...
        ]
    OUTPUT: success: true, message,
            data: {
                * postId,
                * textContent,
                * images: []
            }
    ERROR: success: false, error
    URL:    PATCH /api/events/:eventId/forum/posts/:postId
*/
router.patch('/:postId', eventExists, isMember, eventNotFinished, isPostOwner, editPost);


/*
    Usunięcie postu
    MIDDLEWARE:  eventExists, isMember
    ! Usunąć post może: autor, właściciel wydarzenia, admin
    PARAMS: eventId, postId
    OUTPUT: success: true, message
    ERROR: success: false, error
    URL:    DELETE /api/events/:eventId/forum/posts/:postId
*/
router.delete('/:postId', eventExists, isMember, deletePost);


/*
    Reagowanie na post
    MIDDLEWARE:  eventExists, isMember, eventNotFinished
    PARAMS: eventId, postId
    OUTPUT: success: true, message,
            data: {
                * liked: true/false,
                * likesCount
            }
    ERROR: success: false, error
    URL:    POST /api/events/:eventId/forum/posts/:postId/like
*/
router.post('/:postId/like', eventExists, isMember, eventNotFinished, likePost);


export default router;