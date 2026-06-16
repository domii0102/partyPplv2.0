<template>
    <event-invite-create v-if="showPopup" @close="showPopup = false"></event-invite-create>
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
            <component :is="currentComponent"></component>
        </div>
    </div>
</template>

<script setup>
    import { ref, computed, onMounted } from 'vue';
    import { useRoute, useRouter } from 'vue-router';
    import { SERVER_BASE_URL } from '../../config/env';

    import defaultImage from '../../assets/user-form-bg.jpg';
    import EventAbout from '../../components/event/EventAbout.vue';
    import EventGuests from '../../components/event/EventGuests.vue';
    import EventPlaylist from '../../components/event/EventPlaylist.vue';
    import EventPosts from '../../components/event/EventPosts.vue';
    import EventInviteCreate from '../../components/event/EventInviteCreate.vue';
    import EventReportPopup from '../../components/event/EventReportPopup.vue';

    const route = useRoute();
    const router = useRouter();
    const loading = ref(false);
    const error = ref(null);
    const event = ref(null);
    const currentUser =ref(null);
    const showPopup = ref(false);
    const showReportPopup =ref(false);

    const fetchEvent = async () => {
        loading.value = true;
        error.value = null;
        const eventId = route.params.id;

        try {
            const res = await fetch(`${SERVER_BASE_URL}/api/event/${eventId}`, {
                method: 'GET',
                credentials: 'include'
            });

            const serverData = await res.json();
            if (!res.ok) throw new Error(serverData.error || "Failed to fetch selected event.");

            if (serverData.success) event.value = serverData.data;
        } catch (err) {
            console.error(err);
            error.value = "Problem occured while loading selected event, please try again later.";
        } finally {
            loading.value = false;
        }
    };
    const fetchCurrentUser = async () => {
    try {
        const res = await fetch(`${SERVER_BASE_URL}/api/user/me`, {
            method: 'GET',
            credentials: 'include'
        });

        const serverData = await res.json();

        if (!res.ok) {
            throw new Error(serverData.error || "Failed to fetch current user.");
        }

        currentUser.value = serverData.data.user;
    } catch (err) {
        console.error("CURRENT USER ERROR:", err);
    }
};
    
    onMounted(async () => {
    await fetchCurrentUser();
    await fetchEvent();
});

    const eventDate = computed(() => {
        if (!event.value?.eventDateTime) return '';
        const date = new Date(event.value.eventDateTime);
        return date.toLocaleString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    });
    const eventName = computed(() => event.value?.eventName || 'No Data');
    const coverImage = computed(() => event.value?.image?.url || defaultImage);

    const organizer = computed(() => {
        if (!event.value) return 'Loading...';
        const profile = event.value.userCredentials?.userProfile;

        if (profile) return `${profile.name} ${profile.surname} - ${profile.nickname}`;

        return event.value.organizerId || null;
    });

    //funkcja do sprawdzania czy dany uzytkownik jest organizatorem
   const isOrganizer = computed(() => {
    const currentUserId = currentUser.value?.userId;
    const organizerId = event.value?.organizerId;

    if (!currentUserId || !organizerId) return false;

    return String(currentUserId).trim() === String(organizerId).trim();
});

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

    function goToUpdateEvent() {
    router.push(`/event/${route.params.id}/update`);
}


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