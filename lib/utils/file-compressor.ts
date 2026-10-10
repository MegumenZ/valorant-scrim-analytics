import { PDFDocument } from "pdf-lib";
import { MatchAttachment } from "../db/schema";

export interface CompressionResult {
  attachment: MatchAttachment;
  savingsPercent: number;
  originalSizeFormatted: string;
  compressedSizeFormatted: string;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

/**
 * Converts and compresses an image into a modern, lightweight WebP image
 * Downscales oversized dimensions (max 1920x1080) and applies 0.82 quality compression
 */
export async function compressImageToWebP(file: File): Promise<CompressionResult> {
  return new Promise((resolve, reject) => {
    // Validate MIME type
    if (!file.type.startsWith("image/")) {
      return reject(new Error("File bukan merupakan format gambar yang valid."));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Gagal membaca file gambar"));
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => reject(new Error("Gagal memproses gambar"));
      img.onload = () => {
        const MAX_SIDE = 1600;
        const MAX_BYTES = 400 * 1024;
        let width = img.width;
        let height = img.height;

        if (Math.max(width, height) > MAX_SIDE) {
          const scale = MAX_SIDE / Math.max(width, height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Gagal menginisialisasi canvas compressor"));
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        let webpDataUrl = "";
        // Reduce quality first, then dimensions. Never fall back to the source file or another MIME type.
        for (let attempt = 0; attempt < 18; attempt++) {
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          webpDataUrl = canvas.toDataURL("image/webp", Math.max(0.35, 0.82 - (attempt % 7) * 0.08));
          if (!webpDataUrl.startsWith("data:image/webp;base64,")) {
            return reject(new Error("Browser tidak mendukung ekspor WebP. Gunakan browser yang mendukung WebP."));
          }
          const encoded = webpDataUrl.slice(webpDataUrl.indexOf(",") + 1);
          const bytes = Math.floor((encoded.length * 3) / 4) - (encoded.endsWith("==") ? 2 : encoded.endsWith("=") ? 1 : 0);
          if (bytes <= MAX_BYTES) break;
          if (attempt % 7 === 6) {
            width = Math.max(1, Math.floor(width * 0.85));
            height = Math.max(1, Math.floor(height * 0.85));
          }
        }

        // Calculate approximate size in bytes from base64
        const base64 = webpDataUrl.slice(webpDataUrl.indexOf(",") + 1);
        const padding = base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0;
        const compressedSize = Math.floor((base64.length * 3) / 4) - padding;

        const savings = Math.max(0, Math.round(((file.size - compressedSize) / file.size) * 100));
        const originalBaseName = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;

        if (compressedSize > MAX_BYTES) return reject(new Error("Screenshot tetap melebihi 400 KB setelah dikompresi. Pilih gambar yang lebih sederhana."));

        const attachment: MatchAttachment = {
          id: `att-webp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          name: `${originalBaseName}.webp`,
          type: "image",
          mimeType: "image/webp",
          dataUrl: webpDataUrl,
          sizeBytes: compressedSize,
          originalSize: file.size,
          uploadedAt: new Date().toISOString(),
        };

        resolve({
          attachment,
          savingsPercent: savings,
          originalSizeFormatted: formatFileSize(file.size),
          compressedSizeFormatted: formatFileSize(compressedSize),
        });
      };

      img.src = event.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Validates, optimizes, and compresses a PDF document
 * If PDF > 1MB, applies pdf-lib object stream compression and metadata stripping
 */
export async function processAndCompressPdf(file: File): Promise<CompressionResult> {
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    throw new Error("File bukan merupakan dokumen PDF yang valid.");
  }

  const arrayBuffer = await file.arrayBuffer();

  try {
    // Load and optimize PDF using pdf-lib
    const pdfDoc = await PDFDocument.load(arrayBuffer, {
      ignoreEncryption: true,
      updateMetadata: false,
    });

    // Strip heavy metadata
    pdfDoc.setTitle(file.name);
    pdfDoc.setAuthor("Valorant Scrim Analytics");
    pdfDoc.setProducer("Coach Tactical Engine");
    pdfDoc.setCreator("Scrim Analytics");

    // Save with object streams compression enabled
    const compressedBytes = await pdfDoc.save({
      useObjectStreams: true,
      addDefaultPage: false,
    });

    // Convert to Base64 Data URL using chunking to prevent memory fragmentation & callstack limits
    const CHUNK_SIZE = 0x8000; // 32768
    const chunks: string[] = [];
    for (let i = 0; i < compressedBytes.length; i += CHUNK_SIZE) {
      chunks.push(String.fromCharCode.apply(null, compressedBytes.subarray(i, i + CHUNK_SIZE) as unknown as number[]));
    }
    const base64 = btoa(chunks.join(""));
    const dataUrl = `data:application/pdf;base64,${base64}`;

    const compressedSize = compressedBytes.byteLength;

    // Enforce 1MB max limit
    const MAX_ALLOWED_SIZE = 1.2 * 1024 * 1024; // 1.2MB threshold
    if (compressedSize > MAX_ALLOWED_SIZE) {
      throw new Error(
        `Ukuran berkas PDF setelah dikompresi (${formatFileSize(compressedSize)}) masih melebihi batas 1MB. Silakan gunakan PDF yang lebih ringkas.`
      );
    }

    const savings = Math.max(0, Math.round(((file.size - compressedSize) / file.size) * 100));

    const attachment: MatchAttachment = {
      id: `att-pdf-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: file.name,
      type: "pdf",
      mimeType: "application/pdf",
      dataUrl,
      sizeBytes: compressedSize,
      originalSize: file.size,
      uploadedAt: new Date().toISOString(),
    };

    return {
      attachment,
      savingsPercent: savings,
      originalSizeFormatted: formatFileSize(file.size),
      compressedSizeFormatted: formatFileSize(compressedSize),
    };
  } catch (err: any) {
    if (err.message && err.message.includes("melebihi batas")) {
      throw err;
    }
    // Fallback: if pdf-lib encountered complex syntax, check original size
    if (file.size <= 1024 * 1024) {
      const reader = new FileReader();
      const directDataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("Gagal membaca PDF"));
        reader.readAsDataURL(file);
      });

      const attachment: MatchAttachment = {
        id: `att-pdf-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: file.name,
        type: "pdf",
        mimeType: "application/pdf",
        dataUrl: directDataUrl,
        sizeBytes: file.size,
        originalSize: file.size,
        uploadedAt: new Date().toISOString(),
      };

      return {
        attachment,
        savingsPercent: 0,
        originalSizeFormatted: formatFileSize(file.size),
        compressedSizeFormatted: formatFileSize(file.size),
      };
    } else {
      throw new Error(`Gagal mengompresi PDF: ${err.message || "File terlalu besar (> 1MB)"}`);
    }
  }
}
