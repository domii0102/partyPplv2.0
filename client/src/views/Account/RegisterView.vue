<template>
  <div class="background">
    <div class="main-page">
      <div class="form-container">
        <div class="header">
          <div class="spacer"></div>
          <h2 class="display-6">Register</h2>
          <router-link class="go-back" to="/">← Go back</router-link>
        </div>

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
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAccountStore } from '../../stores/account.js';
import {service} from "../../services/requestService.js";

const router = useRouter();
const loading = ref(false);
const successMessage = ref('');
const accountStore = useAccountStore();

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

    const response = await service.post('/api/account/register', {
      email: formData.email,
      password: formData.password
    })

    console.log(response);

    if (response && response.error) {
      throw new Error(response.error);
    }

    accountStore.setEmail(formData.email);
    
    if (response.success) {
      
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
.form-container {
  width: 100%;
  max-width: 500px;
}

.signup-text {
  text-align: center;
  margin-top: 1.25rem;
  font-size: 0.875rem;
}

.terms-container {
  margin-bottom: 1rem;
}

a,
.router-link {
  color: #d8aaff;
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