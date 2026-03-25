<template>
  <div class="background">
    <div class="main-page">
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
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAccountStore } from '../../stores/account';
import {service} from '../../services/requestService';

const router = useRouter();
const verificationCode = ref('');
const loading = ref(false);
const resendLoading = ref(false);
const successMessage = ref('');
const error = ref(null);
const accountStore = useAccountStore();

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

    const res = await service.post('/api/account/verify-email', {
        email: accountStore.getEmail,
        token: verificationCode.value
      });

    const data = await res;

    if(res && res.success === false) {
      throw new Error(data.error || "Verification failed");
    }

    successMessage.value = "Account activated successfully!";
    
  
    router.push('/create');

  } catch (err) {
    error.value = "Invalid or expired code.";
  } finally {
    loading.value = false;
  }
};

const handleResend = async () => {
  resendLoading.value = true;
  error.value = null;
  successMessage.value = '';

  try {

   const res = await service.post('/api/account/resend-verification-code', {
        email: accountStore.email
      });

    if(res.success === false) {
      throw new Error(res.error || "Problems occured while sending new verification code.");
    }

    successMessage.value = "A new code has been sent to your email.";
  } catch (err) {
    error.value = "Could not resend code. Try again later.";
  } finally {
    resendLoading.value = false;
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