import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, XCircle, AlertCircle, Eye, EyeOff } from 'lucide-react'

export function GooglePlacesDebug() {
  const [showApiKey, setShowApiKey] = useState(false)
  const apiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY

  const checkApiKey = () => {
    if (!apiKey) {
      return { status: 'error', message: 'Clé API manquante' }
    }
    if (apiKey.length < 30) {
      return { status: 'warning', message: 'Clé API trop courte (probablement invalide)' }
    }
    return { status: 'success', message: 'Clé API configurée' }
  }

  const checkGoogleMapsApi = () => {
    if (typeof window !== 'undefined' && window.google && window.google.maps) {
      return { status: 'success', message: 'API Google Maps chargée' }
    }
    return { status: 'error', message: 'API Google Maps non chargée' }
  }

  const checkPlacesApi = () => {
    if (typeof window !== 'undefined' && window.google && window.google.maps && window.google.maps.places) {
      return { status: 'success', message: 'API Google Places chargée' }
    }
    return { status: 'error', message: 'API Google Places non chargée' }
  }

  // const testApiKey = async () => {
  //   if (!apiKey) return { status: 'error', message: 'Aucune clé API à tester' }

  //   try {
  //     const response = await fetch(`https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=test&inputtype=textquery&key=${apiKey}`)
  //     if (response.ok) {
  //       return { status: 'success', message: 'Clé API valide' }
  //     } else {
  //       return { status: 'error', message: `Erreur API: ${response.status}` }
  //     }
  //   } catch (error) {
  //     return { status: 'error', message: 'Erreur de connexion' }
  //   }
  // }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-amber-600" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return null
    }
  }

  const apiKeyCheck = checkApiKey()
  const mapsApiCheck = checkGoogleMapsApi()
  const placesApiCheck = checkPlacesApi()

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔧 Diagnostic Google Places
        </CardTitle>
        <CardDescription>
          Vérifiez la configuration de l'API Google Places
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* API Key Check */}
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center gap-2">
            {getStatusIcon(apiKeyCheck.status)}
            <span className="font-medium">Clé API</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{apiKeyCheck.message}</span>
            {apiKey && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            )}
          </div>
        </div>

        {/* Show API Key */}
        {showApiKey && apiKey && (
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-xs font-mono break-all">{apiKey}</p>
          </div>
        )}

        {/* Google Maps API Check */}
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center gap-2">
            {getStatusIcon(mapsApiCheck.status)}
            <span className="font-medium">API Google Maps</span>
          </div>
          <span className="text-sm text-muted-foreground">{mapsApiCheck.message}</span>
        </div>

        {/* Google Places API Check */}
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center gap-2">
            {getStatusIcon(placesApiCheck.status)}
            <span className="font-medium">API Google Places</span>
          </div>
          <span className="text-sm text-muted-foreground">{placesApiCheck.message}</span>
        </div>

        {/* Instructions */}
        <div className="space-y-2 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900">Instructions de configuration :</h4>
          <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
            <li>Allez sur <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="underline">Google Cloud Console</a></li>
            <li>Activez l'API "Places API" et "Maps JavaScript API"</li>
            <li>Créez une clé API dans "Identifiants"</li>
            <li>Ajoutez <code className="bg-blue-100 px-1 rounded">VITE_GOOGLE_PLACES_API_KEY=votre-clé</code> dans votre fichier .env</li>
            <li>Redémarrez votre serveur de développement</li>
          </ol>
        </div>

        {/* Console Log Button */}
        <Button
          onClick={() => {
            console.log('=== GOOGLE PLACES DEBUG ===')
            console.log('API Key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'Non définie')
            console.log('Google object:', window.google)
            console.log('Maps object:', window.google?.maps)
            console.log('Places object:', window.google?.maps?.places)
            console.log('Environment:', import.meta.env)
            console.log('========================')
          }}
          variant="outline"
          className="w-full"
        >
          📝 Logs de débogage dans la console
        </Button>
      </CardContent>
    </Card>
  )
}