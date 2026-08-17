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
        // Max bounds for crisp tactical review (Full HD max)
        const MAX_WIDTH = 1920;
        const MAX_HEIGHT = 1080;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          if (width / height > MAX_WIDTH / MAX_HEIGHT) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          } else {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return reject(new Error("Gagal menginisialisasi canvas compressor"));
        }

        // Draw with high quality smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to WebP format with quality 0.82
        let webpDataUrl = canvas.toDataURL("image/webp", 0.82);
        
        // If browser doesn't support WebP export fallback to JPEG
        if (!webpDataUrl.startsWith("data:image/webp")) {
          webpDataUrl = canvas.toDataURL("image/jpeg", 0.82);
        }

        // Calculate approximate size in bytes from base64
        const base64Length = webpDataUrl.length - (webpDataUrl.indexOf(",") + 1);
        const compressedSize = Math.round((base64Length * 3) / 4);

        const savings = Math.max(0, Math.round(((file.size - compressedSize) / file.size) * 100));
        const originalBaseName = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;

        const attachment: MatchAttachment = {
          id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
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

    // Convert to Base64 Data URL
    let binary = "";
    const len = compressedBytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(compressedBytes[i]);
    }
    const base64 = btoa(binary);
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
