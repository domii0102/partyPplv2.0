<template>
    <header class="navbar navbar-expand-lg custom-navbar">
        <div class="container d-flex justify-content-between">
            <RouterLink to="/" class="brand-logo">PartyPpl</RouterLink>
            <div class="link-container" v-if="!user">
                <RouterLink to="/login" class="nav-link">Sign in</RouterLink>
                <RouterLink to="/register" class="nav-link">Sign up</RouterLink>
                <FontAwesomeIcon icon="moon" class="icon" />
            </div>
            <div class="link-container" v-else>
                <RouterLink to="/event/feed" class="nav-link"><i :class="'bi bi-globe'"></i><span>Discover</span></RouterLink>
                <RouterLink to="/notifications" class="nav-link"><i :class="'bi bi-bell'"></i><span>Notifications</span></RouterLink>
                <RouterLink to="/profile" class="nav-link"><i :class="'bi bi-person'"></i><span>Profile</span></RouterLink>
            </div>
        </div>
    </header>
</template>

<script setup>
    import { useUserStore } from '../../stores/user.js';
    import { storeToRefs } from 'pinia';

    const store = useUserStore();
    const { user } = storeToRefs(store);
</script>

<style scoped>
header{
    padding: 1rem 0;
    background: none;
}
.brand-logo, .link-container{
    cursor: pointer;
    transition: color 0.5s;
    color: var(--text-main);
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
.icon{
    transition: color 0.5s;
    cursor: pointer;
    height: 100%;
    align-self: center;
}
.icon:hover{
    color: var(--accent-soft);
}
.nav-link{
    display: flex;
}

i {
    font-size: 1.5rem;
    margin-right: 0.5rem;
}
span{
    align-content: center;
}
</style>