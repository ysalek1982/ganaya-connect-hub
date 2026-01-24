-- First migration: Add new enum values only
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'line_leader';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'agent';