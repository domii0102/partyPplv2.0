import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { fetchNotifications, markNotificationRead, deleteNotification } from '../services/notificationService.js';

export const useNotificationStore = defineStore('notifications', () => {
  const notifications = ref([]);
  const loading = ref(false);

  const unreadCount = computed(() => 
    notifications.value.filter(n => !n.isRead).length
  );

  async function loadNotifications() {
    loading.value = true;
    try {
      const data = await fetchNotifications();
      notifications.value = data.map(n => ({ ...n, id: n.notificationId }));
    } catch (err) {
      console.error(err);
    } finally {
      loading.value = false;
    }
  }

  function addNotification(notification) {
    notifications.value.unshift({ ...notification, id: notification.notificationId });
  }

  function markAsRead(id) {
    const notif = notifications.value.find(n => n.id === id);
    if (notif) notif.isRead = true;
    markNotificationRead(id).catch(err => console.error(err));
  }

  async function removeNotification(id) {
    const snapshot = notifications.value;
    notifications.value = notifications.value.filter(n => n.id !== id);
    try {
      await deleteNotification(id);
    } catch (err) {
      console.error(err);
      notifications.value = snapshot;
    }
  }

  return { notifications, loading, unreadCount, loadNotifications, addNotification, markAsRead, removeNotification };
});