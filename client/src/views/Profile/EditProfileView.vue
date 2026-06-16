<template>
  <div class="background">
    <div class="main-page">
      <div class="form-container">
        <div class="header">
          <div class="spacer"></div>
          <h2 class="display-6">Edit your profile info</h2>
          <router-link class="go-back" to="/">← Go back</router-link>
        </div>

        <form @submit.prevent="handleEditProfile" novalidate>
          <div class="form-inner">
            <div>
              <div class="form-group">
                <label for="nickname">Nickname</label>
                <input
                  v-model="formData.nickname"
                  type="text"
                  id="nickname"
                  placeholder="Enter your nickname"
                  :class="{ 'input-error': false }"
                />
                <span v-if="errors.nickname" class="error-text">{{
                  errors.nickname
                }}</span>
              </div>

             
            </div>
            <div class="pfp-container form-group">
              <label>Profile picture *</label>
              <div class="image-preview">
                <img
                  v-if="photoPreview"
                  :src="photoPreview"
                  alt="Cover preview"
                />
                <img v-else :src="defaultImage" alt="Cover preview" />
              </div>
              <button type="button" @click="uploadPhoto" class="upload-btn">
                Upload Image
              </button>
              <span v-if="errors.image" class="error-text">{{
                errors.avatar
              }}</span>
              <input
                type="file"
                ref="fileInput"
                @change="handleFileChange"
                style="display: none"
              />
            </div>
          </div>

          <button type="submit" class="gradient-btn" :disabled="loading">
            {{ loading ? "Saving changes..." : "Save" }}
          </button>
        </form>

        
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { service } from "../../services/requestService.js";
import defaultImage from "../../assets/pfp.jpg";
import { useUserStore } from "../../stores/user.js";
import { useAccountStore } from "../../stores/account.js";
const formData = reactive({
  nickname: "",
  avatar: null,
});
const userStore = useUserStore();
const accountStore = useAccountStore();
const errors = reactive({
  nickname: "",
  avatar: null,
});

const loading = ref(false);

const router = useRouter();
const fileInput = ref(null);
const photoPreview = ref(null);
const photoError = ref("");


function getEmailFromToken() {
  const token = localStorage.getItem("token");

  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.email;
  } catch (err) {
    console.log("TOKEN DECODE ERROR:", err);
    return null;
  }
}
function uploadPhoto() {
  fileInput.value?.click();
}

function handleFileChange(event) {
  const file = event.target.files[0];
  if (!file) return;

  // Walidacja typu pliku
  if (!file.type.startsWith("image/")) {
    errors.avatar = "Please upload a valid image file";
    formData.avatar = null;
    if (photoPreview.value) {
      URL.revokeObjectURL(photoPreview.value);
      photoPreview.value = null;
    }
    return;
  }

  // Walidacja rozmiaru (max 5MB)
  const maxSizeMB = 5;
  if (file.size / 1024 / 1024 > maxSizeMB) {
    errors.avatar = `Image must be smaller than ${maxSizeMB}MB`;
    formData.avatar = null;
    if (photoPreview.value) {
      URL.revokeObjectURL(photoPreview.value);
      photoPreview.value = null;
    }
    return;
  }

  if (photoPreview.value) {
    URL.revokeObjectURL(photoPreview.value);
  }
  formData.avatar = file;
  photoPreview.value = URL.createObjectURL(file);
  photoError.value = "";
}

const validateForm = () => {
  let isValid = true;
  Object.keys(errors).forEach((key) => (errors[key] = ""));

  if (!formData.nickname) {
    errors.nickname = "Nickname is required.";
    isValid = false;
  } else if (formData.nickname.length > 64) {
    errors.nickname = "Nickname needs to be shorter than 64 characters!";
  }
  return isValid;
};

const handleEditProfile = async () => {
  if (!validateForm()) return;

  loading.value = true;

  try {
    if (!userStore.user) {
      await userStore.loadUser();
    }

    const currentUser = userStore.user;

    const profileData = {
     
      nickname: formData.nickname,
      
    };

    console.log("PROFILE DATA:", profileData);

    const profileResponse = await service.put("/api/user/", profileData);

    console.log("EDIT PROFILE RESPONSE:", profileResponse);

    if (formData.avatar instanceof File) {
      const avatarData = new FormData();
      avatarData.append("avatar", formData.avatar);

      const avatarResponse = await service.patch(
        "/api/user/update-avatar",
        avatarData
      );

      console.log("EDIT AVATAR RESPONSE:", avatarResponse);
    }

    await userStore.loadUser();
    router.push({ path: "/profile" });
  } catch (err) {
    console.log("EDIT PROFILE ERROR:", err);
  } finally {
    loading.value = false;
  }
};
onMounted(async () => {
  if (!userStore.user) {
    await userStore.loadUser();
  }

  formData.nickname = userStore.user?.nickname || "";

  if (userStore.user?.avatar?.url) {
    photoPreview.value = userStore.user.avatar.url;
  }
});
</script>

<style scoped>
.form-inner {
  display: grid;
  grid-template-columns: 1fr 1fr;
}

.bottom-text {
  text-align: center;
  margin-top: 1.25rem;
  font-size: 0.875rem;
}

.image-preview {
  width: 10rem;
  height: 10rem;
  aspect-ratio: 1/1;
  border-radius: 14px;
  border: 1px solid var(--primary-orange);
  background: rgba(0, 0, 0, 0.22);
  box-shadow: 0 14px 40px rgba(0, 0, 0, 0.35);
  overflow: hidden;
  margin-bottom: 1rem;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-btn {
  border-radius: 100px;
  border: solid 1px var(--primary-orange);
  background: var(--auth-bg-overlay);
  color: #fff;
  outline: none;
  transform: 1s;
}

.upload-btn:hover {
  border-color: var(--primary-purple);
}

.pfp-container {
  align-items: center;
}

@media (max-width: 800px) {
  .form-container {
    padding: 1.5rem;
    max-width: 100%;
  }
  .form-inner {
    display: block;
  }
}
</style>
