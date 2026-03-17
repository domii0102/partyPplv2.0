import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAuthStore = defineStore('auth', () => {
    const EMAIL = ref('');

    const setEMAIL = (email) => {
        EMAIL.value = email;
    };

    const clearEMAIL = () => {
        EMAIL.value = '';
    };

    return {
        EMAIL,
        setEMAIL,
        clearEMAIL
    };
});