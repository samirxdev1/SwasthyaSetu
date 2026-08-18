import { randomUUID } from 'crypto';
import supabase from '../config/supabaseClient.js';
import config from '../config/env.js';

const memoryAuditLogs = [];

const isPlaceholderConfig = () => {
  return !config.SUPABASE_URL || config.SUPABASE_URL.includes('placeholder');
};

/**
 * Logs an action to the audit_logs table.
 * Wrapped safely in try/catch so failure never disrupts the main request execution.
 * 
 * @param {string} userId - ID of the performing user
 * @param {string} action - Action description (e.g. 'viewed_patient_record', 'uploaded_report')
 * @param {string} [tableAffected] - Table name affected
 * @param {string} [recordId] - ID of the record affected
 */
export const logAudit = async (userId, action, tableAffected = null, recordId = null) => {
  try {
    if (!userId || !action) {
      console.warn('logAudit called with missing userId or action:', { userId, action });
      return null;
    }

    const now = new Date().toISOString();
    const auditRecord = {
      id: randomUUID(),
      user_id: userId,
      action,
      table_affected: tableAffected,
      record_id: recordId,
      timestamp: now
    };

    if (!isPlaceholderConfig() && supabase) {
      const { data, error } = await supabase
        .from('audit_logs')
        .insert([auditRecord])
        .select()
        .single();

      if (!error && data) return data;
      if (error) {
        console.warn('Supabase logAudit failed, saving to memory fallback:', error.message);
      }
    }

    memoryAuditLogs.push(auditRecord);
    return auditRecord;
  } catch (err) {
    // Non-blocking log inspection catch
    console.error('Non-blocking error in logAudit helper:', err.message);
    return null;
  }
};

export default {
  logAudit,
  memoryAuditLogs
};
