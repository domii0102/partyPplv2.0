<template>
<div class="background">
<div class="main-page">
<div class="form-container">
<h2 class="display-6">Forgot Password</h2>
<p class="subtitle">Enter your email to get a link to reset your password.</p>

  <form @submit.prevent="handleForgotPassword" novalidate>
    <div class="form-group">
      <label for="email">Email Address</label>
      <input 
        v-model="email" 
        type="email" 
        id="email" 
        placeholder="Enter your registered email" 
      />
      <span v-if="error" class="error-text">{{ error }}</span>
    </div>

    <p v-if="successMessage" class="text-success">
      {{ successMessage }}
    </p>

    <button type="submit" class="gradient-btn" :disabled="loading">
      {{ loading ? 'Sending...' : 'Send Reset Link' }}
    </button>
  </form>

  <p class="signup-text">
    Remembered it? 
    <router-link to="/login">Back to Sign in</router-link>
  </p>
</div>
</div>
</div>
</template>

<script setup>
import { ref } from 'vue';

const email = ref('');
const loading = ref(false);
const successMessage = ref('');
const error = ref(null);

const validate = () => {
error.value = null;
const emailRegex = /^[^\s@]+@[^\s@]+.[^\s@]+$/;

if (!email.value) {
error.value = "Email is required.";
return false;
}
if (!emailRegex.test(email.value)) {
error.value = "Please enter a valid email address.";
return false;
}
return true;
};

const handleForgotPassword = async () => {
if (!validate()) return;

loading.value = true;
successMessage.value = '';

try {
console.log('Sending code to:', email.value);
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
.form-container {
  width: 100%;
  max-width: 500px;
}

.signup-text {
text-align: center;
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