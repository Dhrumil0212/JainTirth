import * as FileSystem from 'expo-file-system';

const PLACES_FILE = FileSystem.documentDirectory + 'places.json';

export async function savePlacesJson(data) {
  await FileSystem.writeAsStringAsync(PLACES_FILE, JSON.stringify(data));
}

export async function readPlacesJson() {
  const fileInfo = await FileSystem.getInfoAsync(PLACES_FILE);
  if (!fileInfo.exists) return null;
  const content = await FileSystem.readAsStringAsync(PLACES_FILE);
  return JSON.parse(content);
}

export async function clearPlacesJson() {
  const fileInfo = await FileSystem.getInfoAsync(PLACES_FILE);
  if (fileInfo.exists) await FileSystem.deleteAsync(PLACES_FILE);
}

export async function placesJsonExists() {
  const fileInfo = await FileSystem.getInfoAsync(PLACES_FILE);
  return fileInfo.exists;
} 