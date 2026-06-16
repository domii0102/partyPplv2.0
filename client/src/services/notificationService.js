import { SERVER_BASE_URL } from '../config/env';

export async function fetchNotifications(onlyUnread = false) {
    const url = new URL(`${SERVER_BASE_URL}/api/notifications`);
    if (onlyUnread) url.searchParams.set('onlyUnread', 'true');

    const res = await fetch(url, { method: 'GET', credentials: 'include' });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || 'Failed to load notifications');
    return data.data;
}

export async function markNotificationRead(notificationId) {
    const res = await fetch(`${SERVER_BASE_URL}/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        credentials: 'include'
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || 'Failed to mark as read');
    return true;
}

export async function deleteNotification(notificationId) {
    const res = await fetch(`${SERVER_BASE_URL}/api/notifications/${notificationId}`, {
        method: 'DELETE',
        credentials: 'include'
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || 'Failed to delete notification');
    return true;
}