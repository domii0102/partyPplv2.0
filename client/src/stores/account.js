import { defineStore } from 'pinia';
import { SERVER_BASE_URL } from '../config/env.js';

export const useAccountStore = defineStore('account', {
    state: () => ({
        email: ''
    }),
    getters: { },
    actions: {
        setEmail (email) {
            this.email = email;
        },
        clearEmail (email) {
            this.email = '';
        }
    }
});