import { useSocketStore } from '../stores/socket';
import { useUserStore } from '../stores/user';

export function useForumSocket(posts) {
    const socketStore = useSocketStore();
    const userStore = useUserStore();

    function joinEvent(eventId) {
        socketStore.joinEvent(eventId);

        const socket = socketStore.socket;

        socket.off('new_post');
        socket.off('post_updated');
        socket.off('post_deleted');
        socket.off('post_liked');
        socket.off('new_comment');
        socket.off('comment_updated');
        socket.off('comment_deleted');
        socket.off('new_reply');

        socket.on('new_post', (data) => {
            if (data.authorId === userStore.user?.userId) return;
            if (posts.value.some(p => p.id === data.postId)) return;
            posts.value.unshift({
                id: data.postId,
                authorId: data.authorId,
                text: data.textContent,
                time: new Date(data.createdAt).toLocaleString(),
                author: data.author.nickname,
                avatar: data.author.avatar,
                likes: 0, liked: false, commentsCount: 0, images: [],
                showComments: false, comments: [], newComment: '',
                editing: false, editText: '', loadingComments: false
            });
        });

        socket.on('post_updated', ({ postId, textContent }) => {
            const post = posts.value.find(p => p.id === postId);
            if (post) post.text = textContent;
        });

        socket.on('post_deleted', ({ postId }) => {
            posts.value = posts.value.filter(p => p.id !== postId);
        });

        socket.on('post_liked', ({ postId, likesCount }) => {
            const post = posts.value.find(p => p.id === postId);
            if (post) post.likes = likesCount;
        });

        socket.on('new_comment', ({ postId, commentId, textContent, createdAt, author, authorId }) => {
            if (authorId === userStore.user?.userId) return;
            const post = posts.value.find(p => p.id === postId);
            if (!post || post.comments.some(c => c.id === commentId)) return;
            post.comments.push({
                id: commentId, authorId, text: textContent,
                time: new Date(createdAt).toLocaleString(),
                author: author.nickname, avatar: author.avatar,
                likes: 0, liked: false, replies: [], replyText: '',
                editing: false, editText: ''
            });
            post.commentsCount++;
        });

        socket.on('comment_updated', ({ commentId, textContent }) => {
            for (const post of posts.value) {
                const comment = post.comments.find(c => c.id === commentId);
                if (comment) { comment.text = textContent; return; }
            }
        });

        socket.on('comment_deleted', ({ commentId }) => {
            for (const post of posts.value) {
                const idx = post.comments.findIndex(c => c.id === commentId);
                if (idx !== -1) {
                    post.comments.splice(idx, 1);
                    post.commentsCount--;
                    return;
                }
                for (const comment of post.comments) {
                    const ridx = comment.replies?.findIndex(r => r.id === commentId);
                    if (ridx !== undefined && ridx !== -1) {
                        comment.replies.splice(ridx, 1);
                        return;
                    }
                }
            }
        });

        socket.on('new_reply', ({ postId, parentId, commentId, textContent, createdAt, author, authorId }) => {
            if (authorId === userStore.user?.userId) return;
            const post = posts.value.find(p => p.id === postId);
            if (!post) return;
            const comment = post.comments.find(c => c.id === parentId);
            if (!comment || comment.replies?.some(r => r.id === commentId)) return;
            if (!comment.replies) comment.replies = [];
            comment.replies.push({
                id: commentId, authorId, textContent, createdAt, author,
                editing: false, editText: ''
            });
        });
    }

    function leaveEvent(eventId) {
        socketStore.leaveEvent(eventId);
        const socket = socketStore.socket;
        if (!socket) return;
        socket.off('new_post');
        socket.off('post_updated');
        socket.off('post_deleted');
        socket.off('post_liked');
        socket.off('new_comment');
        socket.off('comment_updated');
        socket.off('comment_deleted');
        socket.off('new_reply');
    }

    return { joinEvent, leaveEvent };
}