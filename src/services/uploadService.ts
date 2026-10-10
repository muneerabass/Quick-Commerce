import * as ImagePicker from 'expo-image-picker';
import { api } from './apiClient';

interface SignatureResponse {
  cloud_name: string;
  api_key: string;
  timestamp: number;
  signature: string;
  folder?: string;
}

interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  bytes: number;
  width: number;
  height: number;
}

/**
 * Full image-upload flow for admins:
 *   1. Launch the picker.
 *   2. Ask the backend for a short-lived Cloudinary signature.
 *   3. POST the file + signature straight to Cloudinary.
 *   4. Return the `secure_url` to store in the product.
 *
 * Returns null if the user cancels. Throws on any step that fails.
 */
export async function pickAndUploadProductImage(): Promise<string | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new Error('Photo library access was denied.');
  }
  const picked = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.85,
  });
  if (picked.canceled || picked.assets.length === 0) {
    return null;
  }
  const asset = picked.assets[0];

  // Signature is scoped to a short window; request it right before uploading.
  const signature = await api.post<SignatureResponse>('/admin/uploads/signature', undefined, { auth: true });

  // Cloudinary accepts a multipart POST at this URL; the file field name must be `file`.
  const uploadUrl = `https://api.cloudinary.com/v1_1/${signature.cloud_name}/image/upload`;
  const form = new FormData();
  // React Native quirk: file objects use { uri, name, type } at the FormData boundary.
  form.append('file', {
    uri: asset.uri,
    name: asset.fileName ?? `upload-${Date.now()}.jpg`,
    type: asset.mimeType ?? 'image/jpeg',
  } as unknown as Blob);
  form.append('api_key', signature.api_key);
  form.append('timestamp', String(signature.timestamp));
  form.append('signature', signature.signature);
  if (signature.folder) form.append('folder', signature.folder);

  const response = await fetch(uploadUrl, { method: 'POST', body: form });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`Cloudinary upload failed (${response.status}): ${text.slice(0, 160)}`);
  }
  const data = (await response.json()) as CloudinaryUploadResponse;
  return data.secure_url;
}
