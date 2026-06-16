<template>
  <div class="posts-section">

     <ReportPopup
      v-if="reportPopup.show"
      :target-type="reportPopup.type"
      :target-id="reportPopup.id"
      :title="reportPopup.title"
      :description="reportPopup.description"
      @close="closeReportPopup"
      @reported="onReported"
    />
    
    <div v-if="accessDenied" class="access-denied">
      <i class="bi bi-lock"></i>
      <p>Join the event to see the posts and join the conversation!</p>
    </div>

    <div v-else class="post-input-wrapper">
      <input
        v-model="newPostText"
        class="post-input"
        placeholder="Write something about this event...."
        @keyup.enter="submitPost"
      />
      <button class="send-btn" @click="submitPost" :disabled="!newPostText.trim()">
        <i class="bi bi-arrow-up"></i>
      </button>
    </div>

    <div class="posts-list">
      <div
        v-for="post in posts"
        :key="post.id"
        class="post-card"
      >
        <div class="post-header">
          <img :src="post.avatar || defaultImage" :alt="post.author" class="avatar" />
          <div class="post-meta">
            <span class="author-name">{{ post.author }}</span>
            <span class="post-time">{{ post.time }}</span>
          </div>

          <div class="post-controls">

            <template v-if="canModify(post.authorId)">
              <button class="ctrl-btn" @click="startEditPost(post)" title="Edytuj">
                <i class="bi bi-pencil"></i>
              </button>
              <button class="ctrl-btn ctrl-btn--danger" @click="deletePost(post)" title="Usuń">
                <i class="bi bi-trash"></i>
              </button>
            </template>

            <button class="flag-btn" title="Zgłoś" @click="openReportPopup('post',post.id)">
              <i class="bi bi-flag"></i>
            </button>

          </div>

        </div>

        <div class="post-body">

          <template v-if="post.editing">
            <div class="edit-wrapper">
              <textarea
                v-model="post.editText"
                class="edit-input"
                rows="3"
                @keyup.ctrl.enter="saveEditPost(post)"
              ></textarea>
              <div class="edit-actions">
                <button class="edit-cancel" @click="cancelEditPost(post)">Anuluj</button>
                <button class="edit-save" @click="saveEditPost(post)">Zapisz</button>
              </div>
            </div>
          </template>

          <template v-else>
            <p>{{ post.text }}</p>
          </template>

        </div>

        <div class="post-actions">
          <button
            class="action-btn like-action"
            :class="{ liked: post.liked }"
            @click="togglePostLike(post)"
          >
            <i :class="post.liked ? 'bi bi-heart-fill' : 'bi bi-heart'"></i>
            <span>{{ post.likes }}</span>
          </button>
          <button
            class="action-btn comment-action"
            @click="toggleComments(post)"
          >
            <i class="bi bi-chat"></i>
            <span>{{ post.commentsCount }}</span>
          </button>
        </div>

        <div v-if="post.showComments" class="comments-section">
          
          <div class="comment-input-wrapper">
            <input
              v-model="post.newComment"
              class="comment-input"
              placeholder="Leave a comment..."
              @keyup.enter="submitComment(post)"
            />
            <button class="send-btn send-btn--sm" @click="submitComment(post)" :disabled="!post.newComment?.trim()">
              <i class="bi bi-arrow-up"></i>
            </button>
          </div>

          <div v-if="post.loadingComments" class="loading-inline">
            Ładowanie...
          </div>

          <div class="comments-list">
            <div
              v-for="comment in post.comments"
              :key="comment.id"
              class="comment-item"
            >
              <img :src="comment.avatar || defaultImage" :alt="comment.author" class="avatar avatar--sm" />
              <div class="comment-content">
                <div class="comment-header">
                  <span class="author-name author-name--sm">{{ comment.author }}</span>
                  <span class="post-time">{{ comment.time }}</span>
                  <div class="comment-controls" v-if="canModify(comment.authorId)">
                    <button class="ctrl-btn ctrl-btn--xs" @click="startEditComment(comment)" title="Edytuj">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button class="ctrl-btn ctrl-btn--xs ctrl-btn--danger" @click="deleteComment(post, comment)" title="Usuń">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </div>

                <template v-if="comment.editing">
                  <div class="edit-wrapper edit-wrapper--sm">
                    <input
                      v-model="comment.editText"
                      class="comment-input"
                      @keyup.enter="saveEditComment(post, comment)"
                    />
                    <div class="edit-actions">
                      <button class="edit-cancel" @click="cancelEditComment(comment)">Anuluj</button>
                      <button class="edit-save" @click="saveEditComment(post, comment)">Zapisz</button>
                    </div>
                  </div>
                </template>
                <template v-else>
                  <p class="comment-text">{{ comment.text }}</p>
                </template>

                <div  
                  v-if="comment.replies?.length" class="replies-list">
                    <div
                      v-for="reply in comment.replies"
                      :key="reply.id"
                      class="reply-item">
                        <img :src="reply.author.avatar || defaultImage" class="avatar avatar--xs" />
                        
                          <div class="reply-content">
                            <div class="comment-header">
                              <span class="author-name author-name--sm">{{ reply.author.nickname }}</span>
                              <span class="post-time">{{ new Date(reply.createdAt).toLocaleString() }}</span>

                              <div class="comment-controls" v-if="canModify(reply.authorId)">
                                <button class="ctrl-btn ctrl-btn--xs" @click="startEditReply(reply)" title="Edytuj">
                                  <i class="bi bi-pencil"></i>
                                </button>
                                <button class="ctrl-btn ctrl-btn--xs ctrl-btn--danger" @click="deleteReply(post, comment, reply)" title="Usuń">
                                  <i class="bi bi-trash"></i>
                                </button>
                              </div>
                            </div>
                            

                            <template v-if="reply.editing">
                              <div class="edit-wrapper edit-wrapper--sm">
                                <input
                                  v-model="reply.editText"
                                  class="comment-input"
                                  @keyup.enter="saveEditReply(post, comment, reply)"
                                />
                                <div class="edit-actions">
                                  <button class="edit-cancel" @click="cancelEditReply(reply)">Anuluj</button>
                                  <button class="edit-save" @click="saveEditReply(post, comment, reply)">Zapisz</button>
                                </div>
                              </div>
                              
                            </template>
                            <template v-else>
                              <p class="comment-text reply-text">{{ reply.textContent }}</p>
                            </template>
                          </div>
                          
                          <button class="flag-btn" title="Zgłoś" @click="openReportPopup('comment',comment.id)">
                              <i class="bi bi-flag"></i>
                          </button>
                    </div>
                </div>

                <div class="reply-input-wrapper">
                  <input
                    v-model="comment.replyText"
                    placeholder="Reply..."
                    class="comment-input"
                    @keyup.enter="submitReply(post, comment)"
                  />

                  <button class="send-btn send-btn--sm" @click="submitReply(post, comment)" :disabled="!comment.replyText?.trim()">
                    <i class="bi bi-arrow-up"></i>
                  </button>
                </div>
              </div>

                <button class="flag-btn" title="Zgłoś" @click="openReportPopup('comment', comment.id)">
                  <i class="bi bi-flag"></i>
                </button>
            </div>
          </div>

        </div>
      </div>
      <div ref="loadMoreTrigger" class="load-more-trigger"></div>
      <div v-if="loadingMore" class="loading-posts">Ładowanie postów...</div>
      <div v-if="!hasMore && posts.length > 0" class="no-more-posts">Nie ma więcej postów</div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useUserStore } from '../../stores/user';
import postService from '../../services/forum/postService';
import commentService from '../../services/forum/commentService';
import { mapPost } from '../../mappers/postMapper';
import { useForumSocket } from '../../composables/useForumSocket';
import defaultImage from "../../assets/pfp.jpg";

import ReportPopup from "./ReportPopup.vue";

const route = useRoute();
const userStore = useUserStore();

const eventId = route.params.id;
const posts = ref([]);
const newPostText = ref('');
const reportPopup = ref({
  show: false,
  type: null,
  id: null,
  title: "",
  description: "",
});
const currentPage = ref(1);
const limit = 10;
const loadingMore = ref(false);
const hasMore = ref(true);
const loadMoreTrigger = ref(null);


let observer;

let socket = null;

const { joinEvent, leaveEvent } = useForumSocket(posts);

function canModify(resourceAuthorId) {
  const currentUser = userStore.user;
  if (!currentUser) return false;
  if (String(currentUser.userId) === String(resourceAuthorId)) return true;
  if (currentUser.userRole === 'admin') return true;
  return false;
}

const accessDenied = ref(false)

async function loadPosts(reset=false) {
    if (loadingMore.value) return;
    if (!hasMore.value && !reset) return;

    loadingMore.value = true;

    try {
        if (reset) {
            currentPage.value = 1;
            hasMore.value = true;
            posts.value = [];
        }
        const response = await postService.getPosts(eventId, currentPage.value, limit);
        console.log('raw post:', response.data[0]);
        const mappedPosts = response.data.map(p => ({
          ...mapPost(p),
          editing: false,
          editText: '',
          loadingComments: false
        }));
        posts.value.push(...mappedPosts);
        
        if (mappedPosts.length < limit) hasMore.value = false;
        else currentPage.value++; 
    } catch (err) {
      if (err.status === 403) {
        accessDenied.value = true;
      } else {
        console.error(err);
      }
    } finally { loadingMore.value = false; }

}

function openReportPopup(type, id) {
  reportPopup.value = {
    show: true,
    type,
    id,
    title: type === "post" ? "Report post" : "Report comment",
    description:
      type === "post"
        ? "Describe why you want to report this post."
        : "Describe why you want to report this comment.",
  };
}

function closeReportPopup() {
  reportPopup.value.show = false;
}

function onReported(data) {
  console.log("REPORT SENT:", data);
}

async function submitPost() {
    const text = newPostText.value.trim();
    if (!text) return;

    try {
        const response = await postService.createPost(eventId, { textContent: text });

        posts.value.unshift( mapPost(response.data) );

        newPostText.value = '';
    } catch(err) { console.error(err); }
}

function startEditPost(post) {
  post.editText = post.text;
  post.editing = true;
}

function cancelEditPost(post) {
  post.editing = false;
  post.editText = '';
}

async function saveEditPost(post) {
  const text = post.editText.trim();
  if (!text || text === post.text) { cancelEditPost(post); return; }
 
  const previousText = post.text;
  post.text = text;
  post.editing = false;
 
  try {
    await postService.editPost(eventId, post.id, { textContent: text });
  } catch (err) {
    post.text = previousText;
    post.editing = true;
    console.error(err);
  }
}

async function deletePost(post) {
  if (!confirm('Usunąć ten post?')) return;
 
  const snapshot = [...posts.value];
  posts.value = posts.value.filter(p => p.id !== post.id);
 
  try {
    await postService.deletePost(eventId, post.id);
  } catch (err) {
    posts.value = snapshot;
    console.error(err);
  }
}

async function togglePostLike(post) {
    const previousLiked = post.liked;
    const previousLikes = post.likes;

    post.liked = !post.liked;
    post.likes += post.liked ? 1 : -1;

    try {
        const response = await postService.likePost(
            eventId,
            post.id
        );

        post.liked = response.data.liked;
        post.likes = response.data.likesCount;
    } catch(err) {
        post.liked = previousLiked;
        post.likes = previousLikes;
        console.error(err);
    }
}

async function loadComments(post) {
    post.loadingComments = true;
    try {
        const response = await commentService.getComments(
            eventId,
            post.id
        );
        post.comments = response.data.map(comment => ({
            id: comment.commentId,
            authorId: comment.authorId,
            text: comment.textContent,
            time: new Date(comment.createdAt).toLocaleString(),
            author: comment.author.nickname,
            avatar: comment.author.avatar,
            likes: 0,
            liked: false,
            replies: comment.replies?.map(reply => ({
                id: reply.commentId,
                authorId: reply.authorId,
                textContent: reply.textContent,
                createdAt: reply.createdAt,
                author: reply.author,
                editing: false,
                editText: ''
            })) || [],
            replyText: '',
            editing: false,
            editText: ''
        }));

    } catch(err) { console.error(err); }
    finally { post.loadingComments = false; }
}

async function toggleComments(post) {
    post.showComments = !post.showComments;
    if (post.showComments && post.comments.length === 0) { await loadComments(post); }
}

async function submitComment(post) {
  const text = post.newComment?.trim();
  if (!text) return;
 
  post.newComment = '';
 
  try {
    const response = await commentService.createComment(eventId, post.id, { textContent: text });
    const alreadyAdded = post.comments.some(c => c.id === response.data.commentId);
    if (!alreadyAdded) {
      post.comments.push({
        id: response.data.commentId,
        authorId: response.data.authorId || userStore.user?.userId,
        text: response.data.textContent,
        time: new Date(response.data.createdAt).toLocaleString(),
        author: response.data.author.nickname,
        avatar: response.data.author.avatar,
        likes: 0,
        liked: false,
        replies: [],
        replyText: '',
        editing: false,
        editText: ''
      });
      post.commentsCount++;
    }
  } catch (err) {
    post.newComment = text;
    console.error(err);
  }
}

function startEditComment(comment) {
  comment.editText = comment.text;
  comment.editing = true;
}
 
function cancelEditComment(comment) {
  comment.editing = false;
  comment.editText = '';
}
 
async function saveEditComment(post, comment) {
  const text = comment.editText.trim();
  if (!text || text === comment.text) { cancelEditComment(comment); return; }
 
  const prev = comment.text;
  comment.text = text;
  comment.editing = false;
 
  try {
    await commentService.editComment(eventId, post.id, comment.id, { textContent: text });
  } catch (err) {
    comment.text = prev;
    comment.editing = true;
    console.error(err);
  }
}

async function deleteComment(post, comment) {
  if (!confirm('Usunąć ten komentarz?')) return;
 
  const snapshot = [...post.comments];
  post.comments = post.comments.filter(c => c.id !== comment.id);
  post.commentsCount--;
 
  try {
    await commentService.deleteComment(eventId, post.id, comment.id);
  } catch (err) {
    post.comments = snapshot;
    post.commentsCount++;
    console.error(err);
  }
}

async function submitReply(post, comment) {
  const text = comment.replyText?.trim();
  if (!text) return;
 
  comment.replyText = '';
 
  try {
    const response = await commentService.createReply(eventId, post.id, comment.id, { textContent: text });
    if (!comment.replies) comment.replies = [];
    const alreadyAdded = comment.replies.some(r => r.id === response.data.commentId);
    if (!alreadyAdded) {
      comment.replies.push({
        id: response.data.commentId,
        authorId: response.data.authorId || userStore.user?.userId,
        textContent: response.data.textContent,
        createdAt: response.data.createdAt,
        author: response.data.author,
        editing: false,
        editText: ''
      });
    }
  } catch (err) {
    comment.replyText = text;
    console.error(err);
  }
}

function startEditReply(reply) {
  reply.editText = reply.textContent;
  reply.editing = true;
}
 
function cancelEditReply(reply) {
  reply.editing = false;
  reply.editText = '';
}
 
async function saveEditReply(post, comment, reply) {
  const text = reply.editText.trim();
  if (!text || text === reply.textContent) { cancelEditReply(reply); return; }
 
  const prev = reply.textContent;
  reply.textContent = text;
  reply.editing = false;
 
  try {
    await commentService.editComment(eventId, post.id, reply.id, { textContent: text });
  } catch (err) {
    reply.textContent = prev;
    reply.editing = true;
    console.error(err);
  }
}

async function deleteReply(post, comment, reply) {
  if (!confirm('Usunąć tę odpowiedź?')) return;
 
  const snapshot = [...(comment.replies || [])];
  comment.replies = comment.replies.filter(r => r.id !== reply.id);
 
  try {
    await commentService.deleteComment(eventId, post.id, reply.id);
  } catch (err) {
    comment.replies = snapshot;
    console.error(err);
  }
}

function toggleCommentLike(comment) {
  comment.liked = !comment.liked;
  comment.likes += comment.liked ? 1 : -1;
}

onMounted(async () => {
  await loadPosts(true);
    joinEvent(eventId);

  observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !loadingMore.value && hasMore.value) {
      loadPosts();
    }
  });

  if (loadMoreTrigger.value) {
    observer.observe(loadMoreTrigger.value);
  }
});

watch(() => route.params.id, async (newId, oldId) => {
  observer?.disconnect();
    leaveEvent(oldId);
    await loadPosts(true);
    joinEvent(newId);

  observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !loadingMore.value && hasMore.value) {
      loadPosts();
    }
  });

  if (loadMoreTrigger.value) {
    observer.observe(loadMoreTrigger.value);
  }
});
 
onBeforeUnmount(() => {
    leaveEvent(eventId);
});

</script>

<style scoped>
.posts-section {
  padding: 1.5rem 1rem 3rem;
  display: flex;
  flex-direction: column;
  gap: 2rem; 
  font-family: 'Montserrat', sans-serif;
  max-width: 600px;
  margin: 0 auto;
}

.posts-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem; 
}

.post-card {
  background: var(--card-bg);
  border: 1px solid var(--border, rgba(255,255,255,0.1));
  border-radius: 1rem;
  padding: 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  animation: fadeIn 0.25s ease;
}

.post-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.post-meta {
  display: flex;
  flex-direction: column;
  text-align: left; 
}

.post-body {
  padding-left: 0; 
  text-align: left;
}

.post-body p {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.5;
}

.post-actions {
  display: flex;
  gap: 1.2rem;
  border-top: 1px solid rgba(255,255,255,0.05); 
  padding-top: 0.8rem;
}

.comments-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 0.5rem;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.comment-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding-top: 0.8rem;
  border-top: 1px solid rgba(255,255,255,0.08);
}

.comment-content {
  flex: 1;
  text-align: left;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.2rem;
}

.comment-text {
  margin: 0;
  font-size: 0.82rem;
  color: var(--text-muted, #ccc);
}

.post-input-wrapper, .comment-input-wrapper {
  display: flex;
  align-items: center;
  background-color: color-mix(in srgb, var(--accent-purple) 5%, transparent);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 2rem;
  padding: 0.5rem 1rem;
  gap: 0.5rem;
}

.post-input, .comment-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: white;
}

.send-btn {
  background: #7c3aed;
  border: none;
  color: white;
  border-radius: 50%;
  width: 2rem;
  height: 2rem;
  cursor: pointer;
}

.avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
}

.avatar--sm {
  width: 1.8rem;
  height: 1.8rem;
}

.author-name { font-weight: 700; font-size: 0.9rem; }
.post-time { font-size: 0.7rem; opacity: 0.6; }
.post-actions {
  display: flex;
  gap: 1.1rem;
  padding-left: 1rem;
}
 
.action-btn {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 0.8rem;
  cursor: pointer;
  transition: color 0.2s, transform 0.15s;
  padding: 0;
  font-family: 'Montserrat', sans-serif;
  opacity: 0.7;
}
 
.action-btn:hover {
  color: var(--text-main);
  opacity: 1;
  transform: scale(1.08);
}
 
.like-action.liked {
  color: #ff4d6d;
  opacity: 1;
  animation: heartPop 0.35s ease;
}
 
.like-action--sm {
  margin-left: auto;
  flex-shrink: 0;
  opacity: 0.45;
}
 
.like-action--sm.liked {
  opacity: 1;
}
 
@keyframes heartPop {
  0%   { transform: scale(1); }
  40%  { transform: scale(1.4); }
  70%  { transform: scale(1.15); }
  100% { transform: scale(1); }
}
 .send-btn {
  width: 2.1rem;
  height: 2.1rem;
  border-radius: 50%;
  border: none;
  background: var(--accent-purple);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.2s, transform 0.15s;
  font-size: 0.9rem;
  padding: 0;
}
 
.send-btn:hover:not(:disabled) {
  background: var(--accent-orange);
  transform: scale(1.08);
}
 
.send-btn:disabled {
  opacity: 0.3;
  cursor: default;
}
 
.send-btn--sm {
  width: 1.75rem;
  height: 1.75rem;
  font-size: 0.78rem;
}
.flag-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 0.82rem;
  padding: 0;
  transition: color 0.2s, opacity 0.2s;
  margin-left: auto;
  opacity: 0.35;
  flex-shrink: 0;
}
 
.flag-btn:hover {
  color: var(--accent-orange);
  opacity: 1;
}

.load-more-trigger {
  height: 1px;
}

.loading-posts,
.no-more-posts {
  text-align: center;
  font-size: 0.82rem;
  opacity: 0.6;
  padding: 0.75rem 0;
}

.replies-list {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  margin-top: 0.75rem;
  margin-left: 1.75rem;
  padding-left: 0.9rem;
  border-left: 1px solid rgba(255,255,255,0.08);
}

.reply-item {
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 0.85rem;
  padding: 0.7rem 0.8rem;
  backdrop-filter: blur(6px);
}

.reply-content {
  flex: 1;
  text-align: left;
}

.reply-text {
  font-size: 0.78rem;
  line-height: 1.4;
}

.avatar--xs {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
}

.author-name--sm {
  font-size: 0.78rem;
}

.reply-item .post-time {
  font-size: 0.65rem;
  opacity: 0.5;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.post-controls {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-left: auto;
}

.ctrl-btn {
  background: transparent;
  border: none;
  color: var(--text-muted, #aaa);
  cursor: pointer;
  font-size: 0.82rem;
  padding: 0.25rem;
  border-radius: 0.4rem;
  transition: color 0.2s, background 0.2s;
  opacity: 0.6;
}

.ctrl-btn:hover {
  opacity: 1;
  color: var(--text-main, #fff);
  background: rgba(255,255,255,0.08);
}

.ctrl-btn--danger:hover {
  color: #ff4d6d;
  background: rgba(255, 77, 109, 0.1);
}

.ctrl-btn--xs {
  font-size: 0.72rem;
  padding: 0.15rem;
}

.comment-controls {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  margin-left: auto;
}

.access-denied i{
  font-size: 2rem;
  color: var(--accent-orange);
}

</style>