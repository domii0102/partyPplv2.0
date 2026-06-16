<template>
  <div class="update-event-page">
    <div class="update-event-card">
      <h1>Edit event</h1>

      <p v-if="loading" class="info">Loading event...</p>
      <p v-if="error" class="error">{{ error }}</p>

      <form v-if="!loading && !error" @submit.prevent="handleUpdateEvent">
        <div class="form-group">
          <label>Event name</label>
          <input v-model="form.eventName" type="text" required />
        </div>

        <div class="form-group">
          <label>Description</label>
          <textarea v-model="form.description" rows="5" required></textarea>
        </div>

        <div class="form-group checkbox-group">
          <label>
            <input v-model="form.isPublic" type="checkbox" />
            Public event
          </label>
        </div>

        <div class="form-group">
          <label>Start date</label>
          <input v-model="form.eventDateTime" type="datetime-local" required />
        </div>

        <div class="form-group">
          <label>End date</label>
          <input v-model="form.endDateTime" type="datetime-local" />
        </div>

        <div class="form-group">
          <label>Location name</label>
          <input v-model="form.locationName" type="text" />
        </div>

        <div class="form-group">
          <label>Location address</label>
          <input v-model="form.locationAddress" type="text" />
        </div>

        
         

        <div class="form-row">
          <div class="form-group">
            <label>Age restriction</label>
            <input v-model="form.ageRestriction" type="number" min="0" />
          </div>

          <div class="form-group">
            <label>Guest limit</label>
            <input v-model="form.guestLimit" type="number" min="0" />
          </div>
        </div>

        <div class="form-group">
          <label>Hashtags</label>
          <input
            v-model="hashtagsText"
            type="text"
            placeholder="party, music, friends"
          />
        </div>

        <div class="buttons">
          <button type="button" class="cancel-button" @click="goBack">
            Cancel
          </button>

          <button type="submit" class="save-button" :disabled="saving">
            {{ saving ? "Saving..." : "Save changes" }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { SERVER_BASE_URL } from "../../config/env";

const route = useRoute();
const router = useRouter();

const loading = ref(false);
const saving = ref(false);
const error = ref(null);
const hashtagsText = ref("");

const form = ref({
  eventName: "",
  description: "",
  isPublic: true,
  eventDateTime: "",
  endDateTime: "",
  locationLatitude: "",
  locationLongitude: "",
  locationName: "",
  locationAddress: "",
  ageRestriction: "",
  guestLimit: "",
});

function formatDateForInput(dateValue) {
  if (!dateValue) return "";

  const date = new Date(dateValue);
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);

  return localDate.toISOString().slice(0, 16);
}

function normalizeNumber(value) {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  return Number(value);
}

function normalizeDate(value) {
  if (!value) return null;
  return new Date(value).toISOString();
}

async function fetchEvent() {
  loading.value = true;
  error.value = null;

  const eventId = route.params.id;

  try {
    const res = await fetch(`${SERVER_BASE_URL}/api/event/${eventId}`, {
      method: "GET",
      credentials: "include",
    });

    const serverData = await res.json();

    if (!res.ok) {
      throw new Error(serverData.error || "Failed to fetch event.");
    }

    const event = serverData.data;

    if (!event.isOrganizer) {
      error.value = "You do not have permission to edit this event.";
      return;
    }

    form.value = {
      eventName: event.eventName || "",
      description: event.description || "",
      isPublic: event.isPublic ?? true,
      eventDateTime: formatDateForInput(event.eventDateTime),
      endDateTime: formatDateForInput(event.endDateTime),
      locationLatitude: event.locationLatitude ?? "",
      locationLongitude: event.locationLongitude ?? "",
      locationName: event.locationName || "",
      locationAddress: event.locationAddress || "",
      ageRestriction: event.ageRestriction ?? "",
      guestLimit: event.guestLimit ?? "",
    };

    hashtagsText.value = event.hashtags
      ? event.hashtags.map((hashtag) => hashtag.name).join(", ")
      : "";
  } catch (err) {
    console.error("FETCH EVENT ERROR:", err);
    error.value = "Problem occurred while loading event.";
  } finally {
    loading.value = false;
  }
}

async function handleUpdateEvent() {
  saving.value = true;
  error.value = null;

  const eventId = route.params.id;

  const payload = {
    eventName: form.value.eventName,
    description: form.value.description,
    isPublic: form.value.isPublic,

    eventDateTime: new Date(form.value.eventDateTime).toISOString(),

    endDateTime: form.value.endDateTime
      ? new Date(form.value.endDateTime).toISOString()
      : null,

    locationLatitude: form.value.locationLatitude !== ""
      ? Number(form.value.locationLatitude)
      : null,

    locationLongitude: form.value.locationLongitude !== ""
      ? Number(form.value.locationLongitude)
      : null,

    locationName: form.value.locationName || null,
    locationAddress: form.value.locationAddress || null,

    ageRestriction: form.value.ageRestriction !== ""
      ? Number(form.value.ageRestriction)
      : null,

    guestLimit: form.value.guestLimit !== ""
      ? Number(form.value.guestLimit)
      : null,

    hashtags: hashtagsText.value
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0),
  };

  console.log("UPDATE PAYLOAD:", payload);

  try {
    const res = await fetch(`${SERVER_BASE_URL}/api/event/${eventId}`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const serverData = await res.json();

    if (!res.ok) {
      console.error("UPDATE EVENT SERVER ERROR:", serverData);

      error.value =
        typeof serverData.error === "string"
          ? serverData.error
          : JSON.stringify(serverData.error, null, 2);

      return;
    }

    router.push(`/event/dashboard/${eventId}`);
  } catch (err) {
    console.error("UPDATE EVENT ERROR:", err);
    error.value = "Problem occurred while saving changes.";
  } finally {
    saving.value = false;
  }
}

function goBack() {
  router.push(`/event/dashboard/${route.params.id}`);
}

onMounted(fetchEvent);
</script>

<style scoped>
.update-event-page {
  min-height: 100vh;
  background: var(--bg-main);
  color: white;
  padding: 3rem 1rem;
  font-family: "Montserrat", sans-serif;
}

.update-event-card {
  max-width: 760px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 20px;
  padding: 2rem;
  backdrop-filter: blur(10px);
}

.update-event-card h1 {
  text-align: center;
  margin-bottom: 2rem;
  color: var(--accent-orange, #ff7a00);
}

.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
}

.form-group label {
  margin-bottom: 0.4rem;
  font-size: 0.9rem;
  color: var(--text-muted, #cfcfcf);
}

.form-group input,
.form-group textarea {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.18);
  color: white;
  border-radius: 10px;
  padding: 0.75rem;
  outline: none;
}

.form-group input:focus,
.form-group textarea:focus {
  border-color: var(--accent-orange, #ff7a00);
}

.checkbox-group {
  flex-direction: row;
  align-items: center;
}

.checkbox-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.buttons {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.cancel-button,
.save-button {
  border: none;
  border-radius: 999px;
  padding: 0.75rem 1.4rem;
  cursor: pointer;
  font-weight: 600;
}

.cancel-button {
  background: rgba(255, 255, 255, 0.12);
  color: white;
}

.save-button {
  background: var(--accent-orange, #ff7a00);
  color: white;
}

.save-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error {
  color: #ff6b6b;
  text-align: center;
}

.info {
  text-align: center;
  color: var(--text-muted, #cfcfcf);
}

@media (max-width: 700px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .buttons {
    flex-direction: column;
  }
}
</style>