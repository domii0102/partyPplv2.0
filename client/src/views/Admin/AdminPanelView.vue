<template>
  <div class="admin-page">
    <h1>Admin panel</h1>

    <div class="tabs">
      <button
        :class="{ active: activeTab === 'reports' }"
        @click="activeTab = 'reports'"
      >
        Reports
      </button>

      <button
        :class="{ active: activeTab === 'users' }"
        @click="activeTab = 'users'"
      >
        Users
      </button>

      <button
        :class="{ active: activeTab === 'events' }"
        @click="activeTab = 'events'"
      >
        Events
      </button>
    </div>

    <!-- REPORTS -->
    <section v-if="activeTab === 'reports'" class="section">
      <div class="section-header">
        <h2>Reports</h2>
        <button @click="loadReports">Refresh</button>
      </div>

      <p v-if="loading">Loading...</p>
      <p v-if="error" class="error">{{ error }}</p>

      <div v-if="reports.length === 0 && !loading">
        No reports found.
      </div>

      <div v-for="report in reports" :key="report.reportId" class="card">
        <div class="card-header">
          <h3>Report #{{ report.reportId }}</h3>
          <span :class="report.isExamined ? 'status-done' : 'status-new'">
            {{ report.isExamined ? "Examined" : "New" }}
          </span>
        </div>

        <p>
          <strong>Created at:</strong>
          {{ formatDate(report.createdAt) }}
        </p>

        <p>
          <strong>Report text:</strong>
          {{ report.textContent || "No description" }}
        </p>

        <p>
          <strong>Sender ID:</strong>
          {{ report.senderId }}
        </p>

        <p>
  <strong>Report type:</strong>
  {{ getReportType(report) }}
</p>

<p v-if="report.eventId">
  <strong>Event ID:</strong>
  {{ report.eventId }}
</p>

<p v-if="report.postId">
  <strong>Post ID:</strong>
  {{ report.postId }}
</p>

<p v-if="report.commentId">
  <strong>Comment ID:</strong>
  {{ report.commentId }}
</p>

        <div v-if="report.event" class="details">
          <p><strong>Event name:</strong> {{ report.event.eventName|| "No name" }}</p>
          <p><strong>Organizer ID:</strong> {{ report.event.organizerId || "No organizer" }}</p>
          <p><strong>Event deleted:</strong> {{ report.event.deletedAt ? "Yes" : "No" }}</p>
        </div><div v-if="report.post" class="details">
  <p><strong>Post text:</strong> {{ report.post.textContent || "No text" }}</p>
  <p><strong>Post author ID:</strong> {{ report.post.authorId }}</p>
  <p>
    <strong>Post author email:</strong>
    {{ report.post.userCredentials?.email || "No email" }}
  </p>
</div>

<div v-if="report.comment" class="details">
  <p><strong>Comment text:</strong> {{ report.comment.textContent || "No text" }}</p>
  <p><strong>Comment author ID:</strong> {{ report.comment.authorId }}</p>
  <p>
    <strong>Comment author email:</strong>
    {{ report.comment.userCredentials?.email || "No email" }}
  </p>
</div>

        <div v-if="report.userCredentials" class="details">
          <p><strong>Sender email:</strong> {{ report.userCredentials.email }}</p>
          <p><strong>Role:</strong> {{ report.userCredentials.userRole }}</p>
        </div>

        <div class="actions">
          <button
            v-if="!report.isExamined"
            @click="markReportAsExamined(report.reportId)"
          >
            Mark as examined
          </button>

          <button
  v-if="report.eventId"
  @click="softDeleteEvent(report.eventId)"
>
  Soft delete event
</button>

<button
  v-if="report.event?.organizerId"
  @click="softDeleteUser(report.event.organizerId)"
>
  Soft delete organizer
</button>

<button
  v-if="report.postId"
  @click="deletePostAdmin(report.postId)"
>
  Delete post
</button>

<button
  v-if="report.commentId"
  @click="deleteCommentAdmin(report.commentId)"
>
  Delete comment
</button>



        </div>
      </div>
    </section>

    <!-- USERS -->
    <section v-if="activeTab === 'users'" class="section">
      <div class="section-header">
        <h2>Users</h2>
        <button @click="loadUsers">Refresh</button>
      </div>

      <div v-for="user in users" :key="user.userId" class="card">
        <h3>{{ user.email }}</h3>

        <p><strong>ID:</strong> {{ user.userId }}</p>
        <p><strong>Role:</strong> {{ user.userRole }}</p>
        <p><strong>Deleted:</strong> {{ user.deletedAt ? "Deleted" : "Active" }}</p>

        <div class="actions">
          <button @click="changeUserRole(user.userId, 'admin')">
            Make admin
          </button>

          <button @click="changeUserRole(user.userId, 'user')">
            Make user
          </button>

          <button @click="softDeleteUser(user.userId)">
            Soft delete user
          </button>
        </div>
      </div>
    </section>

    <!-- EVENTS -->
    <section v-if="activeTab === 'events'" class="section">
      <div class="section-header">
        <h2>Events</h2>
        <button @click="loadEvents">Refresh</button>
      </div>

      <div v-for="event in events" :key="event.eventId" class="card">
        <h3>{{ event.eventName}}</h3>

        <p><strong>ID:</strong> {{ event.eventId }}</p>
        <p><strong>Deleted:</strong> {{ event.deletedAt ? "Deleted" : "Active" }}</p>

        <div class="actions">
          <button @click="softDeleteEvent(event.eventId)">
            Soft delete event
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { service } from "../../services/requestService.js";

const activeTab = ref("reports");

const reports = ref([]);
const users = ref([]);
const events = ref([]);

const loading = ref(false);
const error = ref("");
//rozpoznawanie rodzaju zgloszenia

const getReportType = (report) => {
  if (report.eventId) return "Event";
  if (report.postId) return "Post";
  if (report.commentId) return "Comment";
  return "Unknown";
};

const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleString();
};

const loadReports = async () => {
  loading.value = true;
  error.value = "";

  try {
    const response = await service.get("/api/admin/reports", false);

    console.log("REPORTS:", response);

    if (response.success) {
      reports.value = response.data.reports || response.data || [];
    }
  } catch (err) {
    console.log("LOAD REPORTS ERROR:", err);
    error.value = "Could not load reports.";
  } finally {
    loading.value = false;
  }
};

const loadUsers = async () => {
  loading.value = true;
  error.value = "";

  try {
    const response = await service.get("/api/admin/users");

    console.log("USERS:", response);

    if (response.success) {
      users.value = response.data.users || response.data || [];
    }
  } catch (err) {
    console.log("LOAD USERS ERROR:", err);
    error.value = "Could not load users.";
  } finally {
    loading.value = false;
  }
};

const loadEvents = async () => {
  loading.value = true;
  error.value = "";

  try {
    const response = await service.get("/api/admin/events");

    console.log("EVENTS:", response);

    if (response.success) {
      events.value = response.data.events || response.data || [];
    }
  } catch (err) {
    console.log("LOAD EVENTS ERROR:", err);
    error.value = "Could not load events.";
  } finally {
    loading.value = false;
  }
};

const markReportAsExamined = async (reportId) => {
  try {
    const response = await service.patch(`/api/admin/reports/${reportId}/examine`);

    console.log("MARK REPORT:", response);

    if (response.success) {
      await loadReports();
    }
  } catch (err) {
    console.log("MARK REPORT ERROR:", err);
  }
};

const softDeleteEvent = async (eventId) => {
  const confirmed = confirm("Are you sure you want to soft delete this event?");
  if (!confirmed) return;

  try {
    const response = await service.patch(`/api/admin/events/${eventId}/soft-delete`);

    console.log("SOFT DELETE EVENT:", response);

    if (response.success) {
      await loadReports();
      if (activeTab.value === "events") {
        await loadEvents();
      }
    }
  } catch (err) {
    console.log("SOFT DELETE EVENT ERROR:", err);
  }
};

const softDeleteUser = async (userId) => {
  const confirmed = confirm("Are you sure you want to soft delete this user?");
  if (!confirmed) return;

  try {
    const response = await service.patch(`/api/admin/users/${userId}/soft-delete`);

    console.log("SOFT DELETE USER:", response);

    if (response.success) {
      await loadReports();
      if (activeTab.value === "users") {
        await loadUsers();
      }
    }
  } catch (err) {
    console.log("SOFT DELETE USER ERROR:", err);
  }
};

const changeUserRole = async (userId, role) => {
  const confirmed = confirm(`Change user role to ${role}?`);
  if (!confirmed) return;

  try {
    const response = await service.patch(`/api/admin/users/${userId}/role`, {
      userRole: role,
    });

    console.log("CHANGE USER ROLE:", response);

    if (response.success) {
      await loadReports();
      if (activeTab.value === "users") {
        await loadUsers();
      }
    }
  } catch (err) {
    console.log("CHANGE USER ROLE ERROR:", err);
  }
};
const deletePostAdmin = async (postId) => {
  const confirmed = confirm("Are you sure you want to delete this post?");
  if (!confirmed) return;

  try {
    const response = await service.delete(`/api/admin/posts/${postId}`);

    console.log("DELETE POST:", response);

    if (response.success) {
      await loadReports();
    }
  } catch (err) {
    console.log("DELETE POST ERROR:", err);
  }
};

const deleteCommentAdmin = async (commentId) => {
  const confirmed = confirm("Are you sure you want to delete this comment?");
  if (!confirmed) return;

  try {
    const response = await service.delete(`/api/admin/comments/${commentId}`);

    console.log("DELETE COMMENT:", response);

    if (response.success) {
      await loadReports();
    }
  } catch (err) {
    console.log("DELETE COMMENT ERROR:", err);
  }
};


watch(activeTab, async (tab) => {
  if (tab === "reports") {
    await loadReports();
  }

  if (tab === "users") {
    await loadUsers();
  }

  if (tab === "events") {
    await loadEvents();
  }
});

onMounted(async () => {
  await loadReports();
});
</script>

<style scoped>
.admin-page {
  padding: 2rem;
  color: white;
}

.tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.tabs button {
  padding: 0.7rem 1.2rem;
  border-radius: 10px;
  border: 1px solid #777;
  background: transparent;
  color: white;
  cursor: pointer;
}

.tabs button.active {
  border-color: orange;
}

.section {
  margin-top: 1rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card {
  border: 1px solid #444;
  border-radius: 14px;
  padding: 1rem;
  margin-bottom: 1rem;
  background: rgba(0, 0, 0, 0.25);
}
.card p strong,
.details p strong {
  color: orange;
}
.card p,
.details p {
  color: #fff;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.details {
  margin-top: 0.75rem;
  padding: 0.75rem;
  border-left: 3px solid orange;
  background: rgba(255, 255, 255, 0.05);
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1rem;
}

.actions button {
  padding: 0.55rem 0.9rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
}

.status-new {
  color: orange;
  font-weight: bold;
}

.status-done {
  color: lightgreen;
  font-weight: bold;
}

.error {
  color: #ff6b6b;
}
</style>