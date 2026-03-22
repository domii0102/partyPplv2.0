<template>
  <div class="feed-view">
    <div class="feed-container">
      <div class="search-section">
        <div class="search-bar">
          <i class="bi bi-search"></i>
          <input type="text" placeholder="Search for a public event..." v-model="searchQuery" />
          <button v-if="searchQuery" class="search-clear-btn" @click="searchQuery = ''">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        <button class="filter-btn" @click="showFilters = true">
          <i class="bi bi-sliders"></i>
        </button>
      </div>

      <div class="toolbar-section">
        <div class="results-info">
          Showing {{ filteredEvents.length }} event<span v-if="filteredEvents.length !== 1">s</span>
        </div>

        <div class="sort-box">
          <label for="sort">Sort by</label>
          <select id="sort" v-model="sortBy">
            <option value="default">Default</option>
            <option value="soonest">Soonest</option>
            <option value="latest">Latest</option>
            <option value="title-asc">Title A-Z</option>
            <option value="title-desc">Title Z-A</option>
          </select>
        </div>
      </div>

      <div v-if="hasActiveFilters" class="active-filters">
        <div v-if="searchQuery" class="filter-chip">
          Search: {{ searchQuery }}
          <button @click="searchQuery = ''">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <div v-if="filters.city" class="filter-chip">
          City: {{ filters.city }}
          <button @click="filters.city = ''">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <div v-if="filters.date" class="filter-chip">
          Date: {{ filters.date }}
          <button @click="filters.date = ''">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <div v-if="filters.hashtags" class="filter-chip">
          Hashtags: {{ filters.hashtags }}
          <button @click="filters.hashtags = ''">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <button class="clear-all-btn" @click="resetAllFilters">Clear all</button>
      </div>

      <div class="title-container">
        <h2 class="feed-title">Explore events...</h2>
        <div class="title-underline"></div>
      </div>

      <div v-if="filteredEvents.length" class="events-grid">
        <EventCard 
          v-for="event in filteredEvents" 
          :key="event.id" 
          :event="event" 
        />
      </div>

      <div v-else class="empty-state">
        <div class="empty-icon">
          <i class="bi bi-emoji-frown"></i>
        </div>
        <h3>No events found</h3>
        <p>Try changing the search phrase or filters.</p>
        <button class="empty-reset-btn" @click="resetAllFilters">Reset filters</button>
      </div>
    </div>
  </div>

  <transition name="modal-fade">
    <div v-if="showFilters" class="filter-modal-overlay" @click.self="showFilters = false">
      <div class="filter-modal">
        <div class="filter-modal-header">
          <h3>Filters</h3>
          <button class="modal-close-btn" @click="showFilters = false">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <label>City</label>
        <input v-model="filters.city" placeholder="City" />

        <label>Date</label>
        <input type="date" v-model="filters.date" />

        <label>Hashtags</label>
        <input v-model="filters.hashtags" placeholder="#birthday #party" />

        <div class="filter-actions">
          <button @click="resetModalFilters">Reset</button>
          <button @click="showFilters = false">Cancel</button>
          <button class="apply-btn" @click="applyFilters">Apply</button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed } from 'vue';
import EventCard from '../../components/event/EventCard.vue';

const searchQuery = ref('');
const showFilters = ref(false);
const sortBy = ref('default');

const filters = ref({
  city: '',
  date: '',
  hashtags: ''
});

function applyFilters() {
  showFilters.value = false;
}

function resetModalFilters() {
  filters.value.city = '';
  filters.value.date = '';
  filters.value.hashtags = '';
}

function resetAllFilters() {
  searchQuery.value = '';
  sortBy.value = 'default';
  resetModalFilters();
}

const events = ref([
  { id: 1, title: 'Hulanki w garażu', date: '02.06.2026', time: '22:00', location: 'Białystok, ul. Garażowa 69', hashtags: '#garage #party', image: 'https://placehold.co/600x400/2a1b33/white' },
  { id: 2, title: 'Wielki test makowców', date: '23.12.2025', time: '16:00', location: 'Grajewo', hashtags: '#food #christmas', image: 'https://placehold.co/600x400/2a1b33/white' },
  { id: 3, title: '67 urodziny Bożenki', date: '15.06.2026', time: '23:00', location: 'Bielsk Podlaski, Wrzosowa 7', hashtags: '#birthday #party', image: 'https://placehold.co/600x400/2a1b33/white' },
  { id: 4, title: 'Wigilia klasowa', date: '22.12.2032', time: '13:00', location: 'Białystok, al. Tysiąclecia 14', hashtags: '#school #christmas', image: 'https://placehold.co/600x400/2a1b33/white' },
  { id: 5, title: '67 urodziny Evil Bożenki', date: '15.06.2026', time: '23:13', location: 'Bielsk Podlaski, Wrzosowa 13', hashtags: '#birthday #night', image: 'https://placehold.co/600x400/2a1b33/white' },
  { id: 6, title: 'Rave w mojej stodole', date: '20.04.2026', time: '22:00', location: 'Lipinki Łużyckie, Łączna 46', hashtags: '#rave #music', image: 'https://placehold.co/600x400/2a1b33/white' }
]);

const hasActiveFilters = computed(() => {
  return !!searchQuery.value || !!filters.value.city || !!filters.value.date || !!filters.value.hashtags;
});

const filteredEvents = computed(() => {
  let result = events.value.filter(event => {
    const matchesSearch =
      !searchQuery.value ||
      event.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      event.hashtags.toLowerCase().includes(searchQuery.value.toLowerCase());

    const matchesCity =
      !filters.value.city ||
      event.location.toLowerCase().includes(filters.value.city.toLowerCase());

    const matchesDate =
      !filters.value.date ||
      formatDateForInput(event.date) === filters.value.date;

    const matchesHashtags =
      !filters.value.hashtags ||
      event.hashtags.toLowerCase().includes(filters.value.hashtags.toLowerCase());

    return matchesSearch && matchesCity && matchesDate && matchesHashtags;
  });

  if (sortBy.value === 'soonest') {
    result = [...result].sort((a, b) => parseEventDate(a.date, a.time) - parseEventDate(b.date, b.time));
  } else if (sortBy.value === 'latest') {
    result = [...result].sort((a, b) => parseEventDate(b.date, b.time) - parseEventDate(a.date, a.time));
  } else if (sortBy.value === 'title-asc') {
    result = [...result].sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortBy.value === 'title-desc') {
    result = [...result].sort((a, b) => b.title.localeCompare(a.title));
  }

  return result;
});

function formatDateForInput(dateString) {
  const parts = dateString.split('.');
  if (parts.length !== 3) return '';
  const [day, month, year] = parts;
  return `${year}-${month}-${day}`;
}

function parseEventDate(dateString, timeString) {
  const [day, month, year] = dateString.split('.');
  return new Date(`${year}-${month}-${day}T${timeString}`);
}
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
  margin-bottom: 1.25rem;
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

.search-clear-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  font-size: 0.85rem;
  transition: color 0.3s;
}

.search-clear-btn:hover {
  color: var(--text-main);
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

.toolbar-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.results-info {
  color: var(--text-muted);
  font-size: 0.95rem;
}

.sort-box {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.sort-box label {
  color: var(--text-muted);
  font-size: 0.95rem;
}

.sort-box select {
  background: #140c25;
  border: 0.125rem solid var(--border);
  color: var(--text-main);
  padding: 0.625rem 2.5rem 0.625rem 0.875rem;
  border-radius: 0.75rem;
  outline: none;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  cursor: pointer;
  min-width: 12rem;
}

.sort-box select:focus {
  border-color: var(--accent-purple);
  box-shadow: 0 0 0 0.1875rem rgba(181, 107, 255, 0.15);
}

.sort-box select option {
  background: #140c25;
  color: var(--text-main);
}

.active-filters {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
}

.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(181, 107, 255, 0.12);
  border: 0.0625rem solid rgba(181, 107, 255, 0.35);
  color: var(--text-main);
  padding: 0.5rem 0.85rem;
  border-radius: 62.5rem;
  font-size: 0.9rem;
}

.filter-chip button {
  background: transparent;
  border: none;
  color: var(--text-main);
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 0;
  font-size: 0.75rem;
}

.clear-all-btn {
  background: transparent;
  border: 0.0625rem dashed var(--border);
  color: var(--text-muted);
  padding: 0.5rem 0.85rem;
  border-radius: 62.5rem;
  transition: all 0.3s;
}

.clear-all-btn:hover {
  color: var(--text-main);
  border-color: var(--accent-purple);
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

.empty-state {
  border: 0.125rem dashed var(--border);
  border-radius: 1.25rem;
  padding: 3rem 1.5rem;
  text-align: center;
  background: rgba(255, 255, 255, 0.03);
}

.empty-icon {
  font-size: 2.5rem;
  color: var(--text-muted);
  margin-bottom: 1rem;
}

.empty-state h3 {
  color: var(--text-main);
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: var(--text-muted);
  margin-bottom: 1.25rem;
}

.empty-reset-btn {
  background: none;
  border: 0.125rem solid var(--border);
  color: var(--text-main);
  padding: 0.75rem 1.15rem;
  border-radius: 0.75rem;
  transition: all 0.3s;
}

.empty-reset-btn:hover {
  border-color: var(--accent-purple);
  color: var(--accent-purple);
}

.filter-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
}

.filter-modal {
  background: #140c25;
  padding: 2rem;
  border-radius: 1rem;
  width: 100%;
  max-width: 25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  border: 0.125rem solid var(--border);
  box-shadow: 0 1.25rem 3.75rem rgba(0, 0, 0, 0.35);
}

.filter-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.filter-modal h3 {
  margin: 0;
  color: var(--text-main);
}

.modal-close-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 1rem;
  cursor: pointer;
  transition: color 0.3s;
}

.modal-close-btn:hover {
  color: var(--text-main);
}

.filter-modal label {
  color: var(--text-main);
  font-size: 0.95rem;
}

.filter-modal input {
  background: rgba(255, 255, 255, 0.05);
  border: 0.125rem solid var(--border);
  color: var(--text-main);
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  outline: none;
}

.filter-modal input:focus {
  border-color: var(--accent-purple);
}

.filter-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-top: 0.5rem;
}

.filter-actions button {
  background: none;
  border: 0.125rem solid var(--border);
  color: var(--text-main);
  padding: 0.625rem 1rem;
  border-radius: 0.75rem;
  transition: all 0.3s;
}

.filter-actions button:hover {
  border-color: var(--accent-purple);
  color: var(--accent-purple);
}

.filter-actions .apply-btn {
  background: var(--line-gradient);
  border: none;
  color: white;
}

.filter-actions .apply-btn:hover {
  opacity: 0.9;
  color: white;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.25s ease;
}

.modal-fade-enter-active .filter-modal,
.modal-fade-leave-active .filter-modal {
  transition: transform 0.25s ease, opacity 0.25s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-from .filter-modal,
.modal-fade-leave-to .filter-modal {
  transform: scale(0.96) translateY(0.5rem);
  opacity: 0;
}

@media (max-width: 48rem) {
  .toolbar-section {
    align-items: stretch;
  }

  .sort-box {
    width: 100%;
    justify-content: space-between;
  }

  .sort-box select {
    flex: 1;
  }
}

@media (max-width: 30rem) {
  .search-section {
    flex-direction: row;
  }

  .filter-modal {
    padding: 1.5rem;
  }

  .filter-actions {
    justify-content: stretch;
  }

  .filter-actions button {
    flex: 1;
  }
}
</style>cd