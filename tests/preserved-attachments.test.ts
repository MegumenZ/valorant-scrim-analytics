import { describe, expect, it } from "vitest";
import { resolvePreservedAttachments } from "@/lib/utils/preserved-attachments";

const attachment = (id: string) => ({
  id,
  name: `${id}.png`,
  type: "image" as const,
  mimeType: "image/png",
  dataUrl: "data:image/png;base64,iVBORw0KGgo=",
  sizeBytes: 8,
  originalSize: 8,
  uploadedAt: "2025-01-01T00:00:00.000Z",
});

describe("preserved match attachments", () => {
  it("rejects an attachment ID that is not in the edited match's scoped attachment list", () => {
    const editedMatchAttachments = [attachment("attachment-match-1")];
    const result = resolvePreservedAttachments(editedMatchAttachments, ["attachment-match-2"]);

    expect(result).toEqual({ success: false, error: "Lampiran yang dipertahankan tidak ditemukan pada match ini." });
  });

  it("returns only requested attachments belonging to the edited match", () => {
    const editedMatchAttachments = [attachment("attachment-match-1"), attachment("attachment-match-1b")];
    const result = resolvePreservedAttachments(editedMatchAttachments, ["attachment-match-1b"]);

    expect(result).toEqual({ success: true, attachments: [attachment("attachment-match-1b")] });
  });
});
