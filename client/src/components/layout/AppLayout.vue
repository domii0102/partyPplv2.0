<template>
    <div class="app-layout">
        <main class="content">
            <AppHeader/>
            <slot></slot>
        </main>
    </div>
</template>

<script setup>
    import AppHeader from '../navigation/AppHeader.vue';
</script>

<style scoped>
.content{
    background: var(--bg-main);
    color: var(--text-main)
}
</style>