<template>
  <div class="popup-overlay" @click.self="close">
    <div class="report-popup">
      <h2>{{ title }}</h2>

      <p class="popup-desc">
        {{ description }}
      </p>

      <textarea
        v-model="reportText"
        maxlength="256"
        placeholder="Write report reason..."
      ></textarea>

      <div class="char-counter">
        {{ reportText.length }}/256
      </div>

      <p v-if="error" class="error-text">{{ error }}</p>
      <p v-if="success" class="success-text">{{ success }}</p>

      <div class="popup-actions">
        <button type="button" @click="close">
          Cancel
        </button>

        <button type="button" @click="submitReport" :disabled="loading">
          {{ loading ? "Sending..." : "Submit report" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { service } from "../../services/requestService.js";

const props = defineProps({
  targetType: {
    type: String,
    required: true,
  },
  targetId: {
    type: [String, Number],
    required: true,
  },
  title: {
    type: String,
    default: "Report",
  },
  description: {
    type: String,
    default: "Describe why you want to report this content.",
  },
});

const emit = defineEmits(["close", "reported"]);

const reportText = ref("");
const loading = ref(false);
const error = ref("");
const success = ref("");

function close() {
  emit("close");
}

const submitReport = async () => {
  error.value = "";
  success.value = "";

  if (!reportText.value.trim()) {
    error.value = "Report reason is required.";
    return;
  }

  if (reportText.value.length > 256) {
    error.value = "Report reason must be shorter than 256 characters.";
    return;
  }

  loading.value = true;

  try {
    const response = await service.post(
      `/api/report/${props.targetType}/${props.targetId}`,
      {
        textContent: reportText.value,
      }
    );

    console.log("REPORT RESPONSE:", response);

    if (response.success) {
      success.value = "Report sent successfully.";
      emit("reported", response.data);

      setTimeout(() => {
        close();
      }, 1000);
    }
  } catch (err) {
    console.log("REPORT ERROR:", err);
    error.value = err.message || "Could not send report.";
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.popup-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.report-popup {
  width: 90%;
  max-width: 450px;
  background: var(--bg-main);
  border: 1px solid var(--accent-orange);
  border-radius: 16px;
  padding: 1.5rem;
  color: #fff;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
}

.report-popup h2 {
  margin-bottom: 0.5rem;
  text-align: center;
}

.popup-desc {
  font-size: 0.9rem;
  color: var(--text-muted);
  text-align: center;
  margin-bottom: 1rem;
}

.report-popup textarea {
  width: 100%;
  min-height: 120px;
  resize: vertical;
  border-radius: 10px;
  border: 1px solid #555;
  background: rgba(255, 255, 255, 0.08);
  color: white;
  padding: 0.8rem;
  outline: none;
}

.char-counter {
  text-align: right;
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-top: 0.25rem;
}

.popup-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1rem;
}

.popup-actions button {
  border: none;
  border-radius: 100px;
  padding: 0.6rem 1rem;
  cursor: pointer;
}

.error-text {
  color: #ff6b6b;
  font-size: 0.85rem;
  margin-top: 0.5rem;
}

.success-text {
  color: lightgreen;
  font-size: 0.85rem;
  margin-top: 0.5rem;
}
</style>