import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Club } from '@/types/club'
import { Edit, Trash2, MapPin } from 'lucide-react'

interface ClubsTableProps {
  clubs: Club[]
  onEdit: (club: Club) => void
  onDelete: (clubId: string) => void
  loading?: boolean
}

export function ClubsTable({ clubs, onEdit, onDelete, loading = false }: ClubsTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [clubToDelete, setClubToDelete] = useState<Club | null>(null)

  const handleDeleteClick = (club: Club) => {
    setClubToDelete(club)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (clubToDelete) {
      onDelete(clubToDelete.id)
      setDeleteDialogOpen(false)
      setClubToDelete(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <span className="text-muted-foreground">Chargement des clubs...</span>
        </div>
      </div>
    )
  }

  if (clubs.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <MapPin className="h-12 w-12 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun club enregistré</h3>
        <p className="text-gray-600 mb-6">
          Commencez par ajouter votre premier club en cliquant sur le bouton "Ajouter un club".
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Localisation</TableHead>
              <TableHead>Adresse</TableHead>
              <TableHead>Coordonnées</TableHead>
              <TableHead>Date de création</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clubs.map((club) => (
              <TableRow key={club.id}>
                <TableCell>
                  <div className="font-medium">{club.name}</div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {club.location ? (
                      <div className="text-sm text-muted-foreground">
                        {club.location}
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground">
                        Non spécifiée
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {club.address && (
                      <div className="flex items-center gap-1 text-sm">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate max-w-xs">{club.address}</span>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {club.latitude && club.longitude ? (
                      <div className="text-xs text-muted-foreground font-mono">
                        📍 {club.latitude.toFixed(4)}, {club.longitude.toFixed(4)}
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground">
                        Aucune coordonnée
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-muted-foreground">
                    {formatDate(club.created_at)}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onEdit(club)}
                      className="h-8 w-8"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDeleteClick(club)}
                      className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer le club "{clubToDelete?.name}" ?
              Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
            >
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}