<template>
<div class="forgot-page">
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
      <span v-if="error" class="text-danger">{{ error }}</span>
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
.forgot-page {
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
}

h2 {
text-align: center;
margin-bottom: 0.625rem;
font-size: 2rem;
}

.subtitle {
text-align: center;
font-size: 0.875rem;
color: #ccc;
margin-bottom: 1.5625rem;
}

.form-group {
margin-bottom: 1.375rem;
display: flex;
flex-direction: column;
align-items: flex-start;
}

label {
font-size: 0.875rem;
margin-bottom: 0.5rem;
display: block;
}

input[type="email"] {
width: 100%;
padding: 0.8125rem 0.875rem;
border-radius: 62.4375rem;
border: none;
background: rgba(12, 1, 1, 0.562);
color: #fff;
font-size: 0.9375rem;
outline: none;
box-sizing: border-box;
}

.gradient-btn {
width: 100%;
padding: 0.75rem;
border: none;
border-radius: 62.4375rem;
background: linear-gradient(45deg, var(--primary-orange), var(--primary-purple), var(--primary-orange));
background-size: 200% auto;
color: white;
font-size: 1rem;
font-weight: bold;
cursor: pointer;
transition: background-position 0.4s ease-in-out, filter 0.3s;
margin-top: 0.625rem;
}

.gradient-btn:hover:not(:disabled) {
background-position: 100% center;
filter: brightness(1.2);
}

.text-success {
color: #4BB543;
font-size: 0.8125rem;
margin-bottom: 0.9375rem;
text-align: center;
}

.text-danger {
color: #ff4d4d;
font-size: 0.75rem;
margin-top: 0.3125rem;
margin-left: 0.9375rem;
display: block;
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