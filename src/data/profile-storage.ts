import { decode } from 'base64-arraybuffer';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';
import { supabase } from '../../utils/supabase/client';
import {
  cacheProfilePhotoFromLocalSource,
  cacheProfilePhotoFromSignedUrl,
  clearCachedProfilePhoto,
  getCachedProfilePhoto,
} from './profile-photo-cache';

const profilePhotosBucket = 'profile-photos';

function extensionFor(mimeType: string | null | undefined) {
  if (mimeType === 'image/png') return 'png';
  if (mimeType === 'image/webp') return 'webp';
  return 'jpg';
}

async function getProfileAvatarPath(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('avatar_path')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  return data?.avatar_path ?? null;
}

async function createProfilePhotoSignedUrl(avatarPath: string) {

  const { data: signedUrl, error: signedUrlError } = await supabase.storage
    .from(profilePhotosBucket)
    .createSignedUrl(avatarPath, 60 * 60);

  if (signedUrlError) throw signedUrlError;
  return signedUrl.signedUrl;
}

export async function synchronizeProfilePhoto(userId: string, avatarPath?: string | null) {
  const nextAvatarPath = avatarPath === undefined ? await getProfileAvatarPath(userId) : avatarPath;
  if (!nextAvatarPath) {
    await clearCachedProfilePhoto(userId);
    return null;
  }

  const cached = await getCachedProfilePhoto(userId);
  if (cached && cached.avatarPath === nextAvatarPath) return cached.uri;

  const signedUrl = await createProfilePhotoSignedUrl(nextAvatarPath);
  const next = await cacheProfilePhotoFromSignedUrl(userId, nextAvatarPath, signedUrl);
  return next.uri;
}

export async function chooseAndUploadProfilePhoto(userId: string) {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.7,
    base64: Platform.OS !== 'web',
  });

  if (result.canceled) return null;

  const asset = result.assets[0];
  if (!asset) return null;

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('avatar_path')
    .eq('id', userId)
    .maybeSingle();

  if (profileError) throw profileError;

  const path = `profiles/${userId}/avatar-${Date.now()}.${extensionFor(asset.mimeType)}`;
  const file = Platform.OS === 'web'
    ? asset.file ?? await fetch(asset.uri).then((response) => response.arrayBuffer())
    : decode(asset.base64 ?? '');

  if (Platform.OS !== 'web' && !asset.base64) {
    throw new Error('Nao foi possivel preparar a imagem selecionada.');
  }

  const { error: uploadError } = await supabase.storage
    .from(profilePhotosBucket)
    .upload(path, file, {
      cacheControl: '3600',
      contentType: asset.mimeType ?? 'image/jpeg',
      upsert: false,
    });

  if (uploadError) throw uploadError;

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ avatar_path: path })
    .eq('id', userId);

  if (updateError) {
    await supabase.storage.from(profilePhotosBucket).remove([path]);
    throw updateError;
  }

  if (profile?.avatar_path && profile.avatar_path !== path) {
    await supabase.storage.from(profilePhotosBucket).remove([profile.avatar_path]);
  }

  const signedUrl = await createProfilePhotoSignedUrl(path);
  const cached = await cacheProfilePhotoFromLocalSource(userId, path, asset.uri, signedUrl);
  return cached.uri;
}

export async function removeProfilePhoto(userId: string) {
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('avatar_path')
    .eq('id', userId)
    .maybeSingle();

  if (profileError) throw profileError;
  if (!profile?.avatar_path) {
    await clearCachedProfilePhoto(userId);
    return;
  }

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ avatar_path: null })
    .eq('id', userId);

  if (updateError) throw updateError;

  const { error: removeError } = await supabase.storage
    .from(profilePhotosBucket)
    .remove([profile.avatar_path]);

  if (removeError) throw removeError;
  await clearCachedProfilePhoto(userId);
}
