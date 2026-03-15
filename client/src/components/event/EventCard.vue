<template>
  <div class="event-card">
    <div class="image-wrapper">
      <img :src="event.image" :alt="event.title" class="event-img" />
    </div>
    
    <div class="event-details">
      <h3 class="event-title">{{ event.title }}</h3>
      <p class="event-info">{{ event.date }}, {{ event.time }}</p>
      <p class="event-info location">{{ event.location }}</p>
    </div>

    <button 
      class="like-btn" 
      :class="{ 'is-liked': isLiked, 'animate': clicked }" 
      @click.stop="toggleLike"
    >
      <i :class="isLiked ? 'bi bi-heart-fill' : 'bi bi-heart'"></i>
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue';
defineProps({
  event: Object
});

const isLiked = ref(false);
const clicked = ref(false);

const toggleLike = () => {
  isLiked.value = !isLiked.value;
  clicked.value = true;
  setTimeout(() => {
    clicked.value = false;
  }, 400);
};
</script>

<style scoped>
.event-card {
  position: relative; 
  background: var(--card-bg);
  border: 0.0625rem solid var(--border);
  border-radius: 1rem;
  overflow: hidden;
  transition: transform 0.3s ease, border-color 0.3s;
  cursor: pointer;
  text-align: left;
  display: flex;
  flex-direction: column;
}

.event-card:hover {
  transform: translateY(-0.3125rem);
  border-color: var(--accent-purple);
}

.image-wrapper {
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
}

.event-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.event-details {
  padding: 1rem 1.25rem;
  padding-right: 3.5rem; 
}

.like-btn {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(0.5rem);
  border: 0.0625rem solid var(--border);
  border-radius: 50%;
  width: 2.8rem;
  height: 2.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: all 0.3s ease;
  padding: 0;
  z-index: 5;
  box-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.3);
}

.like-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: var(--accent-purple);
}

.like-btn.is-liked {
  color: #ff4d4d;
  background: rgba(255, 77, 77, 0.1);
  border-color: rgba(255, 77, 77, 0.3);
}

.animate {
  animation: heartPop 0.4s linear;
}

@keyframes heartPop {
  0% { transform: scale(1); }
  30% { transform: scale(1.3); }
  60% { transform: scale(1.15); }
  100% { transform: scale(1); }
}

.event-title {
  font-size: 1.125rem;
  margin: 0 0 0.5rem 0;
  color: var(--text-main);
  font-weight: 600;
}

.event-info {
  font-size: 0.8125rem;
  color: var(--text-muted);
  margin: 0.125rem 0;
}
</style>