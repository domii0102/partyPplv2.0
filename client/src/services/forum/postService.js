import { service } from '../requestService.js';

class PostService {
    async getPosts(eventId, page = 1, limit = 10) {
        return service.get(
            `/api/events/${eventId}/forum/posts?page=${page}&limit=${limit}`
        );
    }

    async getPost(eventId, postId) {
        return service.get(
            `/api/events/${eventId}/forum/posts/${postId}`
        );
    }

    async createPost(eventId, body) {
        return service.post(
            `/api/events/${eventId}/forum/posts`,
            body
        );
    }

    async editPost(eventId, postId, body) {
        return service.patch(
            `/api/events/${eventId}/forum/posts/${postId}`,
            body
        );
    }

    async deletePost(eventId, postId) {
        return service.delete(
            `/api/events/${eventId}/forum/posts/${postId}`
        );
    }

    async likePost(eventId, postId) {
        return service.post(
            `/api/events/${eventId}/forum/posts/${postId}/like`
        );
    }
}

export default new PostService();