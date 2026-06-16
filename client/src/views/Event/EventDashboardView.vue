<template>
    <event-invite-create v-show="showPopup" @close="showPopup = false"></event-invite-create>
    <div class="event-dashboard">
        <div class="event-header">
            <img class="event-cover" :src="event?.image?.url || defaultImage"/>
            <div class="event-header-content">
                <div class="event-date">
                    {{ eventDate }}
                </div>

                <h1 class="event-title">
                    {{ eventName }}
                </h1>

                <div class="event-author">
                    by: <span>
                        <router-link :to="`/profile/${organizerId}`">
                            {{ organizer.nickname}}
                        </router-link>
                    </span>
                </div>

                <div v-if="accessDenied" class="join-container">
                    <button class="join-btn">
                        Join Event
                    </button>
                </div>

                <div v-else class="event-attendance">
                    Your attendance:
                    <span class="attendance-radio">
                        <button class="btn" @click="selectAttendance('accept')" :class="{ active: confirmedAttendance === 'accept' }" :disabled="confirmedAttendance === 'accept' ">
                            <i class="bi bi-check"></i>
                        </button>
                        <button class="btn" @click="selectAttendance('unsure')" :class="{ active: confirmedAttendance === 'unsure' }" :disabled="confirmedAttendance === 'unsure'">
                            <i class="bi bi-question"></i>
                        </button>
                        <button class="btn" @click="selectAttendance('decline')" :class="{ active: confirmedAttendance === 'decline' }" :disabled="confirmedAttendance === 'decline'">
                            <i class="bi bi-x"></i>
                        </button>
                    </span>
                    <button class="btn leave-btn">
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
                </div>
            </div>
        </div>

        <div class="event-tabs-content">
            <component :is="currentComponent" v-bind="event"></component>
        </div>
    </div>
</template>

<script setup>
    import { ref, computed, onMounted } from 'vue';
    import { useRoute } from 'vue-router';
    import { SERVER_BASE_URL } from '../../config/env';

    import defaultImage from '../../assets/user-form-bg.jpg';
    import EventAbout from '../../components/event/EventAbout.vue';
    import EventGuests from '../../components/event/EventGuests.vue';
    import EventPlaylist from '../../components/event/EventPlaylist.vue';
    import EventPosts from '../../components/event/EventPosts.vue';
    import EventInviteCreate from '../../components/event/EventInviteCreate.vue';

    import postService from '../../services/forum/postService';

    const route = useRoute();
    const loading = ref(false);
    const error = ref(null);
    const event = ref(null);
    const showPopup = ref(false);
    const organizerId = ref(null);


    const confirmedAttendance = ref("unsure");

    function selectAttendance(sel) {
        confirmedAttendance.value = sel;
    }

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

            if (serverData.success) 
            {
                event.value = serverData.data;
                organizerId.value = event.value.organizerId;
            }

        } catch (err) {
            console.error(err);
            error.value = "Problem occured while loading selected event, please try again later.";
        } finally {
            loading.value = false;
        }
    };

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

        if (profile) return profile;

        return event.value.organizerId || null;
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
        activeTab.value = tab;
    }

    //nie chce mi sie robic sprawdzania czy jestes czlonkiem wydarzenia w madrzejszy sposob wybaczcie czas goni
    const accessDenied = ref(false);
    const fetchAccess = async () => {
        const eventId = route.params.id;

        try{
            const response = await postService.getPosts(
            eventId,
            1,
            1
            );
        } catch (err){
            if (err.status === 403) {
                accessDenied.value = true;
            } else {
                console.error(err);
            }
        }
        console.log(accessDenied);
        console.log("chuj");
    };

    onMounted(async () => {
        await fetchEvent();
        await fetchAccess();
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
</style>