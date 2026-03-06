<template>
  <div class="reset-page">
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
          <span v-if="errors.password" class="text-danger">{{ errors.password }}</span>
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
.reset-page {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: url('../../assets/user-form-bg.jpg') no-repeat center center;
  background-size: cover;
  overflow: hidden;
}

.form-container {
  width: 520px;
  padding: 45px 55px;
  background: rgba(0, 0, 0, 0.55);
  border: 3px solid var(--primary-orange, #ff8c00);
  border-radius: 25px;
  backdrop-filter: blur(16px);
  box-shadow: 0 0 40px rgba(0, 0, 0, 0.45);
  color: #fff;
  z-index: 1;
}

h2 {
  text-align: center;
  margin-bottom: 25px;
  font-size: 32px;
}

.form-group {
  margin-bottom: 22px;
  display: flex;
  flex-direction: column;
  align-items: flex-start; /* Label zawsze po lewej */
}

label {
  font-size: 14px;
  margin-bottom: 8px;
  display: block;
  text-align: left;
  width: 100%;
}

input[type="password"] {
  width: 100%;
  padding: 13px 14px;
  border-radius: 999px;
  border: none;
  background: rgba(12, 1, 1, 0.562);
  color: #fff;
  font-size: 15px;
  outline: none;
  box-sizing: border-box;
}

.gradient-btn {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 999px;
  background: linear-gradient(45deg, var(--primary-orange), var(--primary-purple), var(--primary-orange));
  background-size: 200% auto; 
  background-position: 0% center;
  color: white;
  cursor: pointer;
  transition: background-position 0.4s ease-in-out, filter 0.3s;
  margin-top: 10px;
}

.gradient-btn:hover:not(:disabled) {
  background-position: 100% center;
  filter: brightness(1.2);
}

.gradient-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.text-success {
  color: #4BB543;
  font-size: 14px;
  margin-bottom: 15px;
  text-align: center;
}

.text-danger {
  color: #ff4d4d;
  font-size: 12px;
  margin-top: 5px;
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