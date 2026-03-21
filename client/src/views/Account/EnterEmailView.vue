<template>
  <div class="verify-email-page">
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
          <span v-if="error" class="text-danger">{{ error }}</span>
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
</template>

<script setup>
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
.verify-email-page {
  min-height: 100vh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: url('../../assets/user-form-bg.jpg') no-repeat center center;
  background-size: cover;
  background-attachment: fixed;
  padding: 1.25rem;
}

.form-container {
  width: 100%;
  max-width: 32.5rem;
  padding: 2.8125rem 3.4375rem;
  background: rgba(0, 0, 0, 0.55);
  border: 0.1875rem solid var(--primary-orange, #ff8c00);
  border-radius: 1.5625rem;
  backdrop-filter: blur(1rem);
  box-shadow: 0 0 2.5rem rgba(0, 0, 0, 0.45);
  color: #fff;
  text-align: center;
}

.icon-box {
  font-size: 3rem;
  color: var(--primary-orange, #ff8c00);
  margin-bottom: 0.75rem;
}

h2 {
  margin-bottom: 0.625rem;
  font-size: 2rem;
}

.subtitle {
  font-size: 0.9375rem;
  color: #efefef;
  line-height: 1.5;
  margin-bottom: 1.875rem;
}

.form-group {
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

label {
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

input[type="email"] {
  width: 100%;
  padding: 0.875rem;
  border-radius: 62.4375rem;
  border: none;
  background: rgba(12, 1, 1, 0.562);
  color: #fff;
  font-size: 1rem;
  text-align: left;
  outline: none;
}

.gradient-btn {
  width: 100%;
  padding: 0.875rem;
  border: none;
  border-radius: 62.4375rem;
  background: linear-gradient(45deg, var(--primary-orange), var(--primary-purple), var(--primary-orange));
  background-size: 200% auto;
  color: white;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: 0.4s;
}

.gradient-btn:hover:not(:disabled) {
  background-position: 100% center;
  filter: brightness(1.2);
}

.text-success {
  color: #4BB543;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.text-danger {
  color: #ff4d4d;
  font-size: 0.75rem;
  margin-top: 0.375rem;
  margin-left: 1rem;
  display: block;
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