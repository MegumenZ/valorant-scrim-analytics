import type { MatchAttachment } from "../db/schema";

export function resolvePreservedAttachments(
  matchAttachments: unknown[],
  requestedIds: string[],
): { success: true; attachments: MatchAttachment[] } | { success: false; error: string } {
  const attachmentsById = new Map(
    matchAttachments
      .filter((item): item is MatchAttachment => Boolean(item && typeof item === "object" && "id" in item && typeof item.id === "string"))
      .map((attachment) => [attachment.id, attachment]),
  );
  if (requestedIds.some((attachmentId) => !attachmentsById.has(attachmentId))) {
    return { success: false, error: "Lampiran yang dipertahankan tidak ditemukan pada match ini." };
  }
  return { success: true, attachments: requestedIds.map((attachmentId) => attachmentsById.get(attachmentId)!) };
}
