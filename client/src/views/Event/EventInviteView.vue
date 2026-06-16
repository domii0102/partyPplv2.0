<template>
<main>
    <div v-if="invite">
        <div class="invite-main">
            <div class="invite-container">
                <div class="invite-message">
                    <h2>{{"You're invited!"}}</h2> <!-- Defaultowa wiadomosc, ale mozna ustawic wlasna ig -->
                    <div class="gradient-line"></div>
                </div>
                <h1>{{invite.eventName}}</h1>
                <div class="event-author">
                    by: {{ invite.organizerName }} {{ invite.organizerSurname }} ({{ invite.organizerNickname }})
                </div>
                <div class="event-date">
                    <h3>{{ invite.eventDateTime }}</h3>
                </div>
                <div class="event-adress">
                    <h3>at: {{ invite.locationName }}</h3>
                </div>
                <br>
                <h3>Accept?</h3>
                <div>
                    <button class="accept btn" @click="handleAccept">
                        <i class="bi bi-check"></i>
                    </button>
                    <button class="decline btn" @click="handleReject">
                        <i class="bi bi-x"></i>
                    </button>
                </div>
            </div>
            <div class="gradient"></div>
        </div>
        <img :src="invite.eventImage || defaultImage">
    </div>
</main>
</template>

<script setup>

import { onMounted, ref } from 'vue';
import { SERVER_BASE_URL } from '../../config/env';
import { requestService } from '../../services/requestService.js';
import defaultImage from '../../assets/horsegiirl.jpg';
import { useRoute, useRouter } from 'vue-router';


const route = useRoute();
const router = useRouter();

const isTokenRoute = route.name === 'invite-token';
const isIdRoute = route.name === 'invite-id';

const invite = ref(null);
const loading = ref(true);
const error = ref(null);
const service = new requestService();


async function getInvite() {
    loading.value = true;
    error.value = null;

    try {
        let response;

        if (route.name === 'invite-token') {
            response = await service.get(`/api/public/link/${route.params.token}`);
        }

        if (route.name === 'invite-id') {
            response = await service.get(`/api/public/invitation/${route.params.invitationId}`);
        }

        invite.value = response?.data;

    } catch (err) {
        console.error(err);
        error.value = err;
    } finally {
        loading.value = false;
    }
}

async function handleAccept() {
    const invitationId = route.params.invitationId;
    try {
        await service.post(`/api/invites/${invitationId}/accept`, { invitationId: invitationId });
        router.push(`/event/dashboard/${invite.value.eventId}`);
    } catch (err) { console.error(err); }
    
}

async function handleReject() {
    const invitationId = route.params.invitationId;
    try {
        await service.post(`/api/invites/${invitationId}/reject`, { invitationId: invitationId });
        router.push('/event/feed');
    } catch (err) { console.error(err); }
 
}

onMounted(() => getInvite());
</script>

<style scoped>
main {
    position: relative;
    height: 100vh;
    width: 100vw;
    overflow: hidden;
}
img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    z-index: 1;
    margin-left: 25%;
}
.invite-main {
    position: absolute;
    display: grid;
    grid-template-columns: 1fr 1fr;
    top: 0;
    right: 0;
    width: 100%;
    height: 100%;
    z-index: 2;
}
.invite-container {
    grid-column: 1;
    background-color: var(--bg-main);
    align-content: center;
    justify-items: center;
}
.gradient {
    grid-column: 2;
    background: linear-gradient(90deg, var(--bg-main), transparent);
}
h1, h2, h3 {
    font-weight: 300;
}
h1{
    margin-bottom: 0;
}
.invite-message {
    display: flex;
    flex-direction: column;
    width: fit-content;
}
.gradient-line {
    height: 2px;
    width: 100%;
    background: var(--line-gradient);
}
.event-author{
    text-align: center;
    font-size: 1rem;
    opacity: 0.9;
    color: var(--accent-orange);
    font-weight: 600;
    font-style: italic;
    margin-bottom: 0.5rem;
}
.accept, .decline {
    font-size: 3rem;
    transition: color 0.3s;
}
.accept {
    color: var(--accent-orange);
}
.decline {
    color: var(--accent-purple)
}
.accept:hover {
    color: var(--text-main);
}
.decline:hover {
    color: var(--text-main);
}

@media (max-width: 900px) {
    .invite-main{
        grid-template-rows: 1fr 1fr;
        grid-template-columns: 1fr;
    }
    .container {
        grid-row: 2;
        grid-column: 1;
        width: 100%;
    }
    .gradient {
        grid-row: 1;
        grid-column: 1;
        background: linear-gradient(0deg, var(--bg-main), transparent);
    }
    img {
        z-index: 1;
        margin-left: 0;
        margin-top: -25%;
    }
}
</style>