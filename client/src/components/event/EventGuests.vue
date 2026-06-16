<template>
    <div class="guests-container">

        <div v-for="(group, status) in groupedGuests" :key="status" class="guest-group">
            <h3 class="group-title">
                {{ statusLabels[status] }}: <span>{{ group.length }}</span>
            </h3>

            <div class="guest-list">
                <div 
                    v-for="guest in group" 
                    :key="guest.id" 
                    class="guest-card"
                    :class="{ 'highlighted': guest.isHighlighted }"
                >
                    <div class="guest-info">
                        <img :src="guest.avatar || defaultAvatar" class="guest-avatar" />
                        <span class="guest-name">
                            {{ guest.name }}
                            <span v-if="guest.role" class="guest-role">({{ guest.role }})</span>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { ref, computed, onMounted } from 'vue';
    import { service } from '../../services/requestService.js';
    import { useRoute } from 'vue-router';

    const route = useRoute();
    const guests = ref([]);

    const statusLabels = {
        confirmed: 'Confirmed Attendance',
        unsure: 'Unsure',
        declined: "Won't attend"
    };

    const groupedGuests = computed(() => {
        return {
            confirmed: guests.value.filter(g => g.confirmedArrival === true),
            unsure: guests.value.filter(g => g.confirmedArrival === null),
            declined: guests.value.filter(g => g.confirmedArrival === false)
        };
    });

    async function fetchGuests() {
        try {
            const data = await service.get(`/api/event/${route.params.id}/guests`);
            guests.value = (data?.data || []).map(g => ({
                id: g.guestId,
                confirmedArrival: g.confirmedArrival,
                name: g.userCredentials?.userProfile?.nickname || 'Anonim',
                avatar: g.userCredentials?.userProfile?.avatar?.url || null
            }));
        } catch (err) {
            console.error(err);
        }
    }

    onMounted(() => fetchGuests());
</script>

<style scoped>
.guests-container {
    padding: 1.5rem;
    max-width: 600px;
    margin: 0 auto;
}

.invite-section {
    display: flex;
    gap: 0.75rem;
    margin-bottom: 2.5rem;
}

.invite-input-wrapper {
    flex: 1;
    display: flex;
    align-items: center;
    background: #1a162d;
    border: 1px solid #322d4a;
    border-radius: 30px;
    padding: 0.4rem 0.6rem 0.4rem 1.2rem;
}

.invite-input-wrapper input {
    background: transparent;
    border: none;
    color: #fff;
    width: 100%;
    outline: none;
    font-size: 0.95rem;
}

.add-btn {
    background: transparent;
    border: none;
    color: #fff;
    font-size: 1.6rem;
    cursor: pointer;
    line-height: 1;
}

.share-btn {
    background: #1a162d;
    border: 1px solid #322d4a;
    border-radius: 12px;
    color: #fff;
    width: 48px;
    height: 48px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
}

.guest-group {
    margin-bottom: 2rem;
}

.group-title {
    color: var(--accent-orange, #f39c12);
    font-size: 1.2rem;
    margin-bottom: 1rem;
    font-weight: 500;
}

.group-title span {
    color: #888;
    font-size: 1.1rem;
}

.guest-list {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
}

.guest-card {
    background: #141124;
    border: 1px solid #25213d;
    border-radius: 10px;
    padding: 0.7rem 1rem;
}

.guest-card.highlighted {
    border: 2px solid #3498db;
}

.guest-info {
    display: flex;
    align-items: center;
    gap: 0.9rem;
}

.guest-avatar {
    width: 42px;
    height: 42px;
    border-radius: 50%;
    object-fit: cover;
}

.guest-name {
    color: #fff;
    font-weight: 500;
}

.guest-role {
    color: #666;
    font-weight: 400;
    margin-left: 5px;
}
</style>