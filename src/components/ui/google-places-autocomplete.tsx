import { useEffect, useRef, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

declare global {
  interface Window {
    initGoogleMaps?: () => void
  }
}

interface GooglePlacesAutocompleteProps {
  value: string
  onChange: (value: string) => void
  onPlaceSelect?: (place: google.maps.places.PlaceResult) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function GooglePlacesAutocomplete({
  value,
  onChange,
  onPlaceSelect,
  placeholder = "Rechercher une adresse...",
  className,
  disabled = false,
}: GooglePlacesAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isApiLoading, setIsApiLoading] = useState(false)
  const [testMode, setTestMode] = useState(false)

  useEffect(() => {
    const initializeAutocomplete = () => {
      try {
        if (!inputRef.current) {
          console.log('Google Places: Input ref not available')
          return
        }

        console.log('Google Places: Initializing autocomplete')

        const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
          types: ['geocode', 'establishment'],
          fields: ['formatted_address', 'geometry', 'name', 'place_id', 'address_components', 'types'],
          componentRestrictions: { country: 'fr' }, // Restrict to France for better results
        })

        // Set additional options
        autocomplete.setOptions({
          strictBounds: false,
          types: ['geocode', 'establishment']
        })

        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace()
          console.log('Google Places: Place selected', place)

          if (place && place.formatted_address) {
            onChange(place.formatted_address)
            if (onPlaceSelect) {
              onPlaceSelect(place)
            }
          }
        })

        autocompleteRef.current = autocomplete
        setError(null)
        console.log('Google Places: Autocomplete initialized successfully')
      } catch (err) {
        console.error('Google Places: Error initializing autocomplete', err)
        setError('Erreur lors de l\'initialisation de l\'autocomplete')
      }
    }

    const apiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY

    if (!apiKey) {
      setError('Clé API Google Places manquante')
      return
    }

    // Check if Google Maps API is already loaded
    if (window.google && window.google.maps && window.google.maps.places) {
      console.log('Google Places: API already loaded')
      initializeAutocomplete()
      setIsLoaded(true)
    } else {
      console.log('Google Places: Loading API...')
      setIsApiLoading(true)

      // Check if script is already being loaded
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
      if (existingScript) {
        console.log('Google Places: Script already loading, waiting...')
        existingScript.addEventListener('load', () => {
          initializeAutocomplete()
          setIsLoaded(true)
          setIsApiLoading(false)
        })
        return
      }

      // Load Google Maps API
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps`
      script.async = true
      script.defer = true

      // Add global callback
      window.initGoogleMaps = () => {
        console.log('Google Places: API loaded via callback')
        initializeAutocomplete()
        setIsLoaded(true)
        setIsApiLoading(false)
      }

      script.onerror = () => {
        console.error('Google Places: Failed to load API')
        setError('Impossible de charger l\'API Google Places')
        setIsApiLoading(false)
      }

      document.head.appendChild(script)

      return () => {
        if (document.head.contains(script)) {
          document.head.removeChild(script)
        }
        if (window.initGoogleMaps) {
          delete window.initGoogleMaps
        }
      }
    }
  }, [onChange, onPlaceSelect])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  const testAutocompleteService = () => {
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      console.error('Google Places API not loaded')
      return
    }

    setTestMode(true)
    const service = new google.maps.places.AutocompleteService()

    service.getPlacePredictions(
      {
        input: 'Paris',
        componentRestrictions: { country: 'fr' },
        types: ['geocode', 'establishment']
      },
      (predictions, status) => {
        console.log('Autocomplete test - Status:', status)
        console.log('Autocomplete test - Predictions:', predictions)
        setTestMode(false)

        if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
          console.log('✅ Autocomplete service is working!')
        } else {
          console.error('❌ Autocomplete service failed:', status)
        }
      }
    )
  }

  return (
    <div className="space-y-2">
      <Input
        ref={inputRef}
        value={value}
        onChange={handleInputChange}
        placeholder={isApiLoading ? "Chargement de l'API Google..." : placeholder}
        className={cn(className)}
        disabled={disabled || isApiLoading}
      />

      {error && (
        <p className="text-sm text-red-600">
          ❌ {error}
        </p>
      )}

      {isApiLoading && (
        <p className="text-sm text-blue-600">
          🔄 Chargement de l'API Google Places...
        </p>
      )}

      {isLoaded && !error && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-green-600">
            ✅ Google Places activé - Tapez pour voir les suggestions
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={testAutocompleteService}
            disabled={testMode}
          >
            {testMode ? '⏳ Test...' : '🧪 Test API'}
          </Button>
        </div>
      )}

      {testMode && (
        <p className="text-sm text-blue-600">
          🔄 Test du service autocomplete en cours...
        </p>
      )}

      {!import.meta.env.VITE_GOOGLE_PLACES_API_KEY && (
        <p className="text-sm text-amber-600">
          ⚠️ Clé API Google Places manquante. Ajoutez VITE_GOOGLE_PLACES_API_KEY dans votre .env
        </p>
      )}
    </div>
  )
}