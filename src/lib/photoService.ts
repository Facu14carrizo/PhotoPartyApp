import { supabase } from './supabaseClient';
import { compressImage, blobToBase64, base64ToBlob } from './imageOptimization';
import type { Photo } from '../types/Photo';

export async function savePhoto(
  imageBase64: string,
  title?: string
): Promise<Photo | null> {
  try {
    const blob = base64ToBlob(imageBase64);
    const compressedBlob = await compressImage(blob);
    const compressedBase64 = await blobToBase64(compressedBlob);

    const binaryData = Uint8Array.from(atob(compressedBase64.split(',')[1]), (c) => c.charCodeAt(0));

    const { data, error } = await supabase
      .from('photos')
      .insert({
        image_data: binaryData,
        title: title || null,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving photo:', error);
      return null;
    }

    return {
      id: data.id,
      imageUrl: compressedBase64,
      title: data.title,
      createdAt: new Date(data.created_at),
    };
  } catch (err) {
    console.error('Error in savePhoto:', err);
    return null;
  }
}

export async function getPhotos(): Promise<Photo[]> {
  try {
    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching photos:', error);
      return [];
    }

    return data.map((photo: any) => {
      const binaryData = new Uint8Array(photo.image_data);
      let binary = '';
      for (let i = 0; i < binaryData.length; i++) {
        binary += String.fromCharCode(binaryData[i]);
      }
      const base64 = btoa(binary);
      return {
        id: photo.id,
        imageUrl: `data:image/jpeg;base64,${base64}`,
        title: photo.title,
        createdAt: new Date(photo.created_at),
      };
    });
  } catch (err) {
    console.error('Error in getPhotos:', err);
    return [];
  }
}

export async function deletePhoto(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('photos').delete().eq('id', id);

    if (error) {
      console.error('Error deleting photo:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error in deletePhoto:', err);
    return false;
  }
}

export async function updatePhotoTitle(id: string, title: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('photos')
      .update({ title: title || null })
      .eq('id', id);

    if (error) {
      console.error('Error updating photo title:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error in updatePhotoTitle:', err);
    return false;
  }
}
