<template>
    <header class="navbar navbar-expand-lg custom-navbar">
        <div class="container d-flex justify-content-between">
            <a class="navbar-brand brand-logo">PartyPpl</a>
            <div class="link-container">
                <a class="nav-link">Sign in</a>
                <a class="nav-link">Sign up</a>
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
    color: var(--text-main);
}
a{
    cursor: pointer;
    transition: color 0.5s;
}
a:hover{
    color: var(--accent-purple);
}
.brand-logo{
    font-size: 1.5rem;
    color: var(--text-main);
    cursor: pointer;
    transition: color 0.5s;
}
.link-container{
    display: flex;
    gap: 1.5rem;
}
</style>