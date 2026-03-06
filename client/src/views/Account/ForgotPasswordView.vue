<template>
  <div class="forgot-page">
    <div class="form-container">
      <h2 class="display-6">Forgot Password</h2>
      <p class="subtitle">Enter your email to receive a verification code.</p>

      <form @submit.prevent="handleForgotPassword">
        <div class="form-group">
          <label for="email">Email Address</label>
          <input 
            v-model="email" 
            type="email" 
            id="email" 
            placeholder="Enter your registered email" 
            required 
          />
          <span v-if="error" class="text-danger">{{ error }}</span>
        </div>

        <p v-if="successMessage" class="text-success">
          {{ successMessage }}
        </p>

        <button type="submit" class="gradient-btn" :disabled="loading">
          {{ loading ? 'Sending...' : 'Send Verification Code' }}
        </button>
      </form>

      <p class="signup-text">
        Remembered it? 
        <router-link to="/login">Back to Sign in</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const email = ref('');
const loading = ref(false);
const successMessage = ref('');
const error = ref(null);

const handleForgotPassword = async () => {
  loading.value = true;
  error.value = null;
  successMessage.value = '';

  try {
    console.log('Wysyłanie kodu na adres:', email.value);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    successMessage.value = "If an account exists for this email, you will receive a code shortly.";
    email.value = '';
  } catch (err) {
    error.value = "Failed to send code. Please try again later.";
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.forgot-page {
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
  margin-bottom: 10px;
  font-size: 32px;
}

.subtitle {
  text-align: center;
  font-size: 14px;
  color: #ccc;
  margin-bottom: 25px;
}

.form-group {
  margin-bottom: 22px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

label {
  font-size: 14px;
  margin-bottom: 8px;
  display: block;
  text-align: left;
}

input[type="email"] {
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

.text-success {
  color: #4BB543;
  font-size: 13px;
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