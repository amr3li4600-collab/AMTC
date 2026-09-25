"use server";

import { getSupabaseAdmin, STORAGE_BUCKETS } from "@/lib/supabase";
import sharp from "sharp";
import { requireAdminSession } from "@/lib/auth";

const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3 MB

// Magic bytes definitions
const MAGIC_BYTES = {
  JPEG: [0xff, 0xd8, 0xff],
  PNG: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  // WEBP requires checking 'RIFF' and 'WEBP'
};

function isValidImageSignature(buffer: Buffer): boolean {
  if (buffer.length < 12) return false;

  // Check JPEG
  if (buffer[0] === MAGIC_BYTES.JPEG[0] && buffer[1] === MAGIC_BYTES.JPEG[1] && buffer[2] === MAGIC_BYTES.JPEG[2]) {
    return true;
  }

  // Check PNG
  let isPng = true;
  for (let i = 0; i < MAGIC_BYTES.PNG.length; i++) {
    if (buffer[i] !== MAGIC_BYTES.PNG[i]) {
      isPng = false;
      break;
    }
  }
  if (isPng) return true;

  // Check WEBP (RIFF....WEBP)
  // RIFF = 52 49 46 46
  // WEBP = 57 45 42 50 (at offset 8)
  if (
    buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
    buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50
  ) {
    return true;
  }

  return false;
}

export async function uploadPhotoAction(formData: FormData): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    await requireAdminSession();

    const file = formData.get("file") as File | null;
    const studentId = formData.get("studentId") as string | null;

    if (!file || !studentId) {
      return { success: false, error: "Missing file or studentId" };
    }

    // 1. Strict Size Check
    if (file.size > MAX_FILE_SIZE) {
      return { success: false, error: "File exceeds 3MB limit" };
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 2. Magic Byte Check
    if (!isValidImageSignature(buffer)) {
      return { success: false, error: "Invalid image format. Only JPEG, PNG, and WEBP are allowed." };
    }

    // 3. Process with Sharp
    // Resize, strip metadata, convert to highly compressed WebP
    const processedBuffer = await sharp(buffer)
      .resize({ width: 800, height: 800, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();

    // 4. Upload to Supabase (using admin client to bypass RLS)
    const supabaseAdmin = getSupabaseAdmin();
    const timestamp = Date.now();
    const filename = `${studentId}/${timestamp}.webp`;

    const { data, error: uploadError } = await supabaseAdmin.storage
      .from(STORAGE_BUCKETS.STUDENT_PHOTOS)
      .upload(filename, processedBuffer, {
        contentType: "image/webp",
        upsert: true,
      });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      return { success: false, error: `Failed to upload: ${uploadError.message}` };
    }

    // 5. Get Public URL
    const { data: publicUrlData } = supabaseAdmin.storage
      .from(STORAGE_BUCKETS.STUDENT_PHOTOS)
      .getPublicUrl(data.path);

    return { success: true, url: publicUrlData.publicUrl };

  } catch (error) {
    console.error("Photo upload processing error:", error);
    return { success: false, error: "An error occurred during file processing" };
  }
}
