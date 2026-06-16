<template>
    <event-invite-create v-show="showPopup" @close="showPopup = false"></event-invite-create>

    <event-report-popup
      v-if="showReportPopup"
      :event-id="route.params.id"
      @close="showReportPopup = false"
    ></event-report-popup>  

    <div class="event-dashboard">
        <div class="event-header">
            <img class="event-cover" :src="event?.image?.url || defaultImage"/>
            <div class="event-header-content">
                <div class="event-date">
                    {{ eventDate }}
                </div>

               <div class="event-title-row">
                    <h1 class="event-title">
                        {{ eventName }}
                    </h1>

                    <button
                        v-if="isOrganizer"
                        class="edit-title-button"
                        type="button"
                        @click="goToUpdateEvent"
                        title="Edit event"
                    >
                        <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    >
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                    </svg>
                    </button>
                </div>

                

                <div class="event-author">
                    by: <span>
                        <router-link :to="`/profile/${organizerId}`">
                            {{ organizer.nickname}}
                        </router-link>
                    </span>
                </div>

                <div v-if="!isMember" class="join-container">
                    <button class="join-btn" @click="handleJoin">Join Event</button>
                </div>

                <div v-else class="event-attendance">
                    Your attendance:
                    <span class="attendance-radio">
                        <button class="btn" @click="selectAttendance(true)" :class="{ active: confirmedArrival === true }">
                            <i class="bi bi-check"></i>
                        </button>
                        <button class="btn" @click="selectAttendance(null)" :class="{ active: confirmedArrival === null }">
                            <i class="bi bi-question"></i>
                        </button>
                        <button class="btn" @click="selectAttendance(false)" :class="{ active: confirmedArrival === false }">
                            <i class="bi bi-x"></i>
                        </button>
                    </span>
                    <button class="btn leave-btn" @click="handleLeave">
                        <i class="bi bi-box-arrow-right"></i>
                    </button>
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
                        <button @click="select('About')">About</button>
                        <div class="gradient-line" :class="{ active: activeTab === 'About' }"></div>
                    </div>
                    <div class="event-tab">
                        <button @click="showPopup = true"><i class="bi bi-share-fill"></i> Invite</button>
                        <div class="gradient-line"></div>
                    </div>
                    <div class="event-tab">
                    <button @click="showReportPopup = true">
                        <i class="bi bi-flag-fill"></i> Report
                    </button>
                    <div class="gradient-line"></div>
                    </div>
                </div>
            </div>
        </div>

        <div class="event-tabs-content">
            <component :is="currentComponent" v-bind="event"></component>
        </div>
    </div>
</template>

<script setup>
    import { ref, computed, onMounted, watch } from 'vue';
    import { useRoute, useRouter } from 'vue-router';
    import { SERVER_BASE_URL } from '../../config/env';
    import { requestService } from '../../services/requestService.js';

    import defaultImage from '../../assets/user-form-bg.jpg';
    import EventAbout from '../../components/event/EventAbout.vue';
    import EventGuests from '../../components/event/EventGuests.vue';
    import EventPlaylist from '../../components/event/EventPlaylist.vue';
    import EventPosts from '../../components/event/EventPosts.vue';
    import EventInviteCreate from '../../components/event/EventInviteCreate.vue';
    import EventReportPopup from '../../components/event/EventReportPopup.vue';
    import postService from '../../services/forum/postService';

    const route = useRoute();
    const router = useRouter();

    const loading = ref(false);
    const service = new requestService();
    const error = ref(null);
    const event = ref(null);
    const currentUser =ref(null);
    const showPopup = ref(false);
    const showReportPopup = ref(false);
    const organizerId = ref(null);
    const activeTab = ref('Posts');
    const confirmedArrival = ref(null);
    const eventId = route.params.id;

    const componentsMap = {
        Posts: EventPosts,
        Guests: EventGuests,
        Playlist: EventPlaylist,
        About: EventAbout
    };

    const currentComponent = computed(() => componentsMap[activeTab.value]);

    const eventDate = computed(() => {
        if (!event.value?.eventDateTime) return '';
        const date = new Date(event.value.eventDateTime);
        return date.toLocaleString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    });

    const eventName = computed(() => event.value?.eventName || 'No Data');

    const organizer = computed(() => {
        if (!event.value) return 'Loading...';
        const profile = event.value.userCredentials?.userProfile;

        if (profile) return profile;

        return event.value.organizerId || null;
    });

    //funkcja do sprawdzania czy dany uzytkownik jest organizatorem
    const isOrganizer = computed(() => {
        const currentUserId = currentUser.value?.userId;
        const organizerId = event.value?.organizerId;

        if (!currentUserId || !organizerId) return false;

        return String(currentUserId).trim() === String(organizerId).trim();
    });

    const isMember = computed(() => event.value?.isGuest || isOrganizer.value);

    function select(tab){ activeTab.value = tab; }
    
    function goToUpdateEvent() { router.push(`/event/${route.params.id}/update`); }

    watch(() => event.value, (val) => {
        if (val) confirmedArrival.value = val.confirmedArrival ?? null;
    }, { immediate: true });

    async function fetchCurrentUser() {
        try {
            const data = await service.get('/api/user/me');
            currentUser.value = data?.data?.user;
        } catch (err) {
            console.error("CURRENT USER ERROR:", err);
        }
    };

    async function fetchEvent() {
        loading.value = true;
        error.value = null;
        try {
            const data = await service.get(`/api/event/${route.params.id}`);
            event.value = data?.data;
            organizerId.value = event.value?.organizerId;
        } catch (err) {
            console.error(err);
            error.value = "Problem occured while loading selected event, please try again later.";
        } finally {
            loading.value = false;
        }
    };

    async function handleJoin() {
        try {
            await service.post(`/api/event/${route.params.id}/join`);
            await fetchEvent();
        } catch (err) { console.error(err); }
    }

    async function handleLeave() {
        try {
            await service.post(`/api/event/${route.params.id}/leave`);
            await fetchEvent();
        } catch (err) { console.error(err); }
    }

    async function selectAttendance(value) {
        confirmedArrival.value = value;
        try {
            await service.patch(`/api/event/${route.params.id}/arrival`, { confirmedArrival: value });
        } catch (err) {
            console.error(err);
            await fetchEvent();
        }
    }
    
    onMounted(async () => {
        await fetchCurrentUser();
        await fetchEvent();
    });
</script>

<style scoped>
.event-dashboard {
    color: #fff;
    font-family: 'Montserrat', sans-serif;
    position: relative;
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
    position: relative;
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
.event-author span a{
    color: var(--accent-orange);
    font-weight: 600;
    text-decoration: none;
    font-size: medium;
    font-style: italic;
}

.event-author span a:hover{
    text-decoration: underline;
}
.event-tabs{
    display: flex;
    justify-content: center;
    gap: 2rem;
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

.event-attendance{
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    margin: 1rem 0;
}

.attendance-radio{
    background-color: color-mix(in srgb, var(--bg-main) 50%, transparent);
    border: solid 1px;
    border-color: var(--border);
    border-radius: 99px;
    padding: 0.1rem;
    margin-left: 1rem;
}

.attendance-radio button{
    color: var(--text-muted);
    border-radius: 99px;
}

.attendance-radio button.active{
    color: var(--bg-main);
    background-color: var(--accent-orange);
}

.attendance-radio button:hover{
    color: var(--accent-orange);
    backdrop-filter: blur(10px);
    filter: drop-shadow(0px 0px 15px var(--accent-orange));
    border: solid color-mix(in srgb, var(--accent-orange) 50%, transparent) 1px;
}

.join-container{
    padding: 0.5rem;
}

.join-btn {
    background-color: color-mix(in srgb, var(--accent-orange) 40%, transparent);
    border-radius: 999px;
    border: 1px solid color-mix(in srgb, var(--accent-orange) 67%, white);
    
    box-shadow: 0 0 0 transparent;
    transform: translateY(0) scale(1);

    transition: 
        transform 0.2s ease,
        box-shadow 0.3s ease,
        background-color 0.3s ease,
        border-color 0.3s ease;
}

.join-btn:hover {
    transform: translateY(-2px) scale(1.03);
    box-shadow: 0 0 18px color-mix(in srgb, var(--accent-orange) 60%, transparent);
}

.join-btn:active {
    transform: translateY(0px) scale(0.98);
    box-shadow: 0 0 8px color-mix(in srgb, var(--accent-orange) 40%, transparent);
}

.leave-btn{
    color: var(--text-muted);
}

.event-title-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
}

.edit-title-button {
    background: transparent;
    border: none;
    color: var(--accent-orange);
    font-size: 1.4rem;
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;
}

.edit-title-button:hover {
    opacity: 0.8;
}
</style>