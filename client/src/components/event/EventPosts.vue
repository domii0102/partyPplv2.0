<template>
  <div class="posts-section">

    <div class="post-input-wrapper">
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
          <img :src="post.avatar" :alt="post.author" class="avatar" />
          <div class="post-meta">
            <span class="author-name">{{ post.author }}</span>
            <span class="post-time">{{ post.time }}</span>
          </div>
          <button class="flag-btn">
            <i class="bi bi-flag"></i>
          </button>
        </div>

        <div class="post-body">
          <p>{{ post.text }}</p>
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
            @click="post.showComments = !post.showComments"
          >
            <i class="bi bi-chat"></i>
            <span>{{ post.comments.length }}</span>
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

          <div class="comments-list">
            <div
              v-for="comment in post.comments"
              :key="comment.id"
              class="comment-item"
            >
              <img :src="comment.avatar" :alt="comment.author" class="avatar avatar--sm" />
              <div class="comment-content">
                <div class="comment-header">
                  <span class="author-name author-name--sm">{{ comment.author }}</span>
                  <span class="post-time">{{ comment.time }}</span>
                </div>
                <p class="comment-text">{{ comment.text }}</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue';

const newPostText = ref('');
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
  background: var(--card-bg, rgba(255,255,255,0.05));
  border: 1px solid var(--border, rgba(255,255,255,0.1));
  border-radius: 1rem;
  padding: 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
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
  background: rgba(255, 255, 255, 0.05);
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
</style>