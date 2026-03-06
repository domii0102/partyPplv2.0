<template>
  <div class="login-page">
    <div class="form-container">
      <h2 class="display-6">Sign in</h2>

      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="email">Email</label>
          <input 
            v-model="loginData.email" 
            type="email" 
            id="email" 
            placeholder="Enter your Email" 
            required 
          />
          <span v-if="errors.email" class="text-danger">{{ errors.email }}</span>
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input 
            v-model="loginData.password" 
            type="password" 
            id="password" 
            placeholder="Enter your password" 
            required 
          />
          <span v-if="errors.password" class="text-danger">{{ errors.password }}</span>
        </div>

        <div class="options-row">
          <label class="remember">
            <input v-model="loginData.rememberMe" type="checkbox" /> 
            Keep me logged in
          </label>
          <router-link to="/forgot-password">Forgot your password?</router-link>
        </div>

        <button type="submit" class="gradient-btn" :disabled="loading">
          {{ loading ? 'Logging in...' : 'Log in' }}
        </button>
      </form>

      <p class="signup-text">
        You don't have account? 
        <router-link to="/register">Sign up!</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';

const loginData = reactive({
  email: '',
  password: '',
  rememberMe: false
});

const loading = ref(false);
const errors = reactive({
  email: null,
  password: null
});

const handleLogin = async () => {
  loading.value = true;
  errors.email = null;
  errors.password = null;

  try {
    console.log('Dane do wysyłki:', loginData);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    alert('Zalogowano pomyślnie!');
  } catch (err) {
    errors.email = "Błędne dane logowania.";
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-page {
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
  margin: 0;
  padding: 0;
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
  margin-bottom: 25px;
  font-size: 32px;
}

.form-group {
  margin-bottom: 22px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

label {
  font-size: 14px;
  margin-bottom: 6px;
  display: block;
  text-align: left;
}

input[type="email"],
input[type="password"] {
  width: 100%;
  padding: 13px 14px;
  border-radius: 999px;
  border: none;
  background: rgba(12, 1, 1, 0.562);
  color: #fff;
  font-size: 15px;
  outline: none;
}

input::placeholder {
  color: #616161;
}

.options-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  margin-bottom: 20px;
}

.remember {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.gradient-btn {
  width: 100%;
  padding: 12px 0;
  border: none;
  cursor: pointer;
  font-size: 16px;
  border-radius: 999px;
  background: linear-gradient(45deg, var(--primary-orange), var(--primary-purple), var(--primary-orange));
  color: white;
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
  margin-top: 20px;
  font-size: 14px;
}

a, .router-link {
  color: #d8aaff;
}

a:hover, .router-link:hover {
  text-decoration: underline;
}

.text-danger {
  color: #ff4d4d;
  font-size: 12px;
  margin-top: 5px;
  display: block;
}
</style>