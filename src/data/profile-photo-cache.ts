import AsyncStorage from '@react-native-async-storage/async-storage';
import { Directory, File, Paths } from 'expo-file-system';
import { Platform } from 'react-native';

export type CachedProfilePhoto = {
  avatarPath: string;
  uri: string;
};

const storageKey = (userId: string) => `ata:profile-photo:${userId}`;

function fileNameFor(avatarPath: string) {
  const name = avatarPath.split('/').pop() ?? 'avatar.jpg';
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}

function profilePhotoDirectory(userId: string) {
  return new Directory(Paths.document, 'profile-photos', userId);
}

function removeLocalFile(uri: string | null | undefined) {
  if (Platform.OS === 'web' || !uri?.startsWith('file:')) return;
  const file = new File(uri);
  if (file.exists) file.delete();
}

export async function getCachedProfilePhoto(userId: string): Promise<CachedProfilePhoto | null> {
  const value = await AsyncStorage.getItem(storageKey(userId));
  if (!value) return null;

  try {
    const cached = JSON.parse(value) as CachedProfilePhoto;
    if (!cached.avatarPath || !cached.uri) throw new Error('Invalid cache entry');
    if (Platform.OS !== 'web' && !new File(cached.uri).exists) {
      await AsyncStorage.removeItem(storageKey(userId));
      return null;
    }
    return cached;
  } catch {
    await AsyncStorage.removeItem(storageKey(userId));
    return null;
  }
}

async function saveCachedProfilePhoto(userId: string, next: CachedProfilePhoto) {
  const previous = await getCachedProfilePhoto(userId);
  await AsyncStorage.setItem(storageKey(userId), JSON.stringify(next));
  if (previous?.uri !== next.uri) removeLocalFile(previous?.uri);
  return next;
}

export async function cacheProfilePhotoFromSignedUrl(userId: string, avatarPath: string, signedUrl: string) {
  if (Platform.OS === 'web') {
    return saveCachedProfilePhoto(userId, { avatarPath, uri: signedUrl });
  }

  const directory = profilePhotoDirectory(userId);
  directory.create({ idempotent: true, intermediates: true });
  const file = new File(directory, fileNameFor(avatarPath));
  const downloaded = await File.downloadFileAsync(signedUrl, file, { idempotent: true });
  return saveCachedProfilePhoto(userId, { avatarPath, uri: downloaded.uri });
}

export async function cacheProfilePhotoFromLocalSource(userId: string, avatarPath: string, sourceUri: string, signedUrl: string) {
  if (Platform.OS === 'web') {
    return saveCachedProfilePhoto(userId, { avatarPath, uri: signedUrl });
  }

  const directory = profilePhotoDirectory(userId);
  directory.create({ idempotent: true, intermediates: true });
  const source = new File(sourceUri);
  const destination = new File(directory, fileNameFor(avatarPath));
  await source.copy(destination, { overwrite: true });
  return saveCachedProfilePhoto(userId, { avatarPath, uri: destination.uri });
}

export async function clearCachedProfilePhoto(userId: string) {
  const cached = await getCachedProfilePhoto(userId);
  removeLocalFile(cached?.uri);
  await AsyncStorage.removeItem(storageKey(userId));
}
