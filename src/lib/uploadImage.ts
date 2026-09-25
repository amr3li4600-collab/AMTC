import imageCompression from "browser-image-compression";
import { supabase, STORAGE_BUCKETS } from "./supabase";

/**
 * Compresses an image client-side and uploads to Supabase Storage.
 * Target: max 800×800px, ~80-100KB, JPEG format.
 * This ensures 1GB free storage can host 10,000+ student profiles.
 */
export async function compressAndUploadImage(
  file: File,
  studentId: string
): Promise<string> {
  // Step 1: Compress
  const compressed = await imageCompression(file, {
    maxSizeMB: 0.1, // ~100KB
    maxWidthOrHeight: 800,
    useWebWorker: true,
    fileType: "image/jpeg",
  });

  // Step 2: Generate unique filename
  const timestamp = Date.now();
  const filename = `${studentId}/${timestamp}.jpg`;

  // Step 3: Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKETS.STUDENT_PHOTOS)
    .upload(filename, compressed, {
      contentType: "image/jpeg",
      upsert: true,
    });

  if (error) {
    throw new Error(`Photo upload failed: ${error.message}`);
  }

  // Step 4: Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage
    .from(STORAGE_BUCKETS.STUDENT_PHOTOS)
    .getPublicUrl(data.path);

  return publicUrl;
}

/**
 * Deletes a student photo from Supabase Storage.
 */
export async function deleteStudentPhoto(photoUrl: string): Promise<void> {
  // Extract path from public URL
  const bucketUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKETS.STUDENT_PHOTOS}/`;
  const path = photoUrl.replace(bucketUrl, "");

  if (path) {
    await supabase.storage
      .from(STORAGE_BUCKETS.STUDENT_PHOTOS)
      .remove([path]);
  }
}
