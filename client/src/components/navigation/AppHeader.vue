<template>
    <header class="navbar navbar-expand-lg custom-navbar">
        <div class="container d-flex justify-content-between">
            <RouterLink to="/" class="brand-logo">PartyPpl</RouterLink>
            <div class="link-container">
                <RouterLink to="/login" class="nav-link">Sign in</RouterLink>
                <RouterLink to="/register" class="nav-link">Sign up</RouterLink>
                <FontAwesomeIcon icon="moon" class="icon" />
            </div>
        </div>
    </header>
</template>

<script setup>
</script>

<style scoped>
header{
    padding: 1rem 0;
    background: var(--bg-main);
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
    align-content: center;
}
</style>