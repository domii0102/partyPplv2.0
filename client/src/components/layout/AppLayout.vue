<template>
    <div class="app-layout">
        <AppHeader/>
        <main class="content">
            <slot></slot>
        </main>
    </div>
</template>

<script setup>
    import AppHeader from '../navigation/AppHeader.vue';
</script>

<style scoped>
</style>