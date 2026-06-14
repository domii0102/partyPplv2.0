import { service } from '../requestService';

class CommentService {
    async getComments(eventId, postId) {
        return service.get(
            `/api/events/${eventId}/forum/posts/${postId}/comments`
        );
    }

    async createComment(eventId, postId, body) {
        return service.post(
            `/api/events/${eventId}/forum/posts/${postId}/comments`,
            body
        );
    }

    async createReply(eventId, postId, commentId, body) {
        return service.post(
            `/api/events/${eventId}/forum/posts/${postId}/comments/${commentId}/reply`,
            body
        );
    }

    async editComment(eventId, postId, commentId, body) {
        return service.patch(
            `/api/events/${eventId}/forum/posts/${postId}/comments/${commentId}`,
            body
        );
    }

    async deleteComment(eventId, postId, commentId) {
        return service.delete(
            `/api/events/${eventId}/forum/posts/${postId}/comments/${commentId}`
        );
    }
}

export default new CommentService();