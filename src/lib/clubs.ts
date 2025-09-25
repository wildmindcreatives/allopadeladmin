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
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Utilisateur non authentifié')
  }

  // Create the club
  const { data: clubResult, error: clubError } = await supabase
    .from('clubs')
    .insert([clubData])
    .select()
    .single()

  if (clubError) {
    throw new Error(`Erreur lors de la création du club: ${clubError.message}`)
  }

  // Add the creator as owner in club_members table
  const { error: memberError } = await supabase
    .from('club_members')
    .insert([{
      club_id: clubResult.id,
      user_id: user.id,
      role: 'owner',
      status: 'active'
    }])

  if (memberError) {
    console.error('Failed to add creator as club owner:', memberError)
    // Don't throw error here as the club was created successfully
    // We could also delete the club if this fails, depending on requirements
  }

  return clubResult
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
  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Utilisateur non authentifié')
  }

  // Use RPC function to delete club and all related data
  const { error: rpcError } = await supabase.rpc('delete_club_cascade', {
    club_id: id
  })

  if (rpcError) {
    // Fallback to manual deletion if RPC doesn't exist
    await deleteClubManual(id, user.id)
  }
}

async function deleteClubManual(clubId: string, userId: string): Promise<void> {
  // Step 1: Remove club references from profiles (set preferred_club_id to NULL)
  // We'll use an RPC function or handle it differently since RLS might block this
  const { error: profilesError } = await supabase.rpc('nullify_preferred_club', {
    target_club_id: clubId
  })

  // If RPC doesn't exist, try direct update (might fail due to RLS)
  if (profilesError) {
    console.warn('RPC nullify_preferred_club not available, trying direct update:', profilesError.message)
    const { error: directUpdateError } = await supabase
      .from('profiles')
      .update({ preferred_club_id: null })
      .eq('preferred_club_id', clubId)

    if (directUpdateError) {
      console.warn('Could not update all profiles, continuing with deletion:', directUpdateError.message)
      // Don't throw error here, the foreign key constraint will be handled by the database
    }
  }

  // Step 2: Delete from user_clubs table
  const { error: userClubsError } = await supabase
    .from('user_clubs')
    .delete()
    .eq('club_id', clubId)

  if (userClubsError) {
    throw new Error(`Erreur lors de la suppression des relations utilisateur-club: ${userClubsError.message}`)
  }

  // Step 3: Get all matches for this club
  const { data: matches, error: matchesSelectError } = await supabase
    .from('matches')
    .select('id')
    .eq('club_id', clubId)

  if (matchesSelectError) {
    throw new Error(`Erreur lors de la récupération des matchs: ${matchesSelectError.message}`)
  }

  // Step 4: Delete match participants for all matches of this club
  if (matches && matches.length > 0) {
    const matchIds = matches.map(match => match.id)
    const { error: participantsError } = await supabase
      .from('match_participants')
      .delete()
      .in('match_id', matchIds)

    if (participantsError) {
      throw new Error(`Erreur lors de la suppression des participants aux matchs: ${participantsError.message}`)
    }
  }

  // Step 5: Delete all matches for this club
  const { error: matchesError } = await supabase
    .from('matches')
    .delete()
    .eq('club_id', clubId)

  if (matchesError) {
    throw new Error(`Erreur lors de la suppression des matchs: ${matchesError.message}`)
  }

  // Step 6: Delete all club members
  const { error: clubMembersError } = await supabase
    .from('club_members')
    .delete()
    .eq('club_id', clubId)

  if (clubMembersError) {
    throw new Error(`Erreur lors de la suppression des membres du club: ${clubMembersError.message}`)
  }

  // Step 7: Finally, delete the club itself
  const { error: clubError } = await supabase
    .from('clubs')
    .delete()
    .eq('id', clubId)

  if (clubError) {
    throw new Error(`Erreur lors de la suppression du club: ${clubError.message}`)
  }
}