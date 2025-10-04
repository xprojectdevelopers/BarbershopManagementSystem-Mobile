import { supabase } from './client'

export interface Album {
  id: string
  image_url: string
}

export async function fetchAlbums(): Promise<Album[]> {
  try {
    const { data, error } = await supabase
      .from('album')
      .select('id, image_url')

    console.log('Fetched data:', data)
    console.log('Error:', error)

    if (error) {
      console.error('Error fetching albums:', error)
      return []
    }

    return data || []
  } catch (err) {
    console.error('Unexpected error fetching albums:', err)
    return []
  }
}
