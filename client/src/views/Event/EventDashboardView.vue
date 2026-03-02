<template>
    <div class="event-dashboard">
        <div class="event-header">
            <img class="event-cover" :src="defaultImage"/>
            <div class="event-header-content">
                <div class="event-date">
                    {{ eventDate }}
                </div>

                <h1 class="event-title">
                    {{ eventName }}
                </h1>

                <div class="event-author">
                    by: <span>{{ organizer }}</span>
                </div>
                <div class="event-tabs">
                    <div class="event-tab">
                        <button @click="select('Posts')">Posts</button>
                        <div class="gradient-line" :class="{ active: activeTab === 'Posts' }"></div>
                    </div>

                    <div class="event-tab">
                        <button @click="select('Guests')">Guests</button>
                        <div class="gradient-line" :class="{ active: activeTab === 'Guests' }"></div>
                    </div>

                    <div class="event-tab">
                        <button @click="select('Playlist')">Playlist</button>
                        <div class="gradient-line" :class="{ active: activeTab === 'Playlist' }"></div>
                    </div>

                    <div class="event-tab">
                        <button @click="select('About')">About</button>
                        <div class="gradient-line" :class="{ active: activeTab === 'About' }"></div>
                    </div>
                </div>
            </div>
        </div>

        <div class="event-tabs-content">
            <component :is="currentComponent"></component>
        </div>
    </div>
</template>

<script setup>
import defaultImage from '../../assets/user-form-bg.jpg';
import { ref, computed } from 'vue'
import EventAbout from '../../components/event/EventAbout.vue';
import EventGuests from '../../components/event/EventGuests.vue';
import EventPlaylist from '../../components/event/EventPlaylist.vue';
import EventPosts from '../../components/event/EventPosts.vue';

const eventName = "67 urodziny Bożenki"
const eventDate = "15th June 2026, 23:00"
const organizer = "mariolabibka13"

const activeTab = ref('Posts')

const componentsMap = {
    Posts: EventPosts,
    Guests: EventGuests,
    Playlist: EventPlaylist,
    About: EventAbout
}

const currentComponent = computed(() => componentsMap[activeTab.value])

function select(tab){
    activeTab.value = tab
}

</script>

<style scoped>
.event-dashboard {
    color: #fff;
    font-family: 'Montserrat', sans-serif;
}
.event-header{
    position: relative;
    overflow: hidden;
    max-height: 500px;
}
.event-cover{
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}
.event-header-content{
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    padding: 1rem;
    background: linear-gradient(to bottom, transparent, var(--bg-main));
}
.event-date{
    text-align: center;
    font-size: 0.9rem;
    opacity: 0.9;
}
.event-title{
    text-align: center;
    font-size: 2.4rem;
    font-weight: 700;
}
.event-author{
    text-align: center;
    font-size: 0.9rem;
    opacity: 0.9;
}
.event-author span {
    color: var(--accent-orange);
    font-weight: 600;
}
.event-tabs{
    display: flex;
    justify-content: center;
    gap: 2rem;
    margin-top: 2rem;
}

.event-tab button{
    background: transparent;
    border: none;
    color: var(--text-muted);
    font-size: 0.95rem;
    cursor: pointer;
    padding-bottom: 0.25rem;
}

.event-tab:hover .gradient-line{
    opacity: 1;
}
.gradient-line{
    height: 2px;
    width: 100%;
    background: var(--line-gradient);
    opacity: 0;
    transition: opacity 0.2s ease;
}
.gradient-line.active{
    opacity: 1;
}
</style>