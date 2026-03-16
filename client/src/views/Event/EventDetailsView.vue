<template>
  <div class="container mt-4">

    <h1>{{ event.title }}</h1>

    <img :src="event.image" class="img-fluid rounded mb-3"/>

    <div class="mb-3">
      <strong>Data:</strong> {{ event.date }}
    </div>

    <div class="mb-3">
      <strong>Miejsce:</strong> {{ event.location }}
    </div>

    <div class="mb-3">
      <strong>Opis:</strong>
      <p>{{ event.description }}</p>
    </div>

  </div>
</template>

<script setup>
import { ref } from "vue"

const event = ref({
  id: 1,
  title: "Domówka u Ani",
  date: "12.04.2026",
  location: "Szczecin",
  description: "Luźna impreza ze znajomymi",
  image: "https://picsum.photos/800/300"
})
</script> 