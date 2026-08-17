import { z } from "zod";
import { VALORANT_ROLES } from "../data/valorant";

export const playerSchema = z.object({
  name: z.string().min(1, "Nama pemain wajib diisi").max(30),
  riotId: z.string().optional().or(z.literal("")),
  primaryRole: z.enum(VALORANT_ROLES).default("Flex"),
  discordId: z.string().optional().or(z.literal("")),
  isActive: z.boolean().default(true),
});

export type PlayerInput = z.infer<typeof playerSchema>;
