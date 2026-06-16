<template>
  <div class="profile-header">
    <div class="container">
      <div class="row align-items-center">
        <div class="col-md-auto text-center text-md-start mb-3 mb-md-0">
          <div class="avatar-container mx-auto mx-md-0">
            <img class="avatar-img" :src="profilePicture" alt="Avatar" />
          </div>
        </div>
        <div class="col-md">
          <div class="profile-info text-center text-md-start ms-md-4">
            <h1>{{ profileUser?.name }} {{ profileUser?.surname }}</h1>
            <div class="nickname">{{ profileUser?.nickname }}</div>
            <router-link v-if="!userId" class="btn btn-edit-profile" to="/profile/edit">
              Edit profile
            </router-link>
            <button v-if="!userId" class="btn btn-none log-out" @click="logOut">
              <i class="bi bi-box-arrow-right"></i>
              Log out
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="gradient-line"></div>

  <div class="container pb-5">
    <div class="row mb-5">
      <div
        class="section-title col-12 d-flex justify-content-between align-items-center"
      >
        <div>
          <h2 v-if="!userId">Your events</h2>
          <h2 v-else>User's events</h2>
          <div class="gradient-line"></div>
        </div>
      </div>

      <div class="col-12 event-scroll-container" ref="yourEventsContainer">
        <EventCard
          v-for="event in organizedEvents"
          :key="event.eventId"
          :event="event"
          class="eventCard"
          @select="router.push(`/event/dashboard/${$event}`)"
        />
      </div>
    </div>

    <div class="row" v-if="!userId">
      <div
        class="section-title col-12 d-flex justify-content-between align-items-center"
      >
        <div>
          <h2>Events you're participating in</h2>
          <div class="gradient-line"></div>
        </div>
      </div>

      <div class="col-12 event-scroll-container" ref="yourEventsContainer">
        <EventCard
          v-for="event in participatingEvents"
          :key="event.eventId"
          :event="event"
          class="eventCard"
          @select="router.push(`/event/dashboard/${$event}`)"
        />
      </div>
      
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue';
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import defaultImage from "../../assets/pfp.jpg";
import { useUserStore } from "../../stores/user.js";
import { storeToRefs } from "pinia";
import { service } from "../../services/requestService.js";
import { useRouter, useRoute } from "vue-router";
import EventCard from "../../components/event/EventCard.vue";
import { SERVER_BASE_URL } from "../../config/env";
import EditProfileView from './EditProfileView.vue';

const router = useRouter();
const route = useRoute();
const store = useUserStore();
const { user: loggedInUser } = storeToRefs(store);

const userId = computed(() => route.params.id);
const profileUser = ref(null);
const loading = ref(false);
const profilePicture = ref(null);

const fetchProfile = async () => {
  loading.value = true;

  try {
    if (userId.value) {
      const res = await fetch(`${SERVER_BASE_URL}/api/user/${userId.value}`, {
        method: "GET",
        credentials: "include",
      });

      const data = await res.json();
      profileUser.value = data.data.profile;
    } else {
      profileUser.value = loggedInUser.value;
    }
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
  profilePicture.value = profileUser.value.avatar?.url || defaultImage;
};

watch(
  userId,
  () => {
    fetchProfile();
  },
  { immediate: true }
);

const organizedEvents = ref([]);
const participatingEvents = ref([]);
const status = reactive({
  error: null,
  empty: false,
});

const fetchUserEvents = async () => {
  loading.value = true;
  status.error = null;
  status.empty = false;

  try {
    const fetchURL = new URL(`${SERVER_BASE_URL}/api/event/`);
      if (userId.value) {
        // profil innego użytkownika
        fetchURL.searchParams.append("visibility", "user");
        fetchURL.searchParams.append("userId", userId.value);
      } else {
        // mój profil
        fetchURL.searchParams.append("visibility", "mine");
      }


    fetchURL.searchParams.append("sortBy", "default");

    const res = await fetch(fetchURL, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const serverData = await res.json();
    if (!res.ok) throw new Error(serverData.error || "Failed to fetch events.");

    organizedEvents.value = serverData.data.organizedEvents || [];
    participatingEvents.value = serverData.data.participatingEvents || [];


     if (
      organizedEvents.value.length === 0 &&
      participatingEvents.value.length === 0
    ) {
      status.empty = true;
    }
  } catch (err) {
    console.error(err);
    status.error =
      "Problem occured while loading events, please try again later.";
  } finally {
    loading.value = false;
  }
};

watch(
  userId,
  async () => {
    await fetchProfile();
    await fetchUserEvents();
  },
  { immediate: true }
);


const logOut = async () => {
  store.logout();

  try {
    const response = await service.post("/api/account/logout", {});

    console.log(response);

    if (response && response.error) {
      throw new Error(response.error);
    }

    console.log("Response success: ", response.success);
    if (response.success) {
      router.push({ path: "/" });
      return;
    }
  } catch (err) {
    console.log(err);
  }
};
</script>

<style scoped>
.icon {
  cursor: pointer;
  color: var(--text-muted);
}
.profile-header {
  background: linear-gradient(
    270deg,
    var(--bg-main),
    var(--accent-purple),
    transparent 1000%
  );
  padding: 4rem;
}
.avatar-container {
  width: auto;
  height: auto;
  max-width: 240px;
  aspect-ratio: 1/1;
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid var(--accent-purple);
}
.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.gradient-line {
  height: 2px;
  width: 100%;
  background: var(--line-gradient);
}
.profile-info h1 {
  font-size: 3.5rem;
  font-weight: 300;
  margin-bottom: 0;
  color: var(--text-main);
}
.profile-info .nickname {
  color: var(--accent-orange);
  font-size: 1.2rem;
  margin-bottom: 1rem;
  font-style: italic;
}
.stats {
  font-size: 1.1rem;
  color: var(--text-muted);
  margin-bottom: 1rem;
}
.btn-edit-profile {
  background: transparent;
  border: 1px solid var(--accent-orange);
  color: var(--text-main);
  padding: 8px 30px;
  border-radius: 20px;
  transition: all 0.3s;
}

.btn-edit-profile:hover {
  background: var(--accent-orange);
  text-decoration: none;
}
.section-title {
  margin-top: 2rem;
}
.section-title h2 {
  font-size: 1.7rem;
  font-weight: 400;
}

.log-out {
  margin-left: 2rem;
  color: var(--text-main);
  text-decoration: none;
}

.event-scroll-container{
  display: flex;
  flex-direction: row;
  gap: 1rem;
  overflow-x: auto;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  margin-top: 0.5rem;
}

.eventCard{
  flex: 0 0 auto;
  width: 300px;
}
</style>
