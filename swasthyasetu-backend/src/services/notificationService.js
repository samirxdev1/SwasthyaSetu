import { randomUUID } from 'crypto';
import supabase from '../config/supabaseClient.js';
import config from '../config/env.js';

const memoryNotifications = [];

const isPlaceholderConfig = () => {
  return !config.SUPABASE_URL || config.SUPABASE_URL.includes('placeholder');
};

/**
 * Creates a new notification record.
 * @param {string} userId - ID of the target user
 * @param {string} title - Notification title
 * @param {string} message - Notification message body
 * @param {string} [type='general'] - Type ('lab_order', 'report_ready', 'drug_alert', 'general')
 */
export const createNotification = async (userId, title, message, type = 'general') => {
  if (!userId || !title || !message) {
    const error = new Error('userId, title, and message are required to create a notification');
    error.statusCode = 400;
    throw error;
  }

  const validTypes = ['lab_order', 'report_ready', 'drug_alert', 'general'];
  const effectiveType = validTypes.includes(type) ? type : 'general';
  const now = new Date().toISOString();

  const notificationRecord = {
    id: randomUUID(),
    user_id: userId,
    title,
    message,
    type: effectiveType,
    is_read: false,
    created_at: now
  };

  let createdNotification = null;

  if (!isPlaceholderConfig() && supabase) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert([notificationRecord])
        .select()
        .single();

      if (!error && data) createdNotification = data;
      if (error) {
        console.warn('Supabase createNotification failed, using memory store:', error.message);
      }
    } catch (dbErr) {
      console.warn('Supabase DB error creating notification:', dbErr.message);
    }
  }

  if (!createdNotification) {
    memoryNotifications.push(notificationRecord);
    createdNotification = notificationRecord;
  }

  return createdNotification;
};

/**
 * Gets all notifications for a specific user.
 * @param {string} userId - User ID
 */
export const getUserNotifications = async (userId) => {
  if (!userId) {
    const error = new Error('userId is required');
    error.statusCode = 400;
    throw error;
  }

  let notifications = [];

  if (!isPlaceholderConfig() && supabase) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data) notifications = data;
    } catch (dbErr) {
      console.warn('Supabase getUserNotifications failed, using memory store:', dbErr.message);
    }
  }

  if (notifications.length === 0) {
    notifications = memoryNotifications
      .filter(n => n.user_id === userId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  return notifications;
};

/**
 * Marks a notification as read for a given user.
 * @param {string} id - Notification ID
 * @param {string} userId - Authenticated user ID requesting the mark
 */
export const markNotificationAsRead = async (id, userId) => {
  if (!id || !userId) {
    const error = new Error('Notification ID and userId are required');
    error.statusCode = 400;
    throw error;
  }

  let notification = null;

  if (!isPlaceholderConfig() && supabase) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('id', id)
        .single();

      if (!error && data) notification = data;
    } catch (dbErr) {
      console.warn('Supabase fetch notification failed:', dbErr.message);
    }
  }

  if (!notification) {
    notification = memoryNotifications.find(n => n.id === id);
  }

  if (!notification) {
    const error = new Error(`Notification with ID '${id}' not found`);
    error.statusCode = 404;
    throw error;
  }

  // Authorization check: user can only mark their own notification as read
  if (notification.user_id !== userId) {
    const error = new Error('Forbidden. You are not authorized to access this notification.');
    error.statusCode = 403;
    throw error;
  }

  let updatedNotification = null;

  if (!isPlaceholderConfig() && supabase) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id)
        .select()
        .single();

      if (!error && data) updatedNotification = data;
    } catch (dbErr) {
      console.warn('Supabase markNotificationAsRead failed, updating in memory:', dbErr.message);
    }
  }

  if (!updatedNotification) {
    notification.is_read = true;
    updatedNotification = { ...notification };
  }

  return updatedNotification;
};

export default {
  createNotification,
  getUserNotifications,
  markNotificationAsRead,
  memoryNotifications
};
