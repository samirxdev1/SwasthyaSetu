-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  role USER-DEFINED NOT NULL,
  email character varying UNIQUE,
  phone character varying UNIQUE,
  password_hash text NOT NULL,
  is_verified boolean DEFAULT false,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (id)
);
CREATE TABLE public.patients (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE,
  health_id character varying NOT NULL UNIQUE,
  full_name character varying NOT NULL,
  date_of_birth date NOT NULL,
  gender USER-DEFINED,
  blood_group character varying,
  address text,
  emergency_contact character varying,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT patients_pkey PRIMARY KEY (id),
  CONSTRAINT patients_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.doctors (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE,
  full_name character varying NOT NULL,
  specialization character varying,
  registration_number character varying NOT NULL UNIQUE,
  clinic_hospital_name character varying,
  years_of_experience integer,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT doctors_pkey PRIMARY KEY (id),
  CONSTRAINT doctors_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.laboratories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE,
  lab_name character varying NOT NULL,
  registration_number character varying NOT NULL UNIQUE,
  address text,
  services_offered ARRAY,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT laboratories_pkey PRIMARY KEY (id),
  CONSTRAINT laboratories_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.consultations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL,
  doctor_id uuid NOT NULL,
  consultation_date timestamp without time zone DEFAULT now(),
  symptoms text,
  doctor_notes text,
  probable_diagnosis character varying,
  confirmed_diagnosis character varying,
  status USER-DEFINED DEFAULT 'ongoing'::consultation_status,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT consultations_pkey PRIMARY KEY (id),
  CONSTRAINT consultations_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id),
  CONSTRAINT consultations_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.doctors(id)
);
CREATE TABLE public.prescriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  consultation_id uuid NOT NULL,
  medicine_name character varying NOT NULL,
  dosage character varying NOT NULL,
  frequency character varying,
  duration character varying,
  instructions text,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT prescriptions_pkey PRIMARY KEY (id),
  CONSTRAINT prescriptions_consultation_id_fkey FOREIGN KEY (consultation_id) REFERENCES public.consultations(id)
);
CREATE TABLE public.lab_orders (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  consultation_id uuid NOT NULL,
  patient_id uuid NOT NULL,
  doctor_id uuid NOT NULL,
  laboratory_id uuid,
  test_name character varying NOT NULL,
  status USER-DEFINED DEFAULT 'pending'::lab_order_status,
  ordered_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT lab_orders_pkey PRIMARY KEY (id),
  CONSTRAINT lab_orders_consultation_id_fkey FOREIGN KEY (consultation_id) REFERENCES public.consultations(id),
  CONSTRAINT lab_orders_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id),
  CONSTRAINT lab_orders_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.doctors(id),
  CONSTRAINT lab_orders_laboratory_id_fkey FOREIGN KEY (laboratory_id) REFERENCES public.laboratories(id)
);
CREATE TABLE public.lab_reports (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  lab_order_id uuid NOT NULL UNIQUE,
  report_file_url text NOT NULL,
  report_summary text,
  uploaded_at timestamp without time zone DEFAULT now(),
  CONSTRAINT lab_reports_pkey PRIMARY KEY (id),
  CONSTRAINT lab_reports_lab_order_id_fkey FOREIGN KEY (lab_order_id) REFERENCES public.lab_orders(id)
);
CREATE TABLE public.chronic_conditions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL,
  condition_name character varying NOT NULL,
  diagnosed_date date,
  status USER-DEFINED,
  notes text,
  CONSTRAINT chronic_conditions_pkey PRIMARY KEY (id),
  CONSTRAINT chronic_conditions_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id)
);
CREATE TABLE public.drug_interaction_flags (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  prescription_id uuid NOT NULL,
  conflicting_with character varying NOT NULL,
  severity USER-DEFINED,
  ai_explanation text NOT NULL,
  acknowledged_by_doctor boolean DEFAULT false,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT drug_interaction_flags_pkey PRIMARY KEY (id),
  CONSTRAINT drug_interaction_flags_prescription_id_fkey FOREIGN KEY (prescription_id) REFERENCES public.prescriptions(id)
);
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title character varying NOT NULL,
  message text NOT NULL,
  type USER-DEFINED,
  is_read boolean DEFAULT false,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.audit_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  action character varying NOT NULL,
  table_affected character varying,
  record_id uuid,
  timestamp timestamp without time zone DEFAULT now(),
  CONSTRAINT audit_logs_pkey PRIMARY KEY (id),
  CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);