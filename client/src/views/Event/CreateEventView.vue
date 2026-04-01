<template>
    <div class="event-create-page">
        <div class="container event-container">
            <div class="event-card">
                <div class="event-card-body">

                    <div class="d-flex justify-content-between align-items-start gap-3">
                        <div>
                            <h3 class="event-title">Create event</h3>
                            <div class="event-subtitle">Provide the basic details for your event.</div>
                        </div>

                        <RouterLink to="/event/list" class="btn-event btn-event-ghost">← Back</RouterLink>
                    </div>

                    <hr class="event-divider" />

                    <form id="eventForm" @submit.prevent="handleCreateEvent" novalidate>
                        <input v-model="formData.status" type="hidden" name="eventStatus" value="ACTIVE"/>
                        <div class="row g-3">
                            <div class="col-md-8">
                                <label class="event-label">Event name *</label>
                                <input v-model="formData.eventName" name="eventName" class="event-input" maxlength="64" required placeholder="Event name*"/>
                                <span v-if="errors.eventName" class="error-text">{{ errors.eventName }}</span>
                            </div>

                            <div class="col-md-4">
                                <label class="event-label">Visibility</label>
                                <div class="event-radio mt-2">
                                    <input v-model="formData.isPublic" id="private" type="radio" name="isPublic" value="false" checked>
                                    <label for="private">Private</label> <!--Upewnic sie ze tak dziala boolean bo nwm-->
                                    <input v-model="formData.isPublic" id="public" type="radio" name="isPublic" value="true">
                                    <label for="public">Public</label>
                                </div>
                            </div>
                        </div>
                        <div class="mt-3">
                            <label class="event-label">About *</label>
                            <textarea v-model="formData.description" name="description" class="event-textarea" maxlength="512" required
                                    placeholder="Describe the event: what, where, rules, what to bring..."></textarea>
                            <span v-if="errors.description" class="error-text">{{ errors.description }}</span>
                        </div>

                        <div class="row g-3 mt-1">
                            <div class="col-md-6">
                                <label class="event-label">Start date *</label>
                                <input v-model="formData.eventDate" type="date" name="eventDate" class="event-input" required />
                                <span v-if="errors.eventDate" class="error-text">{{ errors.eventDate }}</span>
                            </div>

                            <div class="col-md-6">
                                <label class="event-label">Start time *</label>
                                <input v-model="formData.eventTime" type="time" name="eventTime" class="event-input" required />
                                <span v-if="errors.eventTime" class="error-text">{{ errors.eventTime }}</span>
                            </div>
                        </div>

                        <div class="row g-3 mt-1">
                            <div class="col-md-6">
                                <label class="event-label">End date</label>
                                <input v-model="formData.endDate" type="date" name="endDate" class="event-input" />
                                <span v-if="errors.endDate" class="error-text">{{ errors.endDate }}</span>
                            </div>

                            <div class="col-md-6">
                                <label class="event-label">End time</label>
                                <input v-model="formData.endTime" type="time" name="endTime" class="event-input" />
                                <span v-if="errors.endTime" class="error-text">{{ errors.endTime }}</span>
                            </div>
                        </div>

                        <div class="row g-3 mt-1">
                            <div class="col-md-6">
                                <label class="event-label">Age restriction</label>
                                <input v-model="formData.ageRestriction" type="number" name="ageRestriction" class="event-input" min="0" placeholder="e.g. 18" />
                            </div>
                            <div class="col-md-6">
                                <label class="event-label">Guests limit</label>
                                <input v-model="formData.guestsLimit" type="number" name="guestLimit" class="event-input" min="1" placeholder="e.g. 50" />
                            </div>
                        </div>

                        <div class="row g-3 mt-1">
                            <div class="col-md-6">
                                <label class="event-label">Location name</label>
                                <input v-model="formData.locationName" name="locationName" class="event-input" maxlength="80" placeholder="Event's location" />
                            </div>

                            <div class="col-md-6">
                                <label class="event-label">Address</label>
                                <input v-model="formData.eventAddress" name="locationAddress" class="event-input" maxlength="128" placeholder="Street, city (optional)" />
                            </div>
                        </div>

                        <div class="row g-3 mt-1">
                            <div class="col-md-6">
                                <label class="event-label">Hashtags</label>
                                <input v-model="formData.hashtags" name="hashtags" class="event-input" maxlength="200" placeholder="e.g. #birthday #party #friends" />
                            </div>

                            <div class="col-md-6">
                                <!--Jak ogarniemy spotify to ewentualnie sie zmieni to bo 
                                nwm jeszcze jak ma dzialac integracja ze spotify-->
                                <label class="event-label">Playlist link</label>
                                <input name="playlistUrl" class="event-input" maxlength="256" placeholder="(TBA)" disabled />
                            </div>
                        </div>

                        <div class="mt-3">
                            <label class="event-label">Cover image *</label>
                            <button type="button" @click="uploadPhoto" class="btn-event btn-event-ghost">Upload Image</button>
                            <input type="file" ref="fileInput" @change="handleFileChange" style="display: none;" />
                            <span v-if="errors.image" class="error-text">{{ errors.image }}</span>
                        </div>

                        <div class="event-preview-wrap mt-4">
                            <div class="event-preview">
                                <img v-if="photoPreview" :src="photoPreview" alt="Cover preview" />
                                <img v-else :src="defaultImage" alt="Cover preview" />
                            </div>

                            <div class="event-info">
                                <strong>Header preview</strong><br />
                                The selected image will be used as the event cover.
                            </div>
                        </div>

                        <hr class="event-divider" />

                        <div class="event-actions">
                            <button type="submit" class="btn-event btn-event-accent">
                                {{ loading ? 'Adding event...' : 'Add event'}}
                            </button>
                            <a href="/Event/List" class="btn-event btn-event-ghost">
                                Cancel
                            </a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import defaultImage from '../../assets/user-form-bg.jpg';
import { SERVER_BASE_URL } from '../../config/env.js';

  // walidacja formularza

  const router = useRouter();
  const loading = ref(false);
  const successMessage = ref('')

  const formData = reactive({
    status: '',
    eventName: '',
    description: '',
    isPublic: false,
    eventDate: '',
    eventTime: '',
    endDate: '', //do dodania do bazki
    endTime: '', //do dodania do bazki
    ageRestriction: '',
    guestsLimit: '', //do dodania do bazki
    locationName: '', //do dodania do bazki
    eventAddress: '', //do dodania do bazki
    hashtags: [''],
    image: ''
  });

  const errors = reactive({
    eventName: '',
    description: '',
    eventDate: '',
    eventTime: '',
    endDate: '', //do dodania do bazki
    endTime: '', //do dodania do bazki
    ageRestriction: '',
    guestsLimit: '', //do dodania do bazki
    locationName: '', //do dodania do bazki
    eventAddress: '', //do dodania do bazki
    hashtags: '',
    image: ''
  });

  const validateForm = () => {
    let isValid = true;
    Object.keys(errors).forEach(key => errors[key] = '');
    const today = new Date();
    if (!formData.eventName){
      errors.eventName = "Event name is required"
    }

    if (!formData.description){
      errors.description = "Description is required"
    }

    if (!formData.eventDate) {
      errors.eventDate = "Event date is required";
      isValid = false;
    } else {
      const eventDate = new Date(formData.eventDate);
      eventDate.setHours(0,0,0,0);

      if (eventDate <= today) {
        errors.eventDate = "Event date must be in the future";
        isValid = false;
      } else if (formData.endDate && formData.endDate < formData.eventDate){
      errors.endDate = "End date needs to be after start date"
      } else if(formData.endTime && formData.endDate == formData.eventDate){
        if(formData.endTime < formData.eventTime){
          errors.endTime = "End time needs to be after start time"
        }
      }
      }

    if (!formData.eventTime){
      errors.eventTime = "Event time is required"
    }

    return isValid;
  };

  // logika wklejania zdjecia i podgladu

    const fileInput = ref(null);
    const photoPreview = ref(null);
    const photoError = ref('');

    function uploadPhoto() {
        fileInput.value?.click();
    }

    function handleFileChange(event){
        const file = event.target.files[0];
        if (!file) return;

        // Walidacja typu pliku
        if (!file.type.startsWith('image/')) {
            errors.image = 'Please upload a valid image file';
            formData.image = null;
            if (photoPreview.value) {
                URL.revokeObjectURL(photoPreview.value);
                photoPreview.value = null;
            }
            return;
        }

        // Walidacja rozmiaru (max 5MB)
        const maxSizeMB = 5;
        if (file.size / 1024 / 1024 > maxSizeMB) {
            errors.image = `Image must be smaller than ${maxSizeMB}MB`;
            formData.image = null;
            if (photoPreview.value) {
                URL.revokeObjectURL(photoPreview.value);
                photoPreview.value = null;
            }
            return;
        }

        if (photoPreview.value) {
        URL.revokeObjectURL(photoPreview.value);
        }
        formData.image = file;
        photoPreview.value = URL.createObjectURL(file);
        photoError.value = '';
    }


const handleCreateEvent = async () => {
  if (!validateForm) return;
  loading.value = true;
  console.log(formData);

  const [hours, minutes] = formData.eventTime.split(':').map(Number);
  const eventDateTime = new Date(formData.eventDate);
  eventDateTime.setHours(hours, minutes, 0, 0);

  const [endHours, endMinutes] = formData.endTime.split(':').map(Number);
  const endDateTime = new Date(formData.endDate);
  endDateTime.setHours(endHours, endMinutes, 0, 0);

  const eventDateTimeIso = eventDateTime.toISOString();
  const endDateTimeIso = endDateTime.toISOString();

    const fetchData = new FormData();
    fetchData.append('image', formData.image);
    fetchData.append('eventName', formData.eventName);
    fetchData.append('description', formData.description);
    fetchData.append('isPublic', formData.isPublic);
    fetchData.append('eventDateTime', eventDateTimeIso);
    fetchData.append('endDateTime', endDateTimeIso);
    fetchData.append('guestLimit', formData.guestsLimit);
    fetchData.append('ageRestriction', formData.ageRestriction);
    fetchData.append('locationName', formData.locationName);
    fetchData.append('locationAddress', formData.eventAddress);
    fetchData.append('hashtags', JSON.stringify(formData.hashtags));


  try {
    const response = await fetch(`${SERVER_BASE_URL}/api/event/`, {
      method: 'POST',
      credentials: 'include',
      body: fetchData
    });

    const data = await response.json();
    console.log(data);

    if (data && data.error) {
      throw new Error(data.error)
    }

    if (response.ok && data.success) {
      router.push({ path: '/event/dashboard'});
    }

  } catch(err) {
    console.log(err);
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.event-container{
    text-align: start;
    max-width: 900px;
}

.event-create-page{
    background: linear-gradient(180deg, var(--bg-main), var(--accent-purple), transparent 1000%);
    padding-top: 2rem;
    padding-bottom:3rem;
}

.event-card{
  background: linear-gradient(180deg, rgba(19, 12, 35, 0.65), rgba(10, 7, 20, 0.72));
  border: 1px solid var(--border);
  border-radius: 18px;
  box-shadow: var(--shadow);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.event-card .event-card-body{
  padding: 2rem;
}

.event-card::before{
  content:"";
  position:absolute;
  inset:0;
  border-radius:18px;
  pointer-events:none;
  background: radial-gradient(600px 220px at 30% 0%, rgba(181,107,255,0.16), transparent 60%);
  opacity: .8;
}

.event-card{ position:relative; }

.event-title{
    font-size: 2rem;
    font-weight: 700;
    color: var(--text-main);
}

.event-subtitle{
  color: var(--text-muted);
  font-size: 0.9rem;
}
.event-divider{
  border: none;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(181,107,255,0.5), transparent);
  margin: 1.5rem 0 1.3rem;
}

.event-label{
  color: rgba(255,255,255,0.82);
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
  width: 100%;
}

.event-input,
.event-textarea,
.event-select{
  width: 100%;
  background: rgba(8, 6, 16, 0.55);
  border: 1px solid rgba(187,120,255,0.18);
  border-radius: 12px;
  color: var(--text);
  padding: 11px 12px;
  outline: none;
  transition: border-color .18s ease, box-shadow .18s ease, transform .12s ease;
}

.event-textarea{ min-height: 120px; resize: vertical; }

.event-input::placeholder,
.event-textarea::placeholder{
  color: rgba(255,255,255,0.35);
}

.event-input:focus,
.event-textarea:focus,
.event-select:focus{
  border-color: rgba(181,107,255,0.55);
  box-shadow: 0 0 0 4px rgba(181,107,255,0.12);
}

.event-help{
  color: rgba(255,255,255,0.45);
  font-size: 12px;
  margin-top: 6px;
}

/* checkbox */
.event-radio{
  display:flex;
  align-items:center;
  gap:10px;
  user-select:none;
}
.event-radio input[type="radio"]{
  width: 18px;
  height: 18px;
  border-radius: 5px;
  accent-color: var(--accent);
}
.event-radio label{
  color: var(--text-muted);
}


.event-preview-wrap{
  display:flex;
  gap:16px;
  align-items:flex-start;
}

.event-preview{
  width: 230px;
  border-radius: 14px;
  border: 1px solid rgba(187,120,255,0.22);
  background: rgba(0,0,0,0.22);
  box-shadow: 0 14px 40px rgba(0,0,0,0.35);
  overflow:hidden;
}

.event-preview img{
  width: 100%;
  display:block;
}

.event-info{
  flex:1;
  border-radius: 14px;
  border: 1px solid rgba(187,120,255,0.14);
  background: rgba(9, 7, 16, 0.35);
  padding: 14px 14px;
  color: rgba(255,255,255,0.72);
}

.event-actions{
  display:flex;
  gap:10px;
  flex-wrap: wrap;
}

.btn-event{
  border-radius: 12px;
  padding: 10px 14px;
  font-weight: 600;
  border: 1px solid rgba(181,107,255,0.22);
  background: rgba(10, 8, 18, 0.35);
  color: rgba(255,255,255,0.9);
  transition: transform .12s ease, box-shadow .16s ease, border-color .16s ease;
  text-decoration: none;
  display:inline-flex;
  align-items:center;
  gap:8px;
}

.btn-event:hover{
  transform: translateY(-1px);
  border-color: rgba(181,107,255,0.42);
  box-shadow: 0 14px 40px rgba(0,0,0,0.35);
  color: rgba(255,255,255,0.95);
}

.btn-event-primary{
  background: linear-gradient(135deg, rgba(181,107,255,0.95), rgba(122,75,255,0.9));
  border: none;
  color: #120a22;
}
.btn-event-primary:hover{
  box-shadow: 0 18px 50px rgba(122,75,255,0.28);
  color:#120a22;
}

.btn-event-ghost{
  background: rgba(10, 8, 18, 0.25);
}

.event-error{
  color: rgba(255, 77, 109, 0.95);
  font-size: 12px;
  margin-top: 6px;
  display:none;
}

.was-validated .event-input:invalid,
.was-validated .event-textarea:invalid{
  border-color: rgba(255, 77, 109, 0.55);
  box-shadow: 0 0 0 4px rgba(255, 77, 109, 0.12);
}
.was-validated .event-input:invalid + .event-error,
.was-validated .event-textarea:invalid + .event-error{
  display:block;
}


@media (max-width: 900px){
  .event-preview-wrap{ flex-direction: column; }
  .event-preview{ width: 100%; max-width: 420px; }
}

.btn-event-accent{
  background: linear-gradient(135deg, #b56bff 0%, #ff9a3c 100%);
  color: #120a22;
  border: none;
  font-weight: 700;
}

.btn-event-accent:hover{
  box-shadow: none;
  transform: none;
  color: #120a22;
}

</style>