<template>
  <div class="feed-view">
    <div class="feed-container">
      <div class="search-section">
        <div class="search-bar">
          <i class="bi bi-search"></i>
          <input type="text" placeholder="Search for a public event..." v-model="searchQuery" />
        </div>
        <button class="filter-btn">
          <i class="bi bi-sliders"></i>
        </button>
      </div>

      <div class="title-container">
        <h2 class="feed-title">Explore events...</h2>
        <div class="title-underline"></div>
      </div>

      <div class="events-grid">
        <EventCard 
          v-for="event in events" 
          :key="event.id" 
          :event="event" 
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import EventCard from '../../components/event/EventCard.vue';

const searchQuery = ref('');
const events = ref([
  { id: 1, title: 'Hulanki w garażu', date: '02.06.2026', time: '22:00', location: 'Białystok, ul. Garażowa 69', image: 'https://placehold.co/600x400/2a1b33/white' },
  { id: 2, title: 'Wielki test makowców', date: '23.12.2025', time: '16:00', location: 'Grajewo', image: 'https://placehold.co/600x400/2a1b33/white' },
  { id: 3, title: '67 urodziny Bożenki', date: '15.06.2026', time: '23:00', location: 'Bielsk Podlaski, Wrzosowa 7', image: 'https://placehold.co/600x400/2a1b33/white' },
  { id: 4, title: 'Wigilia klasowa', date: '22.12.2032', time: '13:00', location: 'Białystok, al. Tysiąclecia 14', image: 'https://placehold.co/600x400/2a1b33/white' },
  { id: 5, title: '67 urodziny Evil Bożenki', date: '15.06.2026', time: '23:13', location: 'Bielsk Podlaski, Wrzosowa 13', image: 'https://placehold.co/600x400/2a1b33/white' },
  { id: 6, title: 'Rave w mojej stodole', date: '20.04.2026', time: '22:00', location: 'Lipinki Łużyckie, Łączna 46', image: 'https://placehold.co/600x400/2a1b33/white' }
]);
</script>

<style scoped>
.feed-view {
  background: var(--bg-main);
  min-height: 100vh;
  width: 100%;
  text-align: left; 
}

.feed-container {
  max-width: 80rem;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

.search-section {
  display: flex;
  gap: 1rem;
  margin-bottom: 2.5rem;
}

.search-bar {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 0.125rem solid var(--border);
  border-radius: 62.5rem;
  padding: 0.5rem 1.25rem;
  color: var(--text-muted);
}

.search-bar input {
  background: none;
  border: none;
  color: var(--text-main);
  width: 100%;
  outline: none;
  font-size: 0.9375rem;
}

.filter-btn {
  background: none;
  border: 0.125rem solid var(--border);
  color: var(--text-main);
  padding: 0.625rem 1rem;
  border-radius: 0.75rem;
  transition: all 0.3s;
}

.filter-btn:hover {
  border-color: var(--accent-purple);
  color: var(--accent-purple);
}

.title-container {
  margin-bottom: 2rem;
}

.feed-title {
  font-size: 1.75rem;
  color: var(--text-main);
  margin: 0;
  font-weight: 500;
}

.title-underline {
  width: 6rem;
  height: 0.25rem;
  background: var(--line-gradient); 
  margin-top: 0.5rem;
  border-radius: 1rem;
}

.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(18rem, 1fr));
  gap: 1.5rem;
}

@media (max-width: 480px) {
  .search-section {
    flex-direction: row;
  }
}
</style>