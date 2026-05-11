export function mapPost(post) {
    return {
        id: post.postId,
        text: post.textContent,
        time: new Date(post.createdAt).toLocaleString(),
        author: post.author.nickname,
        avatar: post.author.avatar,
        likes: post.likesCount,
        commentsCount: post.commentsCount,
        images: post.images || [],
        liked: false,
        showComments: false,
        comments: [],
        newComment: ''
    };
}