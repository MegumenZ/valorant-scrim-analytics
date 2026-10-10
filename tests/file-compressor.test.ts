import { afterEach, describe, expect, it, vi } from "vitest";
import { compressImageToWebP } from "@/lib/utils/file-compressor";

describe("compressImageToWebP", () => {
  afterEach(() => vi.unstubAllGlobals());

  function installCanvas(exportedType = "image/webp") {
    let dimensions = { width: 0, height: 0 };
    const drawImage = vi.fn();
    const ctx = { imageSmoothingEnabled: false, imageSmoothingQuality: "low", drawImage };
    vi.stubGlobal("FileReader", class {
      result: string | null = null;
      onload: ((event: { target: { result: string } }) => void) | null = null;
      onerror: (() => void) | null = null;
      readAsDataURL() { this.result = "data:image/png;base64,AAAA"; this.onload?.({ target: { result: this.result } }); }
    });
    vi.stubGlobal("Image", class {
      width = 1920;
      height = 1080;
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      set src(_value: string) { this.onload?.(); }
    });
    vi.stubGlobal("document", { createElement: () => ({
      set width(value: number) { dimensions.width = value; },
      get width() { return dimensions.width; },
      set height(value: number) { dimensions.height = value; },
      get height() { return dimensions.height; },
      getContext: () => ctx,
      toDataURL: (type: string) => type === "image/webp" && exportedType === "image/webp"
        ? `data:image/webp;base64,UklGR${"A".repeat(409_595)}`
        : `data:${exportedType};base64,AAAA`,
    }) });
    return { dimensions, drawImage };
  }

  it("converts a 1920x1080 image to WebP within 400 KB and scales to 1600x900", async () => {
    const { dimensions } = installCanvas();
    const result = await compressImageToWebP(new File(["source"], "scrim.png", { type: "image/png" }));
    expect(dimensions).toEqual({ width: 1600, height: 900 });
    expect(result.attachment.mimeType).toBe("image/webp");
    expect(result.attachment.sizeBytes).toBe(307_200);
    expect(result.attachment.sizeBytes).toBeLessThanOrEqual(400 * 1024);
  });

  it("rejects when WebP encoding fails instead of passing through the original file", async () => {
    installCanvas("image/jpeg");
    const source = new File(["original bytes"], "scrim.png", { type: "image/png" });
    await expect(compressImageToWebP(source)).rejects.toThrow(/WebP/);
  });
});
