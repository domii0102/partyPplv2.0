<template>
  <div class="register-page">
    <div class="form-container">
      <h2 class="display-6">Register</h2>

      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label for="email">Email</label>
          <input 
            v-model="formData.email" 
            type="email" 
            id="email" 
            placeholder="Enter your Email" 
            required 
          />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input 
            v-model="formData.password" 
            type="password" 
            id="password" 
            placeholder="Enter your password" 
            required 
          />
        </div>

        <div class="form-group">
          <label for="confirmPassword">Confirm Password</label>
          <input 
            v-model="formData.confirmPassword" 
            type="password" 
            id="confirmPassword" 
            placeholder="Confirm your password" 
            required 
          />
        </div>

        

        <div class="options-row">
          <label class="checkbox-label">
            <input 
              v-model="formData.agreeToTerms" 
              type="checkbox" 
              required 
            /> 
            By signing up you agree to our<a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" target="_blank"> Terms and conditions</a> and <a href="https://www.youtube.com/watch?v=4HSBCfCxy7U" target="_blank">Privacy Policy</a>.
          </label>
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

const loading = ref(false);

const formData = reactive({
  email: '',
  password: '',
  repeatPassword: '',
  firstName: '',
  lastName: '',
  agreeToTerms: false
});

const handleRegister = async () => {
  if (formData.password !== formData.repeatPassword) {
    alert("Hasła nie są identyczne!");
    return;
  }

  loading.value = true;
  
  try {
    console.log('Wysyłanie danych rejestracji:', formData);
    await new Promise(resolve => setTimeout(resolve, 1500)); 
    alert('Rejestracja zakończona sukcesem!');
  } catch (error) {
    alert('Wystąpił błąd podczas rejestracji');
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
  padding: 0px;
  
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

.name-form {
  display: flex;
  gap: 15px;
}

.name-field {
  flex: 1;
}

label {
  font-size: 14px;
  margin-bottom: 6px;
  display: block;
}

input[type="text"],
input[type="email"],
input[type="password"] {
  width: 100%;
  padding: 12px 14px;
  border-radius: 999px;
  border: none;
  background: rgba(12, 1, 1, 0.562);
  color: #fff;
  outline: none;
}

.options-row {
  margin-bottom: 25px;
  font-size: 13px;
  line-height: 1.4;
  width: 100%;
  display: flex;
  justify-content: flex-start;
}
.checkbox-label {
  align-items: flex-start; 
  cursor: pointer;
  text-align: left;
  width: 100%;
}

.checkbox-label input {
  margin-top: 3px; 
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