<template>
  <div class="register-page">
    <div class="form-container">
      <h2 class="display-6">Register</h2>

      <form @submit.prevent="handleRegister" novalidate>
        <div class="form-group">
          <label for="email">Email</label>
          <input v-model="formData.email" type="email" id="email" placeholder="Enter your Email"
            :class="{ 'input-error': errors.email }" />
          <span v-if="errors.email" class="error-text">{{ errors.email }}</span>
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input v-model="formData.password" type="password" id="password" placeholder="Enter your password"
            :class="{ 'input-error': errors.password }" />
          <span v-if="errors.password" class="error-text">{{ errors.password }}</span>
        </div>

        <div class="form-group">
          <label for="confirmPassword">Confirm Password</label>
          <input v-model="formData.confirmPassword" type="password" id="confirmPassword"
            placeholder="Confirm your password" :class="{ 'input-error': errors.confirmPassword }" />
          <span v-if="errors.confirmPassword" class="error-text">{{ errors.confirmPassword }}</span>
        </div>

        <div class="options-row">
          <div class="terms-container">
            <label class="checkbox-label">
              <input v-model="formData.agreeToTerms" type="checkbox" />
              <span>
                By signing up you agree to our
                <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ&start_radio=1"
                  target="_blank">Terms</a>
                and
                <a href="https://www.youtube.com/watch?v=4HSBCfCxy7U&list=RD4HSBCfCxy7U&start_radio=1"
                  target="_blank">Privacy Policy</a>.
              </span>
            </label>
            <span v-if="errors.agreeToTerms" class="error-text terms-error">
              {{ errors.agreeToTerms }}
            </span>
          </div>
        </div>

        <button type="submit" class="gradient-btn" :disabled="loading">
          {{ loading ? 'Creating account...' : 'Register' }}
        </button>

      </form>

      <p class="signup-text">
        Already a user?
        <router-link to="/login">Sign in!</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { SERVER_BASE_URL } from '../../config/env.js';

const router = useRouter();
const loading = ref(false);
const successMessage = ref('');

const formData = reactive({
  email: '',
  password: '',
  confirmPassword: '',
  agreeToTerms: false
});

const errors = reactive({
  email: '',
  password: '',
  confirmPassword: '',
  agreeToTerms: ''
});

const validateForm = () => {
  let isValid = true;
  Object.keys(errors).forEach(key => errors[key] = '');
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!formData.email) {
    errors.email = "Email is required.";
    isValid = false;
  } else if (!emailRegex.test(formData.email)) {
    errors.email = "Please enter a valid email format.";
    isValid = false;
  }

  if (!formData.password) {
    errors.password = "Password is required.";
    isValid = false;
  } else if (formData.password.length < 6) {
    errors.password = "Password must be at least 6 characters long.";
    isValid = false;
  }

  if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
    isValid = false;
  }
  if (!formData.agreeToTerms) {
    errors.agreeToTerms = "You must agree to the terms and conditions.";
    isValid = false;
  }

  return isValid;
};

const handleRegister = async () => {
  if (!validateForm()) return;

  loading.value = true;
  try {
    const response = await fetch(`${SERVER_BASE_URL}/api/account/register`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify({
        email: formData.email,
        password: formData.password
      })
    });

    const data = await response.json();
    console.log(data);

    if (data && data.error) {
      throw new Error(data.error);
    }

    if (response.ok && data.success) {
      router.push({ path: '/verify-email', query: { email: formData.email } });
      return;
    }

  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};
</script>
<style scoped>
.register-page {
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
  padding: 0;
  overflow: hidden;
}

.form-container {
  width: 90%;
  max-width: 32.5rem;
  padding: 2.8125rem 3.4375rem;
  background: rgba(0, 0, 0, 0.55);
  border: 0.1875rem solid var(--primary-orange, #ff8c00);
  border-radius: 1.5625rem;
  backdrop-filter: blur(1rem);
  box-shadow: 0 0 2.5rem rgba(0, 0, 0, 0.45);
  color: #fff;
  z-index: 1;
}

h2 {
  text-align: center;
  margin-bottom: 1.5625rem;
  font-size: 2rem;
}

.form-group {
  margin-bottom: 1.375rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

label {
  font-size: 0.875rem;
  margin-bottom: 0.375rem;
  display: block;
}

a,
.router-link {
  color: #d8aaff;
}

input[type="email"],
input[type="password"] {
  width: 100%;
  padding: 0.75rem 0.875rem;
  border-radius: 62.4375rem;
  border: none;
  background: rgba(12, 1, 1, 0.562);
  color: #fff;
  outline: none;
}


.options-row {
  margin-bottom: 1.5625rem;
  font-size: 0.8125rem;
  line-height: 1.4;
  width: 100%;
  display: flex;
  justify-content: flex-start;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 0.625rem;
  cursor: pointer;
  text-align: left;
}

.checkbox-label input {
  margin-top: 0.1875rem;
  flex-shrink: 0;
}

.gradient-btn {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 999px;
  background: linear-gradient(45deg, var(--primary-orange), var(--primary-purple), var(--primary-orange));
  color: white;
  cursor: pointer;
  background-size: 200% 200%;
  transition: background-position 0.3s, filter 0.3s;
}

.gradient-btn:hover:not(:disabled) {
  background-position: 100% 100%;
  filter: brightness(1.1);
}


.gradient-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.signup-text {
  text-align: center;
  margin-top: 1.25rem;
  font-size: 0.875rem;
}

.error-text {
  color: #ff4d4d;
  font-size: 0.75rem;
  margin-top: 0.3125rem;
  margin-left: 0.9375rem;
  font-weight: 500;
  display: block;
}

.terms-error {
  margin-left: 1.625rem;
  margin-top: 0.3125rem;
}

.success-message,
.error-message {
  font-size: 0.875rem;
  text-align: center;
  margin-top: 0.9375rem;
}

@media (max-width: 480px) {
  .form-container {
    padding: 1.5rem;
    max-width: 100%;
  }
}
</style>