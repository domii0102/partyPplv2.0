<template>
    <div class="playlist-container">
        <button class="spotify-connect" @click="$emit('connect-spotify')">
            <img src="https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg" alt="Spotify" class="spotify-icon" />
            <span>Connect with Spotify to edit this playlist</span>
        </button>

        <div class="songs-list">
            <div v-for="track in tracks" :key="track.id" class="song-item">
                <img :src="track.cover || defaultCover" :alt="track.title" class="track-cover" />
                <div class="track-info">
                    <div class="track-title">{{ track.title }}</div>
                    <div class="track-artist">{{ track.artist }}</div>
                </div>
            </div>
            
            <div v-if="tracks.length === 0" class="empty-state">
                No songs in the playlist yet.
            </div>
        </div>
    </div>
</template>

<script setup>
defineProps({
    tracks: {
        type: Array,
        default: () => []
    }
});

const defaultCover = 'https://via.placeholder.com/50';
</script>

<style scoped>
.playlist-container {
    padding: 1.5rem;
    max-width: 600px;
    margin: 0 auto;
}

.spotify-connect {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    background: transparent;
    border: 1px solid #4a3f75;
    border-radius: 30px;
    padding: 0.8rem;
    color: #b3b3b3;
    cursor: pointer;
    margin-bottom: 2rem;
    transition: background 0.2s;
}

.spotify-connect:hover {
    background: rgba(255, 255, 255, 0.05);
}

.spotify-icon {
    width: 24px;
    height: 24px;
}

.song-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.track-cover {
    width: 48px;
    height: 48px;
    border-radius: 4px;
    object-fit: cover;
}

.track-title {
    color: var(--accent-orange, #ff9f43);
    font-size: 1rem;
    font-weight: 500;
}

.track-artist {
    color: #888;
    font-size: 0.8rem;
    text-transform: uppercase;
}

.empty-state {
    text-align: center;
    color: #666;
    margin-top: 2rem;
}
</style>