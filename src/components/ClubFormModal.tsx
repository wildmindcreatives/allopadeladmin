import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { GooglePlacesAutocompleteV2 } from '@/components/ui/google-places-autocomplete-v2'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Club, ClubFormData } from '@/types/club'
import { Building2, MapPin } from 'lucide-react'

interface ClubFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  club?: Club | null
  onSubmit: (data: ClubFormData) => Promise<void>
  loading?: boolean
}

export function ClubFormModal({
  open,
  onOpenChange,
  club,
  onSubmit,
  loading = false,
}: ClubFormModalProps) {
  const [formData, setFormData] = useState<ClubFormData>({
    name: '',
    address: '',
    location: '',
    latitude: undefined,
    longitude: undefined,
  })

  const [errors, setErrors] = useState<Partial<ClubFormData>>({})

  useEffect(() => {
    if (club) {
      setFormData({
        name: club.name || '',
        address: club.address || '',
        location: club.location || '',
        latitude: club.latitude,
        longitude: club.longitude,
      })
    } else {
      setFormData({
        name: '',
        address: '',
        location: '',
        latitude: undefined,
        longitude: undefined,
      })
    }
    setErrors({})
  }, [club, open])

  const validateForm = (): boolean => {
    const newErrors: Partial<ClubFormData> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est requis'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      await onSubmit(formData)
      onOpenChange(false)
    } catch (error) {
      console.error('Error submitting form:', error)
    }
  }

  const handleInputChange = (field: keyof ClubFormData, value: string | number | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handlePlaceSelect = (place: google.maps.places.PlaceResult) => {
    if (place.geometry && place.geometry.location) {
      const lat = place.geometry.location.lat()
      const lng = place.geometry.location.lng()

      // Extract city and country from address components
      let city = ''
      let country = ''

      if (place.address_components) {
        for (const component of place.address_components) {
          const types = component.types

          if (types.includes('locality')) {
            city = component.long_name
          } else if (types.includes('administrative_area_level_1') && !city) {
            city = component.long_name
          }

          if (types.includes('country')) {
            country = component.long_name
          }
        }
      }

      // Format location as "City, Country"
      const location = city && country ? `${city}, ${country}` : ''

      setFormData(prev => ({
        ...prev,
        location,
        latitude: lat,
        longitude: lng,
      }))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {club ? 'Modifier le club' : 'Ajouter un nouveau club'}
          </DialogTitle>
          <DialogDescription>
            {club
              ? 'Modifiez les informations du club ci-dessous.'
              : 'Remplissez les informations du nouveau club ci-dessous.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* Nom du club */}
            <div className="space-y-2">
              <Label htmlFor="name">Nom du club *</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="pl-10"
                  placeholder="Nom du club"
                  required
                />
              </div>
              {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
            </div>

            {/* Adresse avec autocomplete Google */}
            <div className="space-y-2">
              <Label htmlFor="address">Adresse</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
                <GooglePlacesAutocompleteV2
                  value={formData.address || ''}
                  onChange={(value) => handleInputChange('address', value)}
                  onPlaceSelect={handlePlaceSelect}
                  className="pl-10"
                  placeholder="Rechercher une adresse (ville, région, adresse complète...)"
                />
              </div>
              {formData.location && (
                <p className="text-sm text-green-600 font-medium">
                  📍 Localisation: {formData.location}
                </p>
              )}
              {formData.latitude && formData.longitude && (
                <p className="text-xs text-muted-foreground">
                  Coordonnées: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  {club ? 'Modification...' : 'Création...'}
                </div>
              ) : (
                club ? 'Modifier' : 'Créer'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}