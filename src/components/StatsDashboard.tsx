import { useState, useEffect } from 'react'
import { getStatistics, type StatisticsData } from '@/lib/statistics'
import { Card } from '@/components/ui/card'
import { Users, MapPin, Calendar, Trophy, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'

interface StatCardProps {
  title: string
  value: number | string
  icon: React.ReactNode
  trend?: string
  color?: string
}

function StatCard({ title, value, icon, trend, color = 'blue' }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-500 text-blue-50',
    green: 'bg-green-500 text-green-50',
    purple: 'bg-purple-500 text-purple-50',
    orange: 'bg-orange-500 text-orange-50',
    pink: 'bg-pink-500 text-pink-50',
    indigo: 'bg-indigo-500 text-indigo-50'
  }

  return (
    <Card className="p-4 sm:p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">{trend}</p>
          )}
        </div>
        <div className={`p-3 rounded-full ${colorClasses[color as keyof typeof colorClasses]}`}>
          {icon}
        </div>
      </div>
    </Card>
  )
}

interface ChartProps {
  title: string
  data: Array<{ name?: string; month?: string; club_name?: string; status?: string; count?: number; member_count?: number }>
  type: 'bar' | 'pie' | 'line'
  color?: string
}

function SimpleChart({ title, data, type }: ChartProps) {
  const maxValue = Math.max(...data.map(d => d.count || d.member_count || 0))

  const getBarColor = (index: number) => {
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500', 'bg-indigo-500']
    return colors[index % colors.length]
  }

  const getLabel = (item: any) => {
    return item.name || item.month || item.club_name || item.status || 'N/A'
  }

  const getValue = (item: any) => {
    return item.count || item.member_count || 0
  }

  if (type === 'bar' || type === 'line') {
    return (
      <Card className="p-4 sm:p-6">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className="space-y-3">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="w-20 sm:w-24 text-xs sm:text-sm text-muted-foreground truncate">
                {getLabel(item)}
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-3 sm:h-4 relative overflow-hidden">
                <div
                  className={`h-full ${getBarColor(index)} transition-all duration-700 ease-out rounded-full`}
                  style={{
                    width: `${maxValue > 0 ? (getValue(item) / maxValue) * 100 : 0}%`
                  }}
                />
              </div>
              <div className="w-8 text-xs sm:text-sm font-medium text-gray-700">
                {getValue(item)}
              </div>
            </div>
          ))}
        </div>
        {data.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Aucune donnée disponible
          </div>
        )}
      </Card>
    )
  }

  return (
    <Card className="p-4 sm:p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="text-center py-8 text-muted-foreground">
        Graphique en développement
      </div>
    </Card>
  )
}

export function StatsDashboard() {
  const [stats, setStats] = useState<StatisticsData | null>(null)
  const [loading, setLoading] = useState(true)

  const loadStatistics = async () => {
    try {
      setLoading(true)
      const data = await getStatistics()
      setStats(data)
    } catch (error) {
      console.error('Error loading statistics:', error)
      toast.error('Erreur lors du chargement des statistiques')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStatistics()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <span className="text-muted-foreground">Chargement des statistiques...</span>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Impossible de charger les statistiques</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <StatCard
          title="Total des utilisateurs"
          value={stats.totalUsers}
          icon={<Users className="h-6 w-6" />}
          trend={`+${stats.newUsersThisMonth} ce mois`}
          color="blue"
        />
        <StatCard
          title="Total des clubs"
          value={stats.totalClubs}
          icon={<MapPin className="h-6 w-6" />}
          color="green"
        />
        <StatCard
          title="Total des matchs"
          value={stats.totalMatches}
          icon={<Calendar className="h-6 w-6" />}
          trend={`${stats.matchesThisWeek} cette semaine`}
          color="purple"
        />
        <StatCard
          title="Membres de clubs"
          value={stats.totalMembers}
          icon={<Trophy className="h-6 w-6" />}
          color="orange"
        />
        <StatCard
          title="Participants aux matchs"
          value={stats.totalParticipants}
          icon={<Users className="h-6 w-6" />}
          color="pink"
        />
        <StatCard
          title="Moy. participants/match"
          value={stats.averageParticipantsPerMatch}
          icon={<TrendingUp className="h-6 w-6" />}
          color="indigo"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SimpleChart
          title="Évolution des utilisateurs (6 derniers mois)"
          data={stats.usersByMonth}
          type="bar"
          color="blue"
        />
        <SimpleChart
          title="Évolution des matchs (6 derniers mois)"
          data={stats.matchesByMonth}
          type="bar"
          color="green"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SimpleChart
          title="Matchs par statut"
          data={stats.matchesByStatus}
          type="bar"
          color="purple"
        />
        <SimpleChart
          title="Top clubs par nombre de membres"
          data={stats.topClubsByMembers}
          type="bar"
          color="orange"
        />
      </div>

      {stats.matchesByClub.length > 0 && (
        <div className="grid grid-cols-1">
          <SimpleChart
            title="Matchs par club"
            data={stats.matchesByClub}
            type="bar"
            color="pink"
          />
        </div>
      )}
    </div>
  )
}