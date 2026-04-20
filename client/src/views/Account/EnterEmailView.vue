<template>
  <div class="background">
    <div class="main-page">
      <div class="form-container">
        <div class="icon-box">
          <i class="bi bi-envelope"></i>
        </div>
        
        <h2 class="display-6">Enter your email</h2>
        <p class="subtitle">
          Enter your email address and we will send you a 6-digit verification code.
        </p>

        <form @submit.prevent="handleSendCode" novalidate>
          <div class="form-group">
            <label for="email">Email Address</label>
            <input 
              v-model="email" 
              type="email" 
              id="email" 
              placeholder="Enter your email" 
            />
            <span v-if="error" class="error-text">{{ error }}</span>
          </div>

          <p v-if="successMessage" class="text-success">
            {{ successMessage }}
          </p>

          <button type="submit" class="gradient-btn" :disabled="loading">
            {{ loading ? 'Sending...' : 'Send Code' }}
          </button>
        </form>

        <p class="back-text">
          <router-link to="/register">Back to Register</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import './account.css'
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const email = ref('');
const loading = ref(false);
const successMessage = ref('');
const error = ref(null);

const validate = () => {
  error.value = null;

  if (!email.value) {
    error.value = 'Email is required.';
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.value)) {
    error.value = 'Enter a valid email address.';
    return false;
  }

  return true;
};

const handleSendCode = async () => {
  if (!validate()) return;

  loading.value = true;
  error.value = null;
  successMessage.value = '';

  try {
    // tutaj potem podłączysz backend
    await new Promise(resolve => setTimeout(resolve, 1500));

    successMessage.value = 'Verification code sent successfully!';

    setTimeout(() => {
      router.push('/verify-email');
    }, 1500);
  } catch (err) {
    error.value = 'Could not send verification code.';
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

.icon-box {
  font-size: 3rem;
  color: var(--primary-orange, #ff8c00);
  margin-bottom: 0.75rem;
}

.back-text {
  margin-top: 1.25rem;
  font-size: 0.875rem;
}

a {
  color: #d8aaff;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

@media (max-width: 480px) {
  .form-container {
    padding: 1.5rem;
  }
}
</style>