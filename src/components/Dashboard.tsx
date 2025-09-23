import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { LogOut, Shield, Plus, BarChart3, Building } from 'lucide-react'
import { ClubsTable } from '@/components/ClubsTable'
import { ClubFormModal } from '@/components/ClubFormModal'
import { StatsDashboard } from '@/components/StatsDashboard'
import { getClubs, createClub, updateClub, deleteClub } from '@/lib/clubs'
import type { Club, ClubFormData } from '@/types/club'
import { toast, Toaster } from 'sonner'

type ActiveView = 'clubs' | 'statistics'

export function Dashboard() {
  const { signOut } = useAuth()
  const [activeView, setActiveView] = useState<ActiveView>('clubs')
  const [clubs, setClubs] = useState<Club[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingClub, setEditingClub] = useState<Club | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSignOut = async () => {
    await signOut()
  }

  const loadClubs = async () => {
    try {
      setLoading(true)
      const clubsData = await getClubs()
      setClubs(clubsData)
    } catch (error) {
      console.error('Error loading clubs:', error)
      toast.error('Erreur lors du chargement des clubs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (activeView === 'clubs') {
      loadClubs()
    }
  }, [activeView])

  const handleCreateClub = () => {
    setEditingClub(null)
    setModalOpen(true)
  }

  const handleEditClub = (club: Club) => {
    setEditingClub(club)
    setModalOpen(true)
  }

  const handleSubmitClub = async (formData: ClubFormData) => {
    try {
      setSubmitting(true)
      if (editingClub) {
        // Update existing club
        const updatedClub = await updateClub({ id: editingClub.id, ...formData })
        setClubs(prev => prev.map(club => club.id === editingClub.id ? updatedClub : club))
        toast.success('Club modifié avec succès')
      } else {
        // Create new club
        const newClub = await createClub(formData)
        setClubs(prev => [newClub, ...prev])
        toast.success('Club créé avec succès')
      }
      setModalOpen(false)
      setEditingClub(null)
    } catch (error) {
      console.error('Error submitting club:', error)
      toast.error(editingClub ? 'Erreur lors de la modification' : 'Erreur lors de la création')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteClub = async (clubId: string) => {
    try {
      await deleteClub(clubId)
      setClubs(prev => prev.filter(club => club.id !== clubId))
      toast.success('Club supprimé avec succès')
    } catch (error) {
      console.error('Error deleting club:', error)
      toast.error('Erreur lors de la suppression')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center min-w-0 flex-1">
              <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 mr-2 sm:mr-3 flex-shrink-0" />
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                Gestion d'AlloPadel
              </h1>
            </div>
            <Button
              onClick={handleSignOut}
              variant="outline"
              size="sm"
              className="flex items-center gap-1 sm:gap-2 ml-4"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Se déconnecter</span>
              <span className="sm:hidden">Sortir</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveView('clubs')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeView === 'clubs'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                <span className="hidden sm:inline">Gestion des clubs</span>
                <span className="sm:hidden">Clubs</span>
              </div>
            </button>
            <button
              onClick={() => setActiveView('statistics')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeView === 'statistics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Statistiques</span>
                <span className="sm:hidden">Stats</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        {activeView === 'clubs' ? (
          <div className="space-y-4 sm:space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div className="min-w-0">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Liste des clubs</h2>
                <p className="text-sm sm:text-base text-gray-600 mt-1">
                  Gérez tous les clubs enregistrés dans la plateforme
                </p>
              </div>
              <Button
                onClick={handleCreateClub}
                className="flex items-center justify-center gap-2 w-full sm:w-auto"
                size="sm"
              >
                <Plus className="h-4 w-4" />
                <span className="sm:hidden">Nouveau club</span>
                <span className="hidden sm:inline">Ajouter un club</span>
              </Button>
            </div>

            {/* Clubs Table */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-3 sm:p-6">
                <ClubsTable
                  clubs={clubs}
                  onEdit={handleEditClub}
                  onDelete={handleDeleteClub}
                  loading={loading}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {/* Statistics Header */}
            <div className="min-w-0">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Tableau de bord des statistiques</h2>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                Vue d'ensemble des données de la plateforme AlloPadel
              </p>
            </div>

            {/* Statistics Dashboard */}
            <StatsDashboard />
          </div>
        )}
      </main>

      {/* Club Form Modal */}
      <ClubFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        club={editingClub}
        onSubmit={handleSubmitClub}
        loading={submitting}
      />

      {/* Toast Notifications */}
      <Toaster
        position="top-center"
        closeButton
        richColors
        toastOptions={{
          className: 'sm:max-w-md mx-4 sm:mx-0',
        }}
      />
    </div>
  )
}