import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import supabase from '../config/supabaseClient.js';
import config from '../config/env.js';
import { ROLES } from '../constants/roles.js';

// In-memory fallback store for local testing when Supabase credentials are placeholders
const memoryUsers = [
  {
    id: 'doc-demo-uuid-0001',
    email: 'dr.test@swasthyasetu.org',
    phone: '9876543210',
    password_hash: bcrypt.hashSync('Doctor@123', 10),
    role: ROLES.DOCTOR,
    created_at: new Date().toISOString()
  },
  {
    id: 'lab-demo-uuid-0001',
    email: 'lab.test@swasthyasetu.org',
    phone: '9876543211',
    password_hash: bcrypt.hashSync('Lab@12345', 10),
    role: ROLES.LABORATORY,
    created_at: new Date().toISOString()
  },
  {
    id: 'patient-demo-uuid-0001',
    email: 'testpatient@swasthyasetu.com',
    phone: '9876543212',
    password_hash: bcrypt.hashSync('Test@1234', 10),
    role: ROLES.PATIENT,
    created_at: new Date().toISOString()
  }
];

const memoryDoctors = [
  {
    id: 'doc-prof-0001',
    user_id: 'doc-demo-uuid-0001',
    full_name: 'Dr. Samir Sharma',
    registration_number: 'DOC-8841-IN',
    specialization: 'Cardiology',
    qualification: 'MBBS, MD (Cardiology)',
    hospital_affiliation: 'SwasthyaSetu Medical Center',
    phone_number: '9876543210',
    years_experience: 12,
    created_at: new Date().toISOString()
  }
];

const memoryLaboratories = [
  {
    id: 'lab-prof-0001',
    user_id: 'lab-demo-uuid-0001',
    lab_name: 'Metro Pathology & Diagnostic Center',
    registration_number: 'LAB-REG-TEST-001',
    license_number: 'NABL-9921',
    phone_number: '9876543211',
    address: 'New Delhi',
    created_at: new Date().toISOString()
  }
];

const memoryPatients = [
  {
    id: 'patient-prof-0001',
    user_id: 'patient-demo-uuid-0001',
    full_name: 'Rajesh V. Kumar',
    health_id: 'ABDM-1786952428247',
    gender: 'Male',
    date_of_birth: '1985-06-15',
    blood_group: 'O+',
    phone_number: '9876543212',
    created_at: new Date().toISOString()
  }
];

const memoryChronicConditions = [];

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

export const loginUser = async (identifier, password) => {
  if (!identifier || !password) {
    const error = new Error('Identifier (email or phone) and password are required');
    error.statusCode = 400;
    throw error;
  }

  let userRecord = null;
  let profile = null;

  if (!isPlaceholderConfig() && supabase) {
    try {
      const { data: users, error: userError } = await supabase
        .from('users')
        .select('*')
        .or(`email.eq.${identifier},phone.eq.${identifier}`);

      if (!userError && users && users.length > 0) {
        userRecord = users[0];
      }
    } catch (dbErr) {
      console.warn('Supabase DB query failed, falling back to memory store:', dbErr.message);
    }
  }

  if (!userRecord) {
    userRecord = memoryUsers.find(u => u.email === identifier || u.phone === identifier);
  }

  if (!userRecord) {
    const error = new Error('Invalid email/phone or password');
    error.statusCode = 401;
    throw error;
  }

  const isPasswordValid = await bcrypt.compare(password, userRecord.password_hash);
  if (!isPasswordValid) {
    const error = new Error('Invalid email/phone or password');
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

