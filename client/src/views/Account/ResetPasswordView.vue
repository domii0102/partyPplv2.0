<template>
  <div class="background">
    <div class="main-page">
      <div class="form-container">
        <h2 class="display-6">Reset Password</h2>

        <form @submit.prevent="handleReset">
          <div class="form-group">
            <label for="password">New Password</label>
            <input 
              v-model="formData.password" 
              type="password" 
              id="password" 
              placeholder="Enter new password" 
              required 
            />
            <span v-if="errors.password" class="error-text">{{ errors.password }}</span>
          </div>

          <div class="form-group">
            <label for="confirmPassword">Confirm New Password</label>
            <input 
              v-model="formData.confirmPassword" 
              type="password" 
              id="confirmPassword" 
              placeholder="Repeat new password" 
              required 
            />
          </div>

          <p v-if="successMessage" class="text-success">
            {{ successMessage }}
          </p>

          <button type="submit" class="gradient-btn" :disabled="loading">
            {{ loading ? 'Updating...' : 'Set New Password' }}
          </button>
        </form>

        <p class="signup-text">
          Remembered your password? 
          <router-link to="/login">Back to sign in</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';

const loading = ref(false);
const successMessage = ref('');
const errors = reactive({
  password: null
});

const formData = reactive({
  password: '',
  confirmPassword: ''
});

const handleReset = async () => {
  errors.password = null;
  successMessage.value = '';

  if (formData.password !== formData.confirmPassword) {
    errors.password = "Passwords do not match!";
    return;
  }

  loading.value = true;
  
  try {
    console.log('Resetowanie hasła dla danych:', formData);
    await new Promise(resolve => setTimeout(resolve, 1500)); 
    
    successMessage.value = "Your password has been set successfully!";
    formData.password = '';
    formData.confirmPassword = '';
  } catch (error) {
    errors.password = "Something went wrong. Please try again.";
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.form-container {
  width: 100%;
  max-width: 500px;
}

h2{
  margin-bottom: 2rem;
}

.signup-text {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
}

a {
  color:  #d8aaff;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
</style>