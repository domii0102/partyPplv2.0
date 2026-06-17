<template>
    <div class="sidebar-overlay" @click.self="$emit('close')">
        <div class="notification-sidebar">
            <h1 class="sidebar-title">Notifications</h1>
            <div class="header-line"></div>

            <div class="notifications-list">
                <div v-if="loading" class="empty-state">Loading...</div>
                <div v-if="notifications.length === 0" class="empty-state">
                    No new notifications
                </div>

            <NotificationItem 
                        v-for="notif in notifications" 
                        :key="notif.id" 
                        :notification="notif"
                        @respond="handleAction"
                        @open="handleOpen"
                        @delete="handleDelete"
                    />
            </div>
        </div>
    </div>
</template>

<script setup>
import { SERVER_BASE_URL } from '../../config/env';

import { onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useSocketStore } from '../../stores/socket';
import { useNotificationStore } from '../../stores/notifications.js';
import NotificationItem from './NotificationItem.vue';

const emit = defineEmits(['close']);
const router = useRouter();
const socketStore = useSocketStore();
const notifStore = useNotificationStore();

const { notifications, loading } = storeToRefs(notifStore);

onMounted(async () => {
    if (notifications.value.length === 0) {
        await notifStore.loadNotifications();
    }

    socketStore.onNotificationReceived((notification) => {
        notifStore.addNotification(notification);
    });
});

onUnmounted(() => {
    socketStore.onNotification = null;
});

async function handleOpen(notification) {
    if (!notification.isRead) {
        notifStore.markAsRead(notification.id);
    }

    if (notification.type === 'invite') {
        if (!notification.relatedInvitationId) return;
        router.push({ name: 'invite-id', params: { invitationId: notification.relatedInvitationId } });
        emit('close');
        return;
    }

    if (notification.relatedEvent?.relatedEventId) {
        router.push({
            path: `/event/dashboard/${notification.relatedEvent.relatedEventId}`,
            query: notification.relatedPostId ? { postId: notification.relatedPostId } : {}
        });
        emit('close');
    }
}

async function handleAction(payload) {
    const notification = notifications.value.find(n => n.id === payload.id);
    if (!notification?.relatedInvitationId) return;

    try {
        const endpoint = payload.action === 'accept' ? 'accept' : 'reject';
        await fetch(`${SERVER_BASE_URL}/api/invites/${notification.relatedInvitationId}/${endpoint}`, {
            method: 'POST',
            credentials: 'include'
        });
        notifStore.notifications = notifStore.notifications.filter(n => n.id !== payload.id);
    } catch (err) {
        console.error(err);
    }
}

async function handleDelete(id) {
    await notifStore.removeNotification(id);
}
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
    max-width: 600px; 
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