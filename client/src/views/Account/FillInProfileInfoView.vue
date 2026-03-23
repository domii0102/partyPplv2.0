<template>
<div class="background">
  <div class="main-page">
    <div class="form-container">
        <h2 class="display-6">Fill in your profile info</h2>
      <form @submit.prevent="handleFillInProfile" novalidate>
        <div class="form-inner">
            <div>
                <div class="form-group">
                    <label for="nickname">Nickname</label>
                    <input v-model="formData.nickname" type="text" id="nickname" placeholder="Enter your nickname"
                        :class="{ 'input-error': false }" />
                    <span v-if="errors.nickname" class="error-text">{{ errors.nickname }}</span>
                </div>

                <div class="form-inner">
                    <div class="form-group">
                        <label for="firstname">First name</label>
                        <input v-model="formData.name" type="text" id="firstname" placeholder="Your first name"
                            :class="{ 'input-error': false }" />
                        <span v-if="errors.name" class="error-text">{{errors.name}}</span>
                    </div>

                    <div class="form-group">
                        <label for="surname">Surname</label>
                        <input v-model="formData.surname" type="text" id="surname" placeholder="Your surname"
                            :class="{ 'input-error': false }" />
                        <span v-if="errors.surname" class="error-text">{{ errors.surname }}</span>
                    </div>
                </div>

                <div class="form-group">
                    <label for="dateOfBirth">Date of Birth</label>
                    <input v-model="formData.dateOfBirth" type="date" id="dateOfBirth"
                        :class="{ 'input-error': false }" />
                    <span v-if="errors.dateOfBirth" class="error-text">{{errors.dateOfBirth}}</span>
                </div>
            </div>
            <div class="pfp-container form-group">
                <label>Profile picture *</label>
                <div class="image-preview">
                    <img v-if="photoPreview" :src="photoPreview" alt="Cover preview" />
                    <img v-else :src="defaultImage" alt="Cover preview" />
                </div>
                <button type="button" @click="uploadPhoto" class="upload-btn">Upload Image</button>
                <span v-if="errors.image" class="error-text">{{ errors.avatar }}</span>
                <input type="file" ref="fileInput" @change="handleFileChange" style="display: none;" />
            </div>
        </div>

        <button type="submit" class="gradient-btn" :disabled="loading">
          {{ loading ? 'Saving profile...' : 'Save' }}
        </button>

      </form>

      <p class="bottom-text">
        Want to do this later?
        <router-link>Log out.</router-link>
      </p>
    </div>
  </div>
</div>
</template>

<script setup>
import './account.css'
import { reactive, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { SERVER_BASE_URL } from '../../config/env.js';
import defaultImage from '../../assets/pfp.jpg';
import { useAccountStore } from '../../stores/account.js';

const formData = reactive({
    nickname: '',
    name: '',
    surname: '',
    dateOfBirth: '',
    avatar: ''
});

const errors = reactive({
    nickname: '',
    name: '',
    surname: '',
    dateOfBirth: '',
    avatar: null
});

const loading = ref(false);

const router = useRouter();
const fileInput = ref(null);
const photoPreview = ref(null);
const photoError = ref('');
const accountStore = useAccountStore();

function uploadPhoto() {
    fileInput.value?.click();
}

function handleFileChange(event){
    const file = event.target.files[0];
    if (!file) return;

    // Walidacja typu pliku
    if (!file.type.startsWith('image/')) {
        errors.avatar = 'Please upload a valid image file';
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
    photoError.value = '';
}

const validateForm = () => {
    let isValid = true;
    Object.keys(errors).forEach(key => errors[key] = '');

    if(!formData.nickname){
        errors.nickname = "Nickname is required.";
        isValid = false;
    } else if (formData.nickname.length > 64){
        errors.nickname = "Nickname needs to be shorter than 64 characters!"
    }
    if(!formData.name){
        errors.name = "Name is required.";
        isValid = false;
    } else if (formData.name.length > 64){
        errors.name = "Name needs to be shorter than 64 characters!"
    }
    if(!formData.surname){
        errors.surname = "Surname is required.";
        isValid = false;
    } else if (formData.surname.length > 64){
        errors.surname = "Surname needs to be shorter than 64 characters!"
    }
if (!formData.dateOfBirth) {
    errors.dateOfBirth = "Date of birth is required.";
    isValid = false;
} else {
    const birth = new Date(formData.dateOfBirth);

    if (isNaN(birth.getTime())) {
        errors.dateOfBirth = "Invalid date.";
        isValid = false;
    } else {
        const today = new Date();

        const age =
            today.getFullYear() -
            birth.getFullYear() -
            (
                today.getMonth() < birth.getMonth() ||
                (today.getMonth() === birth.getMonth() &&
                 today.getDate() < birth.getDate())
                ? 1
                : 0
            );

        if (age < 13) {
            errors.dateOfBirth = "You must be at least 13 years old.";
            isValid = false;
        }
    }
}

return isValid;
}

onMounted(async () => {
  await accountStore.loadAccount();
});

const handleFillInProfile = async () => {
    if (!validateForm()) return;
    console.log("Handling...");
    console.log(accountStore.email)
    loading.value = true;
    try {
        const response = await fetch(`${SERVER_BASE_URL}/api/user/`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                email: accountStore.email,
                nickname: formData.nickname,
                name: formData.name,
                surname: formData.surname,
                dateOfBirth: formData.dateOfBirth,
                avatar: formData.avatar
            })
        });

        const data = await response.json();
        console.log(data);

        if (data && data.error) {
            throw new Error(data.error)
        }

        if (response.ok && data.success) {
            router.push({ path: '/profile'});
            return;
        }

    } catch(err) {
        console.log(err);
    } finally {
        loading.value = false;
    }
}

</script>

<style scoped>
.form-inner{
    display: grid;
    grid-template-columns: 1fr 1fr;
}

.bottom-text {
  text-align: center;
  margin-top: 1.25rem;
  font-size: 0.875rem;
}

.image-preview{
  width: 10rem;
  height: 10rem;
  aspect-ratio: 1/1;
  border-radius: 14px;
  border: 1px solid var(--primary-orange);
  background: rgba(0,0,0,0.22);
  box-shadow: 0 14px 40px rgba(0,0,0,0.35);
  overflow: hidden;
  margin-bottom: 1rem;
}

.image-preview img{
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.upload-btn{
  border-radius: 100px;
  border: solid 1px var(--primary-orange);
  background: var(--auth-bg-overlay);
  color: #fff;
  outline: none;
  transform: 1s;
}

.upload-btn:hover{
    border-color: var(--primary-purple);
}

.pfp-container{
    align-items: center;
}

@media (max-width: 800px) {
  .form-container {
    padding: 1.5rem;
    max-width: 100%;
  }
  .form-inner{
    display: block;
  }
}
</style>