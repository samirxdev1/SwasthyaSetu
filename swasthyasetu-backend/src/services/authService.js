import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import supabase from '../config/supabaseClient.js';
import config from '../config/env.js';
import { ROLES } from '../constants/roles.js';

// In-memory fallback store for local testing when Supabase credentials are placeholders
const memoryUsers = [];
const memoryDoctors = [];
const memoryLaboratories = [];
const memoryPatients = [];
const memoryChronicConditions = [];

// Seed default demo accounts for instant local/demo login
const initializeSeedData = async () => {
  if (memoryUsers.length === 0) {
    const defaultPasswordHash = await bcrypt.hash('password123', 10);

    const docUserId = 'demo-doc-user-001';
    const labUserId = 'demo-lab-user-001';

    memoryUsers.push(
      {
        id: docUserId,
        email: 'doctor@swasthyasetu.org',
        phone: '9876543210',
        password_hash: defaultPasswordHash,
        role: ROLES.DOCTOR,
        created_at: new Date().toISOString()
      },
      {
        id: labUserId,
        email: 'lab@swasthyasetu.org',
        phone: '9876543211',
        password_hash: defaultPasswordHash,
        role: ROLES.LABORATORY,
        created_at: new Date().toISOString()
      }
    );

    memoryDoctors.push({
      id: 'demo-doc-prof-001',
      user_id: docUserId,
      full_name: 'Dr. Ananya Sharma',
      registration_number: 'DOC-8841-IN',
      specialization: 'Cardiology',
      clinic_hospital_name: 'SwasthyaSetu Central OPD'
    });

    memoryLaboratories.push({
      id: 'demo-lab-prof-001',
      user_id: labUserId,
      lab_name: 'Apex Diagnostic Pathology',
      registration_number: 'LAB-3021-NABL',
      license_number: 'NABL-REG-2026',
      address: 'Central Diagnostic Node'
    });
  }
};
initializeSeedData().catch(err => console.warn('Seed initialization error:', err));

const isPlaceholderConfig = () => {
  return !config.SUPABASE_URL || config.SUPABASE_URL.includes('placeholder');
};

export const generateToken = (payload) => {
  return jwt.sign(payload, config.JWT_SECRET, { expiresIn: '7d' });
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.JWT_SECRET);
  } catch (err) {
    const error = new Error('Invalid or expired token');
    error.statusCode = 401;
    throw error;
  }
};

export const registerUser = async (userData) => {
  const { email, phone, password, role, ...profileFields } = userData;

  if (!email && !phone) {
    const error = new Error('Email or phone is required');
    error.statusCode = 400;
    throw error;
  }

  if (!password) {
    const error = new Error('Password is required');
    error.statusCode = 400;
    throw error;
  }

  const validRoles = Object.values(ROLES);
  if (!role || !validRoles.includes(role)) {
    const error = new Error(`Invalid role. Allowed roles are: ${validRoles.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }

  const password_hash = await bcrypt.hash(password, 10);
  const userId = randomUUID();
  const createdAt = new Date().toISOString();

  const newUserRecord = {
    id: userId,
    email: email || null,
    phone: phone || null,
    password_hash,
    role,
    created_at: createdAt
  };

  // Build schema-compliant profile objects
  let profileData = { user_id: userId, created_at: createdAt };
  let tableName = '';

  if (role === ROLES.DOCTOR) {
    tableName = 'doctors';
    profileData = {
      ...profileData,
      full_name: profileFields.full_name,
      specialization: profileFields.specialization || null,
      registration_number: profileFields.registration_number,
      clinic_hospital_name: profileFields.clinic_hospital_name || profileFields.hospital_name || null,
      years_of_experience: profileFields.years_of_experience || profileFields.experience_years || null
    };
  } else if (role === ROLES.LABORATORY) {
    tableName = 'laboratories';
    profileData = {
      ...profileData,
      lab_name: profileFields.lab_name,
      registration_number: profileFields.registration_number || profileFields.license_number,
      address: profileFields.address || null,
      services_offered: profileFields.services_offered || []
    };
  } else if (role === ROLES.PATIENT) {
    tableName = 'patients';
    profileData = {
      ...profileData,
      health_id: profileFields.health_id || `SS-${Date.now()}`,
      full_name: profileFields.full_name,
      date_of_birth: profileFields.date_of_birth || '1990-01-01',
      gender: profileFields.gender || 'Other',
      blood_group: profileFields.blood_group || null,
      address: profileFields.address || null,
      emergency_contact: profileFields.emergency_contact || null
    };
  }

  let createdUser = null;
  let createdProfile = null;

  if (!isPlaceholderConfig() && supabase) {
    try {
      // 1. Insert into users table
      const { data: userDb, error: userError } = await supabase
        .from('users')
        .insert([newUserRecord])
        .select('id, email, phone, role, created_at')
        .single();

      if (userError) {
        if (userError.code === '23505') { // Unique constraint violation
          const err = new Error('User with this email or phone already exists');
          err.statusCode = 409;
          throw err;
        }
        throw new Error(userError.message);
      }

      createdUser = userDb;

      // 2. Insert into matching profile table
      if (tableName) {
        const { data: profileDb, error: profileError } = await supabase
          .from(tableName)
          .insert([profileData])
          .select()
          .single();

        if (profileError) throw new Error(profileError.message);
        createdProfile = profileDb;

        // Insert chronic conditions if provided for patient
        if (role === ROLES.PATIENT && profileFields.chronic_conditions) {
          const condToInsert = profileFields.chronic_conditions.map(c => ({
            id: randomUUID(),
            patient_id: createdProfile.id,
            condition_name: c.condition_name,
            diagnosed_date: c.diagnosed_date || null,
            status: c.status || 'Active',
            notes: c.notes || null
          }));
          await supabase.from('chronic_conditions').insert(condToInsert);
          createdProfile.chronic_conditions = condToInsert;
        }
      }
    } catch (dbErr) {
      if (dbErr.statusCode) throw dbErr;
      console.warn('Supabase DB operation failed, falling back to memory store:', dbErr.message);
      createdUser = null;
    }
  }

  // Memory store fallback if Supabase unavailable/placeholder
  if (!createdUser) {
    const existing = memoryUsers.find(u => (email && u.email === email) || (phone && u.phone === phone));
    if (existing) {
      const err = new Error('User with this email or phone already exists');
      err.statusCode = 409;
      throw err;
    }

    memoryUsers.push(newUserRecord);
    const { password_hash: _, ...safeUser } = newUserRecord;
    createdUser = safeUser;

    const memoryProfile = { id: randomUUID(), ...profileData };
    if (role === ROLES.DOCTOR) memoryDoctors.push(memoryProfile);
    else if (role === ROLES.LABORATORY) memoryLaboratories.push(memoryProfile);
    else if (role === ROLES.PATIENT) {
      memoryPatients.push(memoryProfile);
      if (profileFields.chronic_conditions) {
        const conds = profileFields.chronic_conditions.map(c => ({
          id: randomUUID(),
          patient_id: memoryProfile.id,
          condition_name: c.condition_name,
          diagnosed_date: c.diagnosed_date || null,
          status: c.status || 'Active',
          notes: c.notes || null
        }));
        memoryChronicConditions.push(...conds);
        memoryProfile.chronic_conditions = conds;
      }
    }

    createdProfile = memoryProfile;
  }

  const token = generateToken({ id: createdUser.id, role: createdUser.role });

  return {
    user: createdUser,
    profile: createdProfile,
    token
  };
};

export const loginUser = async (rawIdentifier, password) => {
  if (!rawIdentifier || !password) {
    const error = new Error('Identifier (email, phone, or code) and password are required');
    error.statusCode = 400;
    throw error;
  }

  const cleanIdentifier = rawIdentifier.trim();
  const lowerIdentifier = cleanIdentifier.toLowerCase();

  let userRecord = null;
  let profile = null;

  if (!isPlaceholderConfig() && supabase) {
    try {
      // 1. Try finding user by email or phone
      const { data: users, error: userError } = await supabase
        .from('users')
        .select('*')
        .or(`email.ilike.${cleanIdentifier},phone.eq.${cleanIdentifier}`);

      if (!userError && users && users.length > 0) {
        userRecord = users[0];
      }

      // 2. If not found by email/phone, check laboratories table by registration_number or license_number
      if (!userRecord) {
        const { data: labs } = await supabase
          .from('laboratories')
          .select('user_id')
          .or(`registration_number.ilike.${cleanIdentifier},license_number.ilike.${cleanIdentifier},lab_name.ilike.${cleanIdentifier}`);

        if (labs && labs.length > 0) {
          const { data: linkedUsers } = await supabase
            .from('users')
            .select('*')
            .eq('id', labs[0].user_id);
          if (linkedUsers && linkedUsers.length > 0) {
            userRecord = linkedUsers[0];
          }
        }
      }

      // 3. If not found, check doctors table by registration_number
      if (!userRecord) {
        const { data: docs } = await supabase
          .from('doctors')
          .select('user_id')
          .eq('registration_number', cleanIdentifier);

        if (docs && docs.length > 0) {
          const { data: linkedUsers } = await supabase
            .from('users')
            .select('*')
            .eq('id', docs[0].user_id);
          if (linkedUsers && linkedUsers.length > 0) {
            userRecord = linkedUsers[0];
          }
        }
      }
    } catch (dbErr) {
      console.warn('Supabase DB query failed, falling back to memory store:', dbErr.message);
    }
  }

  // Memory fallback matching by email, phone, NABL code, registration number, or lab name
  if (!userRecord) {
    userRecord = memoryUsers.find(u => 
      (u.email && u.email.toLowerCase() === lowerIdentifier) || 
      (u.phone && u.phone === cleanIdentifier)
    );
  }

  if (!userRecord) {
    const memLab = memoryLaboratories.find(l => 
      (l.registration_number && l.registration_number.toLowerCase() === lowerIdentifier) ||
      (l.license_number && l.license_number.toLowerCase() === lowerIdentifier) ||
      (l.lab_name && l.lab_name.toLowerCase() === lowerIdentifier)
    );
    if (memLab) {
      userRecord = memoryUsers.find(u => u.id === memLab.user_id);
    }
  }

  if (!userRecord) {
    const memDoc = memoryDoctors.find(d => 
      d.registration_number && d.registration_number.toLowerCase() === lowerIdentifier
    );
    if (memDoc) {
      userRecord = memoryUsers.find(u => u.id === memDoc.user_id);
    }
  }

  if (!userRecord) {
    const error = new Error('Invalid email/phone/code or password');
    error.statusCode = 401;
    throw error;
  }

  const isPasswordValid = await bcrypt.compare(password, userRecord.password_hash);
  if (!isPasswordValid) {
    const error = new Error('Invalid email/phone/code or password');
    error.statusCode = 401;
    throw error;
  }

  // Fetch linked profile
  if (!isPlaceholderConfig() && supabase) {
    try {
      let tableName = '';
      if (userRecord.role === ROLES.DOCTOR) tableName = 'doctors';
      else if (userRecord.role === ROLES.LABORATORY) tableName = 'laboratories';
      else if (userRecord.role === ROLES.PATIENT) tableName = 'patients';

      if (tableName) {
        const { data: profileDb } = await supabase
          .from(tableName)
          .select('*')
          .eq('user_id', userRecord.id)
          .single();
        profile = profileDb;
      }
    } catch (err) {
      console.warn('Profile fetch failed from Supabase:', err.message);
    }
  }

  if (!profile) {
    if (userRecord.role === ROLES.DOCTOR) {
      profile = memoryDoctors.find(p => p.user_id === userRecord.id);
    } else if (userRecord.role === ROLES.LABORATORY) {
      profile = memoryLaboratories.find(p => p.user_id === userRecord.id);
    } else if (userRecord.role === ROLES.PATIENT) {
      profile = memoryPatients.find(p => p.user_id === userRecord.id);
    }
  }

  const { password_hash: _, ...safeUser } = userRecord;
  const token = generateToken({ id: safeUser.id, role: safeUser.role });

  return {
    user: safeUser,
    role: safeUser.role,
    profile,
    token
  };
};

export const getUserProfile = async (userId) => {
  let userRecord = null;
  let profile = null;

  if (!isPlaceholderConfig() && supabase) {
    try {
      const { data: userDb } = await supabase
        .from('users')
        .select('id, email, phone, role, created_at')
        .eq('id', userId)
        .single();
      userRecord = userDb;
    } catch (dbErr) {
      console.warn('Supabase DB error:', dbErr.message);
    }
  }

  if (!userRecord) {
    const memUser = memoryUsers.find(u => u.id === userId);
    if (memUser) {
      const { password_hash: _, ...safeUser } = memUser;
      userRecord = safeUser;
    }
  }

  if (!userRecord) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  if (!isPlaceholderConfig() && supabase) {
    try {
      let tableName = '';
      if (userRecord.role === ROLES.DOCTOR) tableName = 'doctors';
      else if (userRecord.role === ROLES.LABORATORY) tableName = 'laboratories';
      else if (userRecord.role === ROLES.PATIENT) tableName = 'patients';

      if (tableName) {
        const { data: profileDb } = await supabase
          .from(tableName)
          .select('*')
          .eq('user_id', userRecord.id)
          .single();
        profile = profileDb;
      }
    } catch (err) {
      console.warn('Profile fetch failed from Supabase:', err.message);
    }
  }

  if (!profile) {
    if (userRecord.role === ROLES.DOCTOR) {
      profile = memoryDoctors.find(p => p.user_id === userRecord.id);
    } else if (userRecord.role === ROLES.LABORATORY) {
      profile = memoryLaboratories.find(p => p.user_id === userRecord.id);
    } else if (userRecord.role === ROLES.PATIENT) {
      profile = memoryPatients.find(p => p.user_id === userRecord.id);
    }
  }

  return {
    user: userRecord,
    profile
  };
};

export const updateUserProfile = async (userId, updateData) => {
  const current = await getUserProfile(userId);
  const { user: userRecord, profile: currentProfile } = current;

  const role = userRecord.role;
  let tableName = '';
  let memoryStore = null;

  if (role === ROLES.DOCTOR) {
    tableName = 'doctors';
    memoryStore = memoryDoctors;
  } else if (role === ROLES.LABORATORY) {
    tableName = 'laboratories';
    memoryStore = memoryLaboratories;
  } else if (role === ROLES.PATIENT) {
    tableName = 'patients';
    memoryStore = memoryPatients;
  }

  // Filter allowable update fields
  const allowedProfileFields = {
    full_name: updateData.full_name,
    specialization: updateData.specialization,
    registration_number: updateData.registration_number,
    clinic_hospital_name: updateData.clinic_hospital_name || updateData.hospital_name,
    years_of_experience: updateData.years_of_experience || updateData.experience_years,
    lab_name: updateData.lab_name,
    address: updateData.address,
    gender: updateData.gender,
    blood_group: updateData.blood_group,
  };

  // Remove undefined properties
  Object.keys(allowedProfileFields).forEach(
    key => allowedProfileFields[key] === undefined && delete allowedProfileFields[key]
  );

  let updatedProfile = currentProfile ? { ...currentProfile, ...allowedProfileFields } : { user_id: userId, ...allowedProfileFields };

  if (!isPlaceholderConfig() && supabase && tableName) {
    try {
      const { data: dbUpdated } = await supabase
        .from(tableName)
        .update(allowedProfileFields)
        .eq('user_id', userId)
        .select()
        .single();
      if (dbUpdated) {
        updatedProfile = dbUpdated;
      }
    } catch (err) {
      console.warn('Supabase profile update warning:', err.message);
    }
  }

  // Also sync in-memory store if used
  if (memoryStore) {
    const memIndex = memoryStore.findIndex(p => p.user_id === userId);
    if (memIndex !== -1) {
      memoryStore[memIndex] = { ...memoryStore[memIndex], ...allowedProfileFields };
      updatedProfile = memoryStore[memIndex];
    } else {
      memoryStore.push(updatedProfile);
    }
  }

  // Optional user record update (phone)
  if (updateData.phone && userRecord.phone !== updateData.phone) {
    userRecord.phone = updateData.phone;
    if (memoryUsers) {
      const uIdx = memoryUsers.findIndex(u => u.id === userId);
      if (uIdx !== -1) memoryUsers[uIdx].phone = updateData.phone;
    }
  }

  return {
    user: userRecord,
    profile: updatedProfile
  };
};

export default {
  generateToken,
  verifyToken,
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  memoryUsers,
  memoryDoctors,
  memoryLaboratories,
  memoryPatients,
  memoryChronicConditions
};

