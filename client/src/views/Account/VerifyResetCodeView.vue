<template>
  <div class="verify-page">
    <div class="form-container">
      <h2 class="display-6">Verify Code</h2>
      <p class="subtitle">Please enter the 6-digit code sent to your email.</p>

      <form @submit.prevent="handleVerify">
        <div class="form-group">
          <label for="token">Verification Code</label>
          <input 
            v-model="token" 
            type="text" 
            id="token" 
            placeholder="Enter your code" 
            required 
            maxlength="10"
          />
          <span v-if="error" class="text-danger">{{ error }}</span>
        </div>

        <p v-if="successMessage" class="text-success">
          {{ successMessage }}
        </p>

        <button type="submit" class="gradient-btn" :disabled="loading">
          {{ loading ? 'Verifying...' : 'Verify' }}
        </button>
      </form>

      <p class="signup-text">
        Didn't receive a code? 
        <router-link to="/forgot-password">Resend</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const token = ref('');
const loading = ref(false);
const successMessage = ref('');
const error = ref(null);

const handleVerify = async () => {
  loading.value = true;
  error.value = null;
  successMessage.value = '';

  try {
    console.log('Weryfikacja kodu:', token.value);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    successMessage.value = "Code verified successfully!";
  
    setTimeout(() => {
      router.push('/reset-password');
    }, 1000);

  } catch (err) {
    error.value = "Invalid or expired code. Please try again.";
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.verify-page {
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

input[type="text"] {
  width: 100%;
  padding: 13px 14px;
  border-radius: 999px;
  border: none;
  background: rgba(12, 1, 1, 0.562);
  color: #fff;
  font-size: 18px; 
  letter-spacing: 2px;
  text-align: center;
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