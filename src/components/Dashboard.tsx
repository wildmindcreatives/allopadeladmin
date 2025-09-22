import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { LogOut, Shield, Plus } from 'lucide-react'
import { ClubsTable } from '@/components/ClubsTable'
import { ClubFormModal } from '@/components/ClubFormModal'
import { getClubs, createClub, updateClub, deleteClub } from '@/lib/clubs'
import type { Club, ClubFormData } from '@/types/club'
import { toast, Toaster } from 'sonner'

export function Dashboard() {
  const { signOut } = useAuth()
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
    loadClubs()
  }, [])

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
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">Gestion des Clubs</h1>
            </div>
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Se déconnecter
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Add Club Button */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Liste des clubs</h2>
              <p className="text-gray-600 mt-1">
                Gérez tous les clubs enregistrés dans la plateforme
              </p>
            </div>
            <Button onClick={handleCreateClub} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Ajouter un club
            </Button>
          </div>

          {/* Clubs Table */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <ClubsTable
                clubs={clubs}
                onEdit={handleEditClub}
                onDelete={handleDeleteClub}
                loading={loading}
              />
            </div>
          </div>
        </div>
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
        position="top-right"
        closeButton
        richColors
      />
    </div>
  )
}