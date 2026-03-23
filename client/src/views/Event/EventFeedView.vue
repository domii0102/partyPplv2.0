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
          @select="router.push(`/event/dashboard/${$event}`)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, reactive, onMounted, watch } from 'vue';
  import { useRouter } from 'vue-router';
  import { SERVER_BASE_URL } from '../../config/env';
  import EventCard from '../../components/event/EventCard.vue';
  import { useUserStore } from '../../stores/user';

  const router = useRouter();
  const store = useUserStore();
  const loading = ref(false);
  const searchQuery = ref('');

  const events = ref([]);
  const status = reactive({
    error: null,
    empty: false
  });

  const fetchEvents = async () => {
    loading.value = true;
    status.error = null;
    status.empty = false;

    try {
      const fetchURL = new URL(`${SERVER_BASE_URL}/api/event/`);
      fetchURL.searchParams.append('visibility', 'public');

      //Trzeba dodac wyszukiwanie i filtry po stronie backendu!!!
      if (searchQuery.value) fetchURL.searchParams.append('search', searchQuery.value);

      const res = await fetch(fetchURL, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const serverData = await res.json();
      if (!res.ok) throw new Error(serverData.error || "Failed to fetch events.");

      events.value = serverData.data;

      if (events.value.length === 0) status.empty = true;

    } catch (err) {
      console.error(err);
      status.error = "Problem occured while loading events, please try again later.";
    } finally {
      loading.value = false;
    }
  }

  watch(searchQuery, () => {
    fetchEvents();
  });

  onMounted(fetchEvents);

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