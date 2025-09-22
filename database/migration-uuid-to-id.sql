-- Migration: Rename uuid column to id
-- Run this in your Supabase SQL Editor if you have existing data

ALTER TABLE public.clubs RENAME COLUMN uuid TO id;