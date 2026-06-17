<template>
    <header class="navbar navbar-expand-lg custom-navbar">
        <div class="container d-flex justify-content-between">
            <RouterLink to="/" class="brand-logo">PartyPpl</RouterLink>
            
            <div class="link-container" v-if="!user">
                <RouterLink to="/login" class="nav-link">Sign in</RouterLink>
                <RouterLink to="/register" class="nav-link">Sign up</RouterLink>
            </div>

            <div class="link-container" v-else>
                <RouterLink to="/event/create" class="nav-link">
                    <i class="bi bi-house-add"></i>
                    <span class="d-none d-md-inline">Create Event</span>
                </RouterLink>
                <RouterLink to="/event/feed" class="nav-link">
                    <i class="bi bi-globe"></i>
                    <span class="d-none d-md-inline">Discover</span>
                </RouterLink>
                
                <div class="nav-link position-relative" @click="isNotificationsOpen = true">
                    <i class="bi bi-bell"></i>
                    <span class="d-none d-md-inline">Notifications</span>
                    <span v-if="unreadCount > 0" class="badge-dot"></span>
                </div>

                <RouterLink to="/profile" class="nav-link">
                    <i class="bi bi-person"></i>
                    <span class="d-none d-md-inline">Profile</span>
                </RouterLink>
            </div>
        </div>

        <Teleport to="body">
            <Transition name="slide">
                <NotificationSidebar 
                    v-if="isNotificationsOpen" 
                    @close="isNotificationsOpen = false" 
                />
            </Transition>
        </Teleport>
    </header>
</template>

<script setup>
    import { ref } from 'vue';
    import { useUserStore } from '../../stores/user.js';
    import { storeToRefs } from 'pinia';
    import NotificationSidebar from '../layout/NotificationSidebar.vue'; 
    import { onMounted } from 'vue';
    import { useNotificationStore } from '../../stores/notifications.js';

    const store = useUserStore();
    const { user } = storeToRefs(store);

    const isNotificationsOpen = ref(false);
    const notifStore = useNotificationStore();
    const { unreadCount } = storeToRefs(notifStore);

    onMounted(() => notifStore.loadNotifications());
    
</script>

<style scoped>
header{
    height: var(--header-height);
    background: none;
}
.brand-logo, .link-container{
    cursor: pointer;
    transition: color 0.5s;
    color: var(--text-muted);
}
.brand-logo{
    font-size: 1.5rem;
    cursor: pointer;
    transition: color 0.5s;
    text-decoration: none;
    font-weight: 400;
}
.link-container{
    display: flex;
    gap: 1.5rem;
}
.brand-logo:hover, .nav-link:hover{
    color: var(--accent-purple);
}

i {
    font-size: 1.5rem;
    margin-right: 0.5rem;
}
span{
    align-content: center;
}
.nav-link {
    cursor: pointer;
    display: flex;
    align-items: center;
}

.badge-dot {
    position: absolute;
    top: 5px;
    left: 15px;
    width: 10px;
    height: 10px;
    background: var(--accent-orange, #ff9f43);
    border-radius: 50%;
    border: 2px solid #110d26;
}

.slide-enter-active, .slide-leave-active {
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-enter-from, .slide-leave-to {
    transform: translateY(-20px); 
    opacity: 0;
}
</style>