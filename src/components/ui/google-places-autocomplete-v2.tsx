import { useEffect, useRef, useState, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

declare global {
  interface Window {
    initGoogleMaps?: () => void
    initGoogleMapsV2?: () => void
  }
}

interface GooglePlacesAutocompleteV2Props {
  value: string
  onChange: (value: string) => void
  onPlaceSelect?: (place: google.maps.places.PlaceResult) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function GooglePlacesAutocompleteV2({
  value,
  onChange,
  onPlaceSelect,
  placeholder = "Rechercher une adresse...",
  className,
  disabled = false,
}: GooglePlacesAutocompleteV2Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  // const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isApiLoading, setIsApiLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const serviceRef = useRef<google.maps.places.AutocompleteService | null>(null)

  // Initialize autocomplete service
  const initializeService = useCallback(() => {
    if (window.google && window.google.maps && window.google.maps.places) {
      serviceRef.current = new google.maps.places.AutocompleteService()
      setIsLoaded(true)
      setError(null)
      console.log('Google Places AutocompleteService initialized')
    }
  }, [])

  // Load Google Maps API
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY

    if (!apiKey) {
      setError('Clé API Google Places manquante')
      return
    }

    // Check if Google Maps API is already loaded
    if (window.google && window.google.maps && window.google.maps.places) {
      console.log('Google Places: API already loaded')
      initializeService()
    } else {
      console.log('Google Places: Loading API...')
      setIsApiLoading(true)

      // Check if script is already being loaded
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
      if (existingScript) {
        console.log('Google Places: Script already loading, waiting...')
        existingScript.addEventListener('load', initializeService)
        return
      }

      // Load Google Maps API
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMapsV2`
      script.async = true
      script.defer = true

      // Add global callback
      window.initGoogleMapsV2 = () => {
        console.log('Google Places: API loaded via callback')
        initializeService()
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
        if (window.initGoogleMapsV2) {
          delete window.initGoogleMapsV2
        }
      }
    }
  }, [initializeService])

  // Handle input changes and get predictions
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    onChange(inputValue)

    if (inputValue.length > 2 && serviceRef.current) {
      serviceRef.current.getPlacePredictions(
        {
          input: inputValue,
          componentRestrictions: { country: 'fr' },
          types: ['geocode']
        },
        (predictions, status) => {
          console.log('Predictions:', predictions, 'Status:', status)
          if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
            setSuggestions(predictions)
            setShowSuggestions(true)
          } else {
            setSuggestions([])
            setShowSuggestions(false)
          }
        }
      )
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  // Handle suggestion selection
  const handleSuggestionClick = (prediction: google.maps.places.AutocompletePrediction) => {
    onChange(prediction.description)
    setShowSuggestions(false)

    // Get place details
    if (window.google && window.google.maps && window.google.maps.places) {
      const service = new google.maps.places.PlacesService(document.createElement('div'))
      service.getDetails(
        {
          placeId: prediction.place_id,
          fields: ['formatted_address', 'geometry', 'name', 'place_id']
        },
        (place, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && place && onPlaceSelect) {
            console.log('Place details:', place)
            onPlaceSelect(place)
          }
        }
      )
    }
  }

  // Test the service
  const testService = () => {
    if (!serviceRef.current) {
      console.error('Service not initialized')
      return
    }

    serviceRef.current.getPlacePredictions(
      {
        input: 'Paris',
        componentRestrictions: { country: 'fr' },
        types: ['geocode']
      },
      (predictions, status) => {
        console.log('Test - Status:', status, 'Predictions:', predictions)
      }
    )
  }

  return (
    <div className="space-y-2 relative">
      <Input
        ref={inputRef}
        value={value}
        onChange={handleInputChange}
        placeholder={isApiLoading ? "Chargement de l'API Google..." : placeholder}
        className={cn(className)}
        disabled={disabled || isApiLoading}
        onFocus={() => {
          if (suggestions.length > 0) {
            setShowSuggestions(true)
          }
        }}
        onBlur={() => {
          // Delay hiding suggestions to allow click events
          setTimeout(() => setShowSuggestions(false), 200)
        }}
      />

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((prediction) => (
            <div
              key={prediction.place_id}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm border-b last:border-b-0"
              onClick={() => handleSuggestionClick(prediction)}
            >
              <div className="font-medium">{prediction.structured_formatting?.main_text}</div>
              <div className="text-gray-500 text-xs">{prediction.structured_formatting?.secondary_text}</div>
            </div>
          ))}
        </div>
      )}

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


      {!import.meta.env.VITE_GOOGLE_PLACES_API_KEY && (
        <p className="text-sm text-amber-600">
          ⚠️ Clé API Google Places manquante. Ajoutez VITE_GOOGLE_PLACES_API_KEY dans votre .env
        </p>
      )}
    </div>
  )
}