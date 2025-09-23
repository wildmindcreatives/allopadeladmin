import { supabase } from './supabase'

export interface StatisticsData {
  totalUsers: number
  totalClubs: number
  totalMatches: number
  totalMembers: number
  totalParticipants: number
  matchesThisMonth: number
  matchesThisWeek: number
  newUsersThisMonth: number
  matchesByStatus: Array<{ status: string; count: number }>
  matchesByClub: Array<{ club_name: string; count: number }>
  usersByMonth: Array<{ month: string; count: number }>
  matchesByMonth: Array<{ month: string; count: number }>
  averageParticipantsPerMatch: number
  topClubsByMembers: Array<{ club_name: string; member_count: number }>
}

export async function getStatistics(): Promise<StatisticsData> {
  try {
    // Get basic counts
    const basicCounts = await getBasicCounts()

    // Get time-based statistics
    const timeBased = await getTimeBasedStatistics()

    // Get match statistics
    const matchStats = await getMatchStatistics()

    // Get club statistics
    const clubStats = await getClubStatistics()

    // Get trend data
    const trends = await getTrendData()

    return {
      ...basicCounts,
      ...timeBased,
      ...matchStats,
      ...clubStats,
      ...trends
    }
  } catch (error) {
    console.error('Error fetching statistics:', error)
    throw new Error('Failed to fetch statistics')
  }
}

async function getBasicCounts() {
  const { data, error } = await supabase.rpc('get_basic_counts')

  if (error) {
    // Fallback to individual queries if RPC doesn't exist
    const [users, clubs, matches, members, participants] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact' }),
      supabase.from('clubs').select('id', { count: 'exact' }),
      supabase.from('matches').select('id', { count: 'exact' }),
      supabase.from('club_members').select('id', { count: 'exact' }),
      supabase.from('match_participants').select('id', { count: 'exact' })
    ])

    return {
      totalUsers: users.count || 0,
      totalClubs: clubs.count || 0,
      totalMatches: matches.count || 0,
      totalMembers: members.count || 0,
      totalParticipants: participants.count || 0
    }
  }

  return data
}

async function getTimeBasedStatistics() {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))

  const [matchesThisMonth, matchesThisWeek, newUsersThisMonth] = await Promise.all([
    supabase
      .from('matches')
      .select('id', { count: 'exact' })
      .gte('created_at', startOfMonth.toISOString()),

    supabase
      .from('matches')
      .select('id', { count: 'exact' })
      .gte('created_at', startOfWeek.toISOString()),

    supabase
      .from('profiles')
      .select('id', { count: 'exact' })
      .gte('created_at', startOfMonth.toISOString())
  ])

  return {
    matchesThisMonth: matchesThisMonth.count || 0,
    matchesThisWeek: matchesThisWeek.count || 0,
    newUsersThisMonth: newUsersThisMonth.count || 0
  }
}

async function getMatchStatistics() {
  // Get matches by status
  const { data: statusData } = await supabase
    .from('matches')
    .select('status')

  const matchesByStatus = statusData?.reduce((acc: any[], match) => {
    const existing = acc.find(item => item.status === match.status)
    if (existing) {
      existing.count++
    } else {
      acc.push({ status: match.status, count: 1 })
    }
    return acc
  }, []) || []

  // Calculate average participants per match
  const { data: participantData } = await supabase
    .from('matches')
    .select('current_participants')

  const totalParticipants = participantData?.reduce((sum, match) => sum + (match.current_participants || 0), 0) || 0
  const averageParticipantsPerMatch = participantData?.length ? Math.round((totalParticipants / participantData.length) * 10) / 10 : 0

  return {
    matchesByStatus,
    averageParticipantsPerMatch
  }
}

async function getClubStatistics() {
  // Get matches by club
  const { data: matchClubData } = await supabase
    .from('matches')
    .select(`
      club_id,
      clubs!inner(name)
    `)
    .not('club_id', 'is', null)

  const matchesByClub = matchClubData?.reduce((acc: any[], match) => {
    const clubName = (match.clubs as any)?.name || 'Unknown'
    const existing = acc.find(item => item.club_name === clubName)
    if (existing) {
      existing.count++
    } else {
      acc.push({ club_name: clubName, count: 1 })
    }
    return acc
  }, []) || []

  // Get top clubs by member count
  const { data: clubMemberData } = await supabase
    .from('clubs')
    .select(`
      name,
      member_count
    `)
    .order('member_count', { ascending: false })
    .limit(5)

  const topClubsByMembers = clubMemberData?.map(club => ({
    club_name: club.name,
    member_count: club.member_count || 0
  })) || []

  return {
    matchesByClub,
    topClubsByMembers
  }
}

async function getTrendData() {
  // Get users by month (last 6 months)
  const { data: userData } = await supabase
    .from('profiles')
    .select('created_at')
    .gte('created_at', new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString())

  // Get matches by month (last 6 months)
  const { data: matchData } = await supabase
    .from('matches')
    .select('created_at')
    .gte('created_at', new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString())

  const usersByMonth = processMonthlyData(userData || [])
  const matchesByMonth = processMonthlyData(matchData || [])

  return {
    usersByMonth,
    matchesByMonth
  }
}

function processMonthlyData(data: Array<{ created_at: string }>) {
  const monthlyData: { [key: string]: number } = {}

  data.forEach(item => {
    const date = new Date(item.created_at)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1
  })

  // Generate last 6 months
  const result = []
  const now = new Date()

  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const monthName = date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })

    result.push({
      month: monthName,
      count: monthlyData[monthKey] || 0
    })
  }

  return result
}