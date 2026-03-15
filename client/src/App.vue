<template>
  <component :is="layout">
      <RouterView />
  </component>
</template>

<script setup>
  import AppLayout from './components/layout/AppLayout.vue';

  const layout = AppLayout
</script>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
