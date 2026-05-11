<template>
    <div class="sidebar-overlay" @click.self="$emit('close')">
        <div class="notification-sidebar">
            <h1 class="sidebar-title">Notifications</h1>
            <div class="header-line"></div>

            <div class="notifications-list">
                <div v-if="notifications.length === 0" class="empty-state">
                    No new notifications
                </div>

                <div 
                    v-for="notif in notifications" 
                    :key="notif.id" 
                    class="notif-card"
                >
                    <img :src="notif.senderAvatar || defaultAvatar" class="avatar" />
                    
                    <div class="notif-content">
                        <p>{{ notif.message }}</p>
                        <p v-if="notif.type === 'request'" class="emphasized">Accept?</p>
                    </div>

                    <div v-if="notif.type === 'request'" class="notif-actions">
                        <i 
                            class="bi bi-check2 accept-icon" 
                            @click="$emit('respond', { id: notif.id, action: 'accept' })"
                        ></i>
                        <i 
                            class="bi bi-x decline-icon" 
                            @click="$emit('respond', { id: notif.id, action: 'decline' })"
                        ></i>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    notifications: {
        type: Array,
        default: () => []
    }
});

const emit = defineEmits(['close', 'respond']);

const defaultAvatar = 'https://www.gravatar.com/avatar/0?d=mp&f=y';
</script>

<style scoped>
.sidebar-overlay {
    position: fixed;
    inset: 0;
    z-index: 9999;
}

.notification-sidebar {
    position: absolute;
    right: 2rem; 
    top: calc(var(--header-height) + 10px); 
    width: 100%;
    max-width: 400px; 
    max-height: 80vh;
    background: #110d26;
    padding: 1.5rem;
    color: white;
    overflow-y: auto;
    border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 15px 50px rgba(0, 0, 0, 0.8);
}

.sidebar-title {
    text-align: left;
    font-size: 1.8rem;
    font-weight: 400;
    margin-bottom: 0.5rem;
}

.header-line {
    height: 2px;
    width: 100%;
    background: var(--line-gradient, linear-gradient(90deg, #ff9f43, #a259ff, #ff4d4d));
    margin-bottom: 2rem;
}

.notifications-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.notif-card {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 1.2rem;
    display: flex;
    align-items: center;
    gap: 1.2rem;
}

.avatar {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    object-fit: cover;
}

.notif-content {
    flex: 1;
}

.notif-content p {
    margin: 0;
    font-size: 0.95rem;
    color: #efefef;
}

.notif-content .emphasized {
    margin-top: 4px;
    font-weight: 500;
    color: #fff;
}

.notif-actions {
    display: flex;
    gap: 1.2rem;
    font-size: 1.8rem;
}

.accept-icon {
    color: #7f39fb;
    cursor: pointer;
    transition: transform 0.2s;
}

.decline-icon {
    color: #555;
    cursor: pointer;
    transition: transform 0.2s;
}

.accept-icon:hover, .decline-icon:hover {
    transform: scale(1.2);
}

.empty-state {
    text-align: center;
    color: #666;
    margin-top: 3rem;
    font-style: italic;
}
</style>