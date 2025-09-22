export interface Club {
  id: string
  name: string
  location?: string
  address?: string
  latitude?: number
  longitude?: number
  created_at: string
  updated_at: string
}

export interface ClubFormData {
  name: string
  address: string
  location?: string
  latitude?: number
  longitude?: number
}

export type CreateClubData = ClubFormData

export interface UpdateClubData extends Partial<CreateClubData> {
  id: string
}

export interface PlaceDetails {
  formatted_address: string
  geometry: {
    location: {
      lat: () => number
      lng: () => number
    }
  }
}