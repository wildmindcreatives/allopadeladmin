import { supabase } from './supabase'
import type { Club, CreateClubData, UpdateClubData } from '@/types/club'

export async function getClubs(): Promise<Club[]> {
  const { data, error } = await supabase
    .from('clubs')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Erreur lors de la récupération des clubs: ${error.message}`)
  }

  return data || []
}

export async function createClub(clubData: CreateClubData): Promise<Club> {
  const { data, error } = await supabase
    .from('clubs')
    .insert([clubData])
    .select()
    .single()

  if (error) {
    throw new Error(`Erreur lors de la création du club: ${error.message}`)
  }

  return data
}

export async function updateClub(clubData: UpdateClubData): Promise<Club> {
  const { id, ...updateData } = clubData

  // Ensure location is not empty or null since it's required in the database
  const cleanedUpdateData = {
    ...updateData,
    ...(updateData.location !== undefined && {
      location: updateData.location || 'Non spécifié'
    })
  }

  const { data, error } = await supabase
    .from('clubs')
    .update(cleanedUpdateData)
    .eq('id', id)
    .select()
    .maybeSingle()

  if (error) {
    throw new Error(`Erreur lors de la mise à jour du club: ${error.message}`)
  }

  if (!data) {
    throw new Error(`Club avec l'ID ${id} non trouvé`)
  }

  return data
}

export async function deleteClub(id: string): Promise<void> {
  const { error } = await supabase
    .from('clubs')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(`Erreur lors de la suppression du club: ${error.message}`)
  }
}