<template>
    <Transition name="blur">
        <div @click.self="$emit('close')" class="blur-overlay">
            <main>
                <div class="popup-head">
                    <h1>Invite your friends</h1>
                    <button class="btn" @click="$emit('close')">
                        <i class="bi bi-x"></i>
                    </button>
                </div>
                <div class="user-search">
                    <input class="user-searchbar" type="text" placeholder="Search for a user" v-model="searchQuery">
                    <button class="btn" @click="searchUsers">
                        <i class="bi bi-search"></i>
                    </button>
                </div>
                <div class="friend-list-container">
                    <EventInviteUserBox
                        v-for="user in searchResult"
                        :key="user.userId"
                        :user="user"
                        @invite="handleInvite"></EventInviteUserBox>
                </div>
                <h2>...or send them an invitation link!</h2>
                <div class="link-container">
                    <div ref="inviteLink" class="invite-link">
                        {{ generatedLink || "Click generate to create a link" }}
                    </div>
                    <button
                        v-if="!generatedLink"
                        class="copy-btn"
                        @click="generateLink"
                        :disabled="isGeneratingLink"
                    >
                        {{ isGeneratingLink ? "Generating..." : "Generate" }}
                    </button>
                    <button class="copy-btn" @click="copyLink">{{ isLinkCopied ? "Copied!" : "Copy" }}</button>
                </div>
            </main>
        </div>
    </Transition>
</template>

<script setup>
    import { ref, watch, onMounted } from 'vue';
    import { useRoute } from 'vue-router';
    import EventInviteUserBox from './EventInviteUserBox.vue';
    import { SERVER_BASE_URL } from '../../config/env';
    import { requestService } from '../../services/requestService.js';

    defineEmits(['close']);
    const route = useRoute();
    const eventId = route.params.id;
    const service = new requestService();

    const searchQuery = ref('');
    const searchResult = ref([]);

    const isGeneratingLink = ref(false);
    const isLinkCopied = ref(false);
    const inviteLink = ref(null);
    const generatedLink = ref('');

    const copyLink = async () => {
        await navigator.clipboard.writeText(inviteLink.value.innerText);
        isLinkCopied.value = true;
        setTimeout(() => isLinkCopied.value = false, 2000);
    }

    async function searchUsers() {
        try {
            const usersFound = await service.get(`/api/events/${eventId}/invites/search?query=${encodeURIComponent(searchQuery.value)}`);
            searchResult.value = usersFound.data;
        } catch (err) {
            console.error(err);
        }
    }

    async function handleInvite(userId) {
        console.log('Inviting:', userId);
        try {
            await service.post(`/api/events/${eventId}/invites/users`, {
                receiverIds: [userId]
            });
            searchResult.value = searchResult.value.filter(u => u.userId !== userId);
        } catch (err) { console.error(err); }
    }

    async function generateLink() {
        isGeneratingLink.value = true;
         try {
            const data = await service.post(`/api/events/${eventId}/invites/link`, {});
            generatedLink.value = data.data.link;
        } catch (err) { console.error(err); }
        finally { isGeneratingLink.value = false;}
    }

    onMounted(searchUsers);

    let debounceTimer;
    watch(searchQuery, () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(searchUsers, 300);
    });
</script>

<style scoped>
.blur-overlay{
    display: flex;
    width: 100%;
    height: 100%;
    position: fixed;
    top: 0;
    z-index: 10;
    backdrop-filter: blur(10px);
    justify-content: center;
    align-items: center;
}
main{
    min-width: 600px;
    max-width: 720px;
    max-height: calc(100vh - var(--header-height) - 2rem);
    align-items: center;
    justify-content: center;
    background-color: var(--bg-main);
    padding: 2rem;
    border-radius: 20px;
    border: solid var(--accent-purple) 1px;
    display: flex;
    flex-direction: column;
}

.blur-enter-active,
.blur-leave-active {
  transition: opacity 0.3s ease, backdrop-filter 0.3s ease;
}

.blur-enter-from,
.blur-leave-to {
  opacity: 0;
  backdrop-filter: blur(0px);
}

.user-search{
    display: flex;
    width: 100%;
    margin: 0 0 1.5rem 0;
}

.user-searchbar{
    border: solid 1px;
    border-color: var(--accent-purple);
    background-color: color-mix(in srgb, var(--accent-purple) 5%, transparent);
}

.user-search > button{
    color: var(--accent-purple);
    font-size: 1.5rem;
    transition: color 0.3s;
}

.popup-head{
    width: 100%;
    display: flex;
    flex-direction: row;
    position: relative;
    justify-content: center;
}
.popup-head > h1 {
    font-weight: 300;
    margin: 1rem 0 2rem 0;
}
main > h2 {
    font-weight: 300;
    font-size: 1.5rem;
    margin: 1rem 0;
}
.popup-head > button{
    position: absolute;
    right: 0;
    top: 0;
    color: var(--accent-purple);
    font-size: 2rem;
    padding: 0;
    transition: color 0.3s;
}
.popup-head > button:hover{
    color: var(--text-main)
}
.friend-list-container{
    width: 100%;
    border-radius: 20px;
    border: solid var(--accent-purple) 1px;
    overflow-y: auto;
    flex: 1;
}
.link-container{
    display: flex;
    flex-direction: row;
    width: 100%;
}
.invite-link{
    width: 100%;
    border-radius: 20px;
    border: solid var(--accent-purple) 1px;
    align-content: center;
    margin-right: 1rem;
    font-size: 1.25rem;
}
.copy-btn{
    color: var(--bg-main);
    background-color: var(--accent-purple);
    border: solid var(--accent-purple) 1px;
    border-radius: 20px;
    transition: 0.3s;
}
.copy-btn:hover{
    background-color: var(--bg-main);
    color: var(--accent-purple);
}
</style>