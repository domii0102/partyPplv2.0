export function mapPost(post) {
    return {
        id: post.postId,
        authorId: post.authorId,
        text: post.textContent,
        time: new Date(post.createdAt).toLocaleString(),
        author: post.author.nickname,
        avatar: post.author.avatar,
        likes: post.likesCount,
        commentsCount: post.commentsCount,
        images: post.images || [],
        liked: post.isLiked ?? false,
        showComments: false,
        comments: [],
        newComment: ''
    };
}