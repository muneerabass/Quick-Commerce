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

/** Uploads one already-picked asset to Cloudinary using a signature. */
async function uploadAssetToCloudinary(
  asset: ImagePicker.ImagePickerAsset,
  signature: SignatureResponse,
): Promise<string> {
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

/**
 * Multi-select image-upload flow for admins:
 *   1. Launch the gallery picker with multi-selection enabled.
 *   2. Ask the backend for ONE short-lived Cloudinary signature (reused for the
 *      whole batch — same folder/timestamp, valid ~1h).
 *   3. Upload every picked file straight to Cloudinary.
 *   4. Return the `secure_url`s in the order they were picked.
 *
 * Returns an empty array if the user cancels. Throws on any step that fails.
 */
export async function pickAndUploadProductImages(limit = 6): Promise<string[]> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new Error('Photo library access was denied.');
  }
  const picked = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsMultipleSelection: true,
    selectionLimit: limit,
    quality: 0.85,
  });
  if (picked.canceled || picked.assets.length === 0) {
    return [];
  }

  // One signature covers every file in this batch.
  const signature = await api.post<SignatureResponse>('/admin/uploads/signature', undefined, { auth: true });
  const urls: string[] = [];
  for (const asset of picked.assets) {
    urls.push(await uploadAssetToCloudinary(asset, signature));
  }
  return urls;
}

/** Single-image convenience wrapper (returns null if cancelled). */
export async function pickAndUploadProductImage(): Promise<string | null> {
  const urls = await pickAndUploadProductImages(1);
  return urls[0] ?? null;
}
