<template>
    <div class="notif-card" @click="emit('open', notification)">
        <img :src="notification.author?.triggeredByProfilePicture || defaultAvatar" class="avatar" alt="Avatar" />
        
        <div class="notif-content">
            <p>{{ generatedMessage }}</p>
            <p v-if="notification.type === 'invite'" class="emphasized">Accept?</p>
        </div>

        <div v-if="notification.type === 'invite'" class="notif-actions">
            <i 
                class="bi bi-check2 accept-icon" 
                title="Accept"
                @click.stop="$emit('respond', { id: notification.id, action: 'accept' })"
            ></i>
            <i 
                class="bi bi-x decline-icon" 
                title="Decline"
                @click.stop="$emit('respond', { id: notification.id, action: 'decline' })"
            ></i>
        </div>
        <button class="delete-btn" title="Usuń" @click.stop="emit('delete', notification.id)">
            <i class="bi bi-trash3"></i>
        </button>
    </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    notification: {
        type: Object,
        required: true
    }
});

const emit = defineEmits(['respond', 'open', 'delete']);
const defaultAvatar = 'assets/pfp.jpg';

const generatedMessage = computed(() => {
    const n = props.notification;
    const senderName = n.author?.triggeredByNickname ?? 'Someone';
    const eventName = n.relatedEvent?.relatedEventName ?? 'an event';

    switch (n.type) {
        case 'invite':
            return `New Invitation: ${eventName}`;
        case 'invite_accepted':
            return `${senderName} accepted your invitation to: ${eventName}`;
        case 'reaction':
            return `${senderName} reacted to your post in: ${eventName}`;
        case 'comment':
            return `${senderName} commented on your post in: ${eventName}`;
        case 'new_post':
            return `${senderName} added a new post in: ${eventName}`;
        case 'reminder':
            return `Reminder for event: ${eventName}`;
        default:
            return 'You have a new notification';
    }
});
</script>

<style scoped>
.notif-card {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 1.2rem;
    display: flex;
    align-items: center;
    gap: 1.2rem;
    width: 100%;
    cursor: pointer;
    transition: background 0.2s;
}

.notif-card:hover {
    background: rgba(255, 255, 255, 0.06);
}

.avatar {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
}

.notif-content {
    flex: 1;
    text-align: left;
}

.notif-content p {
    margin: 0;
    font-size: 0.95rem;
    color: #efefef;
    line-height: 1.4;
}

.notif-content .emphasized {
    margin-top: 4px;
    font-weight: 500;
    color: #fff;
}

.notif-actions {
    display: flex;
    gap: 1.2rem;
    font-size: 1.5rem;
    align-items: center;
}

.accept-icon {
    color: #7f39fb;
    cursor: pointer;
    transition: transform 0.2s;
}

.decline-icon {
    color: #888;
    cursor: pointer;
    transition: transform 0.2s;
}

.accept-icon:hover, .decline-icon:hover {
    transform: scale(1.2);
}

.delete-btn {
    background: transparent;
    border: none;
    color: #666;
    cursor: pointer;
    font-size: 1.1rem;
    padding: 0;
    flex-shrink: 0;
    transition: color 0.2s, transform 0.15s;
}

.delete-btn:hover {
    color: #ff4d6d;
    transform: scale(1.15);
}
</style>