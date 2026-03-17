<template>
  <div class="verify-email-page">
    <div class="form-container">
      <div class="icon-box">
        <i class="bi bi-envelope-check"></i>
      </div>
      
      <h2 class="display-6">Verify your email</h2>
      <p class="subtitle">
        We've sent a 6-digit verification code to your email.
        Please enter it below to activate your account.
      </p>

      <form @submit.prevent="handleVerify" novalidate>
        <div class="form-group">
          <label for="code">Verification Code</label>
          <input 
            v-model="verificationCode" 
            type="text" 
            id="code" 
            placeholder="Enter 6-digit code" 
            maxlength="6"
          />
          <span v-if="error" class="text-danger">{{ error }}</span>
        </div>

        <p v-if="successMessage" class="text-success">
          {{ successMessage }}
        </p>

        <button type="submit" class="gradient-btn" :disabled="loading">
          {{ loading ? 'Verifying...' : 'Verify Account' }}
        </button>
      </form>

      <div class="resend-section">
        <p>Didn't receive the code?</p>
        <button @click="handleResend" class="resend-link" :disabled="resendLoading">
          {{ resendLoading ? 'Sending...' : 'Resend Code' }}
        </button>
      </div>
      
      <p class="back-text">
        <router-link to="/login">Back to Sign in</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from './stores/authStore';

const router = useRouter();
const verificationCode = ref('');
const loading = ref(false);
const resendLoading = ref(false);
const successMessage = ref('');
const error = ref(null);
const authStore = useAuthStore();

const SERVER_BASE_URL = process.env.SERVER_BASE_URL

const validate = () => {
  error.value = null;
  if (!verificationCode.value) {
    error.value = "Verification code is required.";
    return false;
  }
  if (verificationCode.value.length < 6) {
    error.value = "Code must be exactly 6 digits.";
    return false;
  }
  return true;
};

const handleVerify = async () => {
  if (!validate()) return;

  loading.value = true;
  error.value = null;
  successMessage.value = '';

  try {
    const res = await fetch(`${SERVER_BASE_URL}/api/account/verifyEmail`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({
        email: authStore.EMAIL,
        token: verificationCode.value
      })
    });

    const data = await res.json();

    if(!res.ok) {
      throw new Error(data.error || "Verification failed");
    }

    successMessage.value = "Account activated successfully!";

    setTimeout(() => {
      router.push('/login');
    }, 1500);
    
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

const handleResend = async () => {
  resendLoading.value = true;
  error.value = null;
  successMessage.value = '';

  try {
    await new Promise(resolve => setTimeout(resolve, 1000));
    successMessage.value = "A new code has been sent to your email.";
  } catch (err) {
    error.value = "Could not resend code. Try again later.";
  } finally {
    resendLoading.value = false;
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

input[type="text"] {
  width: 100%;
  padding: 0.875rem;
  border-radius: 62.4375rem;
  border: none;
  background: rgba(12, 1, 1, 0.562);
  color: #fff;
  font-size: 1.25rem;
  letter-spacing: 0.25rem;
  text-align: center;
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

.resend-section {
  margin-top: 1.5rem;
  font-size: 0.875rem;
  color: #ccc;
}

.resend-link {
  background: none;
  border: none;
  color: #d8aaff;
  cursor: pointer;
  font-weight: 500;
  text-decoration: underline;
  padding: 0.3125rem;
}

.resend-link:disabled {
  color: #666;
  cursor: not-allowed;
  text-decoration: none;
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