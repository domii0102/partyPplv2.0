<template>
    <div class="app-layout">
        <main class="content">
            <AppHeader v-if="!route.meta.hideHeader" />
            <slot></slot>
        </main>
    </div>
</template>

<script setup>
    import AppHeader from '../navigation/AppHeader.vue';
    import { useRoute } from 'vue-router';

    const route = useRoute();
</script>

<style scoped>
.content{
    background: var(--bg-main);
    color: var(--text-main)
}
</style>