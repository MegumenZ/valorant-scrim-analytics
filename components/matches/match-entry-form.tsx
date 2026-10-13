"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, LoaderCircle, RotateCcw, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { VALORANT_MAPS, ValorantMap } from "@/lib/data/valorant";
import { MatchAttachment, Player } from "@/lib/db/schema";
import { createMatch, updateMatch } from "@/lib/actions/matches";
import { calculateMatchResult } from "@/lib/utils/calculations";
import { compressImageToWebP } from "@/lib/utils/file-compressor";
import { useTranslation } from "@/lib/i18n/context";
import { getInitialPlayerSelection } from "@/lib/utils/roster-behavior";
import { AgentPicker } from "@/components/matches/agent-picker";
import { isAgentSelectedElsewhere } from "@/lib/utils/agent-picker";
import { PageHeader } from "@/components/ui/page-header";
import {
  clearIdempotencyKey,
  getOrCreateIdempotencyKey,
} from "@/lib/utils/idempotency-key";

type StatRow = {
  playerId: string;
  agent: string;
  kills: string;
  deaths: string;
  assists: string;
  firstKills: string;
  plants: string;
  defuses: string;
  acs: string;
  adr: string;
  hsPercent: string;
  kastPercent: string;
  firstDeaths: string;
  clutchesWon: string;
};
type EnemyRow = Omit<StatRow, "playerId"> & { displayName: string };
type ExistingStat = NonNullable<
  MatchEntryFormProps["initialData"]
>["stats"][number];
type ExistingEnemy = NonNullable<
  NonNullable<MatchEntryFormProps["initialData"]>["opponentStats"]
>[number];

const emptyRow = (playerId = ""): StatRow => ({
  playerId,
  agent: "",
  kills: "",
  deaths: "",
  assists: "",
  firstKills: "",
  plants: "",
  defuses: "",
  acs: "",
  adr: "",
  hsPercent: "",
  kastPercent: "",
  firstDeaths: "",
  clutchesWon: "",
});
const emptyEnemy = (): EnemyRow => ({ ...emptyRow(), displayName: "" });
const optional = (value: string) => (value === "" ? null : Number(value));
const getLocalCalendarDate = () => {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
};

export function getOutcomeConfig(
  _side: "ATTACK" | "DEFENSE",
  winner: "TEAM" | "OPPONENT",
  outcome?: string | null,
  language: "id" | "en" = "id",
) {
  const won = winner === "TEAM";
  const outcomeText =
    outcome === "DEFUSE"
      ? won
        ? language === "en"
          ? "Spike Defused"
          : "Spike Berhasil Di-defuse"
        : language === "en"
          ? "Enemy Retake & Defuse"
          : "Musuh Retake & Defuse"
      : outcome === "DETONATION"
        ? won
          ? language === "en"
            ? "Spike Detonated"
            : "Spike Meledak"
          : language === "en"
            ? "Enemy Spike Detonated"
            : "Spike Musuh Meledak"
        : outcome === "TIME"
          ? won
            ? language === "en"
              ? "Time Expired"
              : "Waktu Habis"
            : language === "en"
              ? "Time Expired (Plant Failed)"
              : "Waktu Habis (Gagal Plant)"
          : won
            ? language === "en"
              ? "Enemies Eliminated"
              : "Musuh Tereliminasi"
            : language === "en"
              ? "Team Eliminated"
              : "Tim Tereliminasi";
  return {
    label: outcomeText,
    short: outcomeText,
    desc: outcomeText,
    color: won ? "text-emerald-400" : "text-rose-400",
    bg: won ? "bg-emerald-500/10" : "bg-rose-500/10",
    border: won ? "border-emerald-500/30" : "border-rose-500/30",
  };
}

interface MatchEntryFormProps {
  availablePlayers: Player[];
  initialPlayerIds?: string[];
  initialData?: {
    id: string;
    matchDate: string;
    map: ValorantMap;
    opponentName: string;
    scoreTeam: number;
    scoreOpponent: number;
    startSide: "ATTACK" | "DEFENSE";
    vodUrl?: string | null;
    notes?: string | null;
    attachments?: MatchAttachment[] | null;
    roundsTimeline?: Array<{
      round: number;
      side: "ATTACK" | "DEFENSE";
      winner: "TEAM" | "OPPONENT";
      winType?: any;
      outcomeType?: any;
      tradedDeaths?: number | null;
      tradesWon?: number | null;
    }> | null;
    stats: Array<{
      playerId: string;
      agent: string;
      acs: number | null;
      kills: number;
      deaths: number;
      assists: number;
      adr: number | null;
      hsPercent?: number | null;
      kastPercent?: number | null;
      firstKills: number;
      firstDeaths?: number | null;
      clutchesWon?: number | null;
      plants?: number | null;
      defuses?: number | null;
    }>;
    opponentStats?: Array<{
      displayName: string;
      agent: string;
      kills: number;
      deaths: number;
      assists: number;
      firstKills: number;
      plants: number;
      defuses: number;
    }>;
  };
}

const rowFrom = (row: ExistingStat): StatRow => ({
  playerId: row.playerId,
  agent: row.agent,
  kills: String(row.kills),
  deaths: String(row.deaths),
  assists: String(row.assists),
  firstKills: String(row.firstKills),
  plants: row.plants == null ? "" : String(row.plants),
  defuses: row.defuses == null ? "" : String(row.defuses),
  acs: row.acs == null ? "" : String(row.acs),
  adr: row.adr == null ? "" : String(row.adr),
  hsPercent: row.hsPercent == null ? "" : String(row.hsPercent),
  kastPercent: row.kastPercent == null ? "" : String(row.kastPercent),
  firstDeaths: row.firstDeaths == null ? "" : String(row.firstDeaths),
  clutchesWon: row.clutchesWon == null ? "" : String(row.clutchesWon),
});

const enemyRowFrom = (row: ExistingEnemy): EnemyRow => ({
  ...emptyEnemy(),
  displayName: row.displayName,
  agent: row.agent,
  kills: String(row.kills),
  deaths: String(row.deaths),
  assists: String(row.assists),
  firstKills: String(row.firstKills),
  plants: String(row.plants),
  defuses: String(row.defuses),
});

function numericCell(
  label: string,
  value: string,
  onChange: (value: string) => void,
  props: {
    min?: number;
    max?: number;
    step?: number;
    className?: string;
    id?: string;
    onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
    onPaste?: React.ClipboardEventHandler<HTMLInputElement>;
  } = {},
) {
  return (
    <label className="min-w-0">
      <span className="sr-only">{label}</span>
      <Input
        aria-label={label}
        id={props.id}
        onKeyDown={props.onKeyDown}
        onPaste={props.onPaste}
        type="number"
        min={props.min ?? 0}
        max={props.max ?? 99}
        step={props.step ?? 1}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`h-9 text-center tabular-nums ${props.className ?? ""}`}
      />
    </label>
  );
}

function resultBadge(teamScore: string, opponentScore: string, en: boolean) {
  const hasScore = teamScore !== "" && opponentScore !== "";
  const result = hasScore
    ? calculateMatchResult(Number(teamScore), Number(opponentScore))
    : null;
  const palette = !result
    ? "text-[#64748B]"
    : result === "WIN"
      ? "text-emerald-400"
      : result === "LOSS"
        ? "text-rose-400"
        : "text-amber-300";
  return (
    <div className="rounded-lg border border-[#1C2433] bg-[#0C1017] px-4 py-2 text-sm">
      <span className="mr-2 text-[#CBD5E1]">{en ? "Result" : "Hasil"}</span>
      <strong className={`font-bold ${palette}`}>{result ?? "—"}</strong>
      {hasScore && (
        <span className="ml-2 font-mono text-xs tabular-nums text-[#94A3B8]">
          {teamScore}–{opponentScore}
        </span>
      )}
    </div>
  );
}

export function MatchEntryForm({
  availablePlayers,
  initialData,
  initialPlayerIds = [],
}: MatchEntryFormProps) {
  const router = useRouter();
  const { language } = useTranslation();
  const en = language === "en";
  const playerOptions = [...availablePlayers].sort(
    (a, b) => Number(b.isActive) - Number(a.isActive),
  );
  const initialSelection = getInitialPlayerSelection(
    playerOptions,
    initialPlayerIds,
  );

  const defaults = {
    date: initialData?.matchDate ?? getLocalCalendarDate(),
    map: (initialData?.map ?? "Ascent") as ValorantMap,
    opponent: initialData?.opponentName ?? "",
    teamScore: initialData ? String(initialData.scoreTeam) : "",
    opponentScore: initialData ? String(initialData.scoreOpponent) : "",
    startSide: (initialData?.startSide ?? "ATTACK") as "ATTACK" | "DEFENSE",
    vodUrl: initialData?.vodUrl ?? "",
    notes: initialData?.notes ?? "",
    attachments: initialData?.attachments ?? [],
    rows: (initialData?.stats.length
      ? initialData.stats.map(rowFrom)
      : Array.from({ length: 5 }, (_, i) =>
          emptyRow(initialSelection[i] ?? ""),
        )) as StatRow[],
    enemyRows: (initialData?.opponentStats?.length
      ? initialData.opponentStats.map(enemyRowFrom)
      : Array.from({ length: 5 }, emptyEnemy)) as EnemyRow[],
    showEnemy: Boolean(initialData?.opponentStats?.length),
    showAdvanced: Boolean(
      initialData?.stats.some(
        (row) =>
          row.acs != null ||
          row.adr != null ||
          row.hsPercent != null ||
          row.kastPercent != null ||
          row.firstDeaths != null ||
          row.clutchesWon != null,
      ),
    ),
  };

  const [date, setDate] = useState(defaults.date);
  const [map, setMap] = useState<ValorantMap>(defaults.map);
  const [opponent, setOpponent] = useState(defaults.opponent);
  const [teamScore, setTeamScore] = useState(defaults.teamScore);
  const [opponentScore, setOpponentScore] = useState(defaults.opponentScore);
  const [startSide, setStartSide] = useState<"ATTACK" | "DEFENSE">(
    defaults.startSide,
  );
  const [vodUrl, setVodUrl] = useState(defaults.vodUrl);
  const [notes, setNotes] = useState(defaults.notes);
  const [attachments, setAttachments] = useState<MatchAttachment[]>(
    defaults.attachments,
  );
  const [rows, setRows] = useState<StatRow[]>(defaults.rows);
  const [enemyRows, setEnemyRows] = useState<EnemyRow[]>(defaults.enemyRows);
  const [showEnemy, setShowEnemy] = useState(defaults.showEnemy);
  const [showAdvanced, setShowAdvanced] = useState(defaults.showAdvanced);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const idempotencyKey = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ensureIdempotencyKey = () => {
    if (idempotencyKey.current) return idempotencyKey.current;
    let key: string;
    try {
      key = getOrCreateIdempotencyKey(window.sessionStorage, () =>
        globalThis.crypto.randomUUID(),
      );
    } catch {
      // Storage can be unavailable in restricted browser contexts; in-memory retries still work.
      key = globalThis.crypto.randomUUID();
    }
    idempotencyKey.current = key;
    return key;
  };

  const updateRow = (index: number, key: keyof StatRow, value: string) =>
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [key]: value } : row)),
    );
  const updateEnemy = (index: number, key: keyof EnemyRow, value: string) =>
    setEnemyRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [key]: value } : row)),
    );

  const handlePaste = (
    e: React.ClipboardEvent<HTMLInputElement>,
    index: number,
    key: "kills" | "deaths" | "assists",
  ) => {
    const parts = e.clipboardData
      .getData("text")
      .trim()
      .split(/[\t/ ,]+/);
    if (parts.length === 3 && parts.every((part) => /^\d{1,2}$/.test(part))) {
      e.preventDefault();
      setRows((prev) =>
        prev.map((row, i) =>
          i === index
            ? { ...row, kills: parts[0], deaths: parts[1], assists: parts[2] }
            : row,
        ),
      );
    }
  };

  const handleAttachments = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const files = Array.from(input.files ?? []);
    if (!files.length) return;
    setError("");
    try {
      if (files.some((file) => !file.type.startsWith("image/")))
        throw new Error(
          en
            ? "Only screenshots are supported for new attachments."
            : "Lampiran baru hanya mendukung screenshot.",
        );
      if (attachments.length + files.length > 3)
        throw new Error(
          en ? "Maximum 3 screenshots." : "Maksimal 3 screenshot.",
        );
      const result: MatchAttachment[] = [];
      for (const file of files)
        result.push((await compressImageToWebP(file)).attachment);
      setAttachments((current) => [...current, ...result]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal memproses screenshot.",
      );
    } finally {
      input.value = "";
    }
  };

  const resetForm = () => {
    setDate(defaults.date);
    setMap(defaults.map);
    setOpponent(defaults.opponent);
    setTeamScore(defaults.teamScore);
    setOpponentScore(defaults.opponentScore);
    setStartSide(defaults.startSide);
    setVodUrl(defaults.vodUrl);
    setNotes(defaults.notes);
    setAttachments(defaults.attachments);
    setRows(defaults.rows);
    setEnemyRows(defaults.enemyRows);
    setShowEnemy(defaults.showEnemy);
    setShowAdvanced(defaults.showAdvanced);
    setError("");
    if (idempotencyKey.current) {
      try {
        clearIdempotencyKey(window.sessionStorage, idempotencyKey.current);
      } catch {
        /* Storage may be unavailable. */
      }
      idempotencyKey.current = null;
    }
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const submissionIdempotencyKey = initialData
        ? undefined
        : ensureIdempotencyKey();
      const existingPlayerIds = new Set(
        initialData?.stats.map((stat) => stat.playerId) ?? [],
      );
      if (
        rows.some(
          (row) =>
            !row.playerId ||
            !row.agent ||
            row.kills === "" ||
            row.deaths === "" ||
            row.assists === "" ||
            row.firstKills === "" ||
            ((!initialData || !existingPlayerIds.has(row.playerId)) &&
              (row.plants === "" || row.defuses === "")),
        )
      )
        throw new Error(
          en
            ? "Complete all five Team SC scoreboard rows."
            : "Lengkapi lima baris scoreboard Team SC.",
        );
      if (
        showEnemy &&
        enemyRows.some(
          (row) =>
            !row.displayName.trim() ||
            !row.agent ||
            row.kills === "" ||
            row.deaths === "" ||
            row.assists === "" ||
            row.firstKills === "" ||
            row.plants === "" ||
            row.defuses === "",
        )
      )
        throw new Error(
          en
            ? "Complete all five opponent rows or close the opponent section."
            : "Lengkapi lima baris statistik lawan atau tutup bagian lawan.",
        );
      const ts = Number(teamScore);
      const os = Number(opponentScore);
      const enemy = showEnemy ? enemyRows : null;
      const legacyTimeline = initialData?.roundsTimeline?.length
        ? initialData.roundsTimeline
        : null;
      const input = {
        matchDate: date,
        map,
        opponentName: opponent,
        scoreTeam: ts,
        scoreOpponent: os,
        startSide,
        vodUrl: vodUrl.trim(),
        notes: notes.trim(),
        attachments: initialData
          ? attachments.filter(
              (attachment) =>
                !initialData.attachments?.some(
                  (old) => old.id === attachment.id,
                ),
            )
          : attachments,
        preservedAttachmentIds: initialData
          ? (initialData.attachments ?? [])
              .filter((old) =>
                attachments.some((attachment) => attachment.id === old.id),
              )
              .map((old) => old.id)
          : [],
        roundsTimeline: legacyTimeline,
        ...(!initialData ? { idempotencyKey: submissionIdempotencyKey } : {}),
        playerStats: rows.map((row) => ({
          playerId: row.playerId,
          agent: row.agent,
          kills: Number(row.kills),
          deaths: Number(row.deaths),
          assists: Number(row.assists),
          firstKills: Number(row.firstKills),
          plants: optional(row.plants),
          defuses: optional(row.defuses),
          acs: optional(row.acs),
          adr: optional(row.adr),
          hsPercent: optional(row.hsPercent),
          kastPercent: optional(row.kastPercent),
          firstDeaths: optional(row.firstDeaths),
          clutchesWon: optional(row.clutchesWon),
        })),
        opponentPlayerStats:
          enemy?.map((row) => ({
            displayName: row.displayName.trim(),
            agent: row.agent,
            kills: Number(row.kills),
            deaths: Number(row.deaths),
            assists: Number(row.assists),
            firstKills: Number(row.firstKills),
            plants: Number(row.plants),
            defuses: Number(row.defuses),
          })) ?? null,
        confirmWarnings: false,
      };
      let result = initialData
        ? await updateMatch(initialData.id, input)
        : await createMatch(input);
      if (!result.success && result.confirmationRequired) {
        const proceed = window.confirm(
          `${result.warnings?.join("\n")}\n\n${en ? "Save anyway?" : "Simpan tetap?"}`,
        );
        if (!proceed) {
          setLoading(false);
          return;
        }
        const confirmedInput = { ...input, confirmWarnings: true };
        result = initialData
          ? await updateMatch(initialData.id, confirmedInput)
          : await createMatch(confirmedInput);
      }
      if (!result.success)
        throw new Error(
          result.error ||
            (en ? "Failed to save match." : "Gagal menyimpan match."),
        );
      if (submissionIdempotencyKey) {
        try {
          clearIdempotencyKey(window.sessionStorage, submissionIdempotencyKey);
        } catch {
          /* Storage may be unavailable. */
        }
        idempotencyKey.current = null;
      }
      router.push(`/matches/${result.data.id}`);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : en
            ? "Failed to save match."
            : "Gagal menyimpan match.",
      );
      setLoading(false);
    }
  };

  const playerIsInactive = (playerId: string) =>
    playerId !== "" &&
    availablePlayers.find((player) => player.id === playerId)?.isActive ===
      false;
  const tableHead =
    "px-2 py-2 text-[11px] font-semibold uppercase tracking-wide text-[#CBD5E1]";
  const textInput = "h-9";
  const rowClass = (inactive: boolean) =>
    `${inactive ? "bg-amber-500/[0.04] ring-1 ring-inset ring-amber-500/15" : "bg-[#090C10]"} [&>td:first-child]:rounded-l-lg [&>td:last-child]:rounded-r-lg`;

  return (
    <form onSubmit={submit} className="mx-auto max-w-7xl space-y-6 pb-12">
      <PageHeader
        eyebrow="Team SC · Scrim Analytics"
        title={
          initialData
            ? en
              ? "Edit Scrim"
              : "Edit Scrim"
            : en
              ? "Record Scrim"
              : "Catat Scrim"
        }
        description={
          en
            ? "Enter the final post-match scoreboard."
            : "Catat scoreboard setelah pertandingan selesai."
        }
        action={resultBadge(teamScore, opponentScore, en)}
      />
      {error && (
        <div
          role="alert"
          className="flex gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <section className="rounded-xl border border-[#1C2433] bg-[#0C1017] p-4 sm:p-6">
        <div className="mb-4">
          <h2 className="font-semibold text-white">
            {en ? "Match information" : "Informasi pertandingan"}
          </h2>
          <p className="text-sm text-[#CBD5E1]">
            {en
              ? "Final score and match context"
              : "Skor akhir dan konteks pertandingan"}
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="space-y-1 text-xs text-[#CBD5E1]">
            {en ? "Date" : "Tanggal"}
            <Input
              required
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={textInput}
            />
          </label>
          <label className="space-y-1 text-xs text-[#CBD5E1]">
            Map
            <Select
              value={map}
              onChange={(e) => setMap(e.target.value as ValorantMap)}
            >
              {VALORANT_MAPS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Select>
          </label>
          <label className="space-y-1 text-xs text-[#CBD5E1]">
            {en ? "Opponent" : "Lawan"}
            <Input
              required
              maxLength={50}
              value={opponent}
              onChange={(e) => setOpponent(e.target.value)}
              className={textInput}
            />
          </label>
          <label className="space-y-1 text-xs text-[#CBD5E1]">
            {en ? "Starting side" : "Sisi awal"}
            <Select
              value={startSide}
              onChange={(e) =>
                setStartSide(e.target.value as "ATTACK" | "DEFENSE")
              }
            >
              <option value="ATTACK">Attack</option>
              <option value="DEFENSE">Defense</option>
            </Select>
          </label>
          <label className="space-y-1 text-xs text-[#CBD5E1]">
            {en ? "Team SC score" : "Skor Team SC"}
            <Input
              required
              type="number"
              min="0"
              max="99"
              value={teamScore}
              onChange={(e) => setTeamScore(e.target.value)}
              className="h-11 text-center font-mono text-xl tabular-nums"
            />
          </label>
          <label className="space-y-1 text-xs text-[#CBD5E1]">
            {en ? "Opponent score" : "Skor lawan"}
            <Input
              required
              type="number"
              min="0"
              max="99"
              value={opponentScore}
              onChange={(e) => setOpponentScore(e.target.value)}
              className="h-11 text-center font-mono text-xl tabular-nums"
            />
          </label>
          <label className="space-y-1 text-xs text-[#CBD5E1] sm:col-span-2">
            VOD URL (optional)
            <Input
              type="url"
              placeholder="https://"
              value={vodUrl}
              onChange={(e) => setVodUrl(e.target.value)}
              className={textInput}
            />
          </label>
        </div>
      </section>

      <section className="rounded-xl border border-[#1C2433] bg-[#0C1017] p-4 sm:p-6">
        <div className="mb-4">
          <h2 className="font-semibold text-white">Team SC scoreboard</h2>
          <p className="text-sm text-[#CBD5E1]">
            {en
              ? "Five players · K/D/A and round events"
              : "Lima pemain · K/D/A dan statistik ronde"}
          </p>
          <p className="mt-1 text-xs text-[#64748B]">
            {en
              ? "Tip: paste 30/11/8 into the K column to fill K, D, and A at once."
              : "Tip: tempel 30/11/8 di kolom K untuk mengisi K, D, dan A sekaligus."}
          </p>
        </div>
        <div className="overflow-x-auto overflow-y-clip xl:overflow-visible">
          <table className="w-full min-w-[850px] border-separate border-spacing-y-2">
            <thead>
              <tr>
                {[
                  en ? "Player" : "Pemain",
                  "Agent",
                  "K",
                  "D",
                  "A",
                  "FB",
                  "Plants",
                  "Defuses",
                ].map((heading) => (
                  <th key={heading} className={`${tableHead} text-left`}>
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr
                  key={index}
                  className={rowClass(playerIsInactive(row.playerId))}
                >
                  <td className="min-w-44 p-1">
                    <Select
                      aria-label={`${en ? "Player" : "Pemain"} ${index + 1}`}
                      value={row.playerId}
                      onChange={(e) =>
                        updateRow(index, "playerId", e.target.value)
                      }
                    >
                      <option value="">
                        {en ? "Select player" : "Pilih pemain"}
                      </option>
                      {playerOptions.map((player) => (
                        <option key={player.id} value={player.id}>
                          {player.name}
                          {!player.isActive
                            ? en
                              ? " (Inactive)"
                              : " (Nonaktif)"
                            : ""}
                        </option>
                      ))}
                    </Select>
                    {playerIsInactive(row.playerId) && (
                      <p className="px-1 pt-1 text-[10px] font-medium text-amber-300">
                        {en
                          ? "Inactive player — historical data entry"
                          : "Pemain nonaktif — pencatatan data historis"}
                      </p>
                    )}
                  </td>
                  <td className="min-w-40 p-1">
                    <AgentPicker
                      label={`Agent ${index + 1}`}
                      placeholder={en ? "Choose agent" : "Pilih agent"}
                      duplicateLabel={en ? "Already picked" : "Sudah dipilih"}
                      value={row.agent}
                      onChange={(value) => updateRow(index, "agent", value)}
                      otherSelections={rows
                        .filter((_, otherIndex) => otherIndex !== index)
                        .map((item) => item.agent)}
                      focusAfterSelect={() =>
                        document
                          .getElementById(`stat-matrix-${index}-0`)
                          ?.focus()
                      }
                    />
                    {isAgentSelectedElsewhere(
                      row.agent,
                      rows
                        .filter((_, otherIndex) => otherIndex !== index)
                        .map((item) => item.agent),
                    ) && (
                      <p className="px-1 pt-1 text-[10px] font-medium text-amber-200">
                        {en
                          ? "Agent already picked by another teammate."
                          : "Agent sudah dipilih baris lain; pilihan tetap bisa digunakan."}
                      </p>
                    )}
                  </td>
                  {(
                    [
                      "kills",
                      "deaths",
                      "assists",
                      "firstKills",
                      "plants",
                      "defuses",
                    ] as const
                  ).map((key, col) => (
                    <td key={key} className="w-[72px] p-1">
                      {numericCell(
                        `${key} row ${index + 1}`,
                        row[key],
                        (value) => updateRow(index, key, value),
                        {
                          className: "font-mono",
                          id: `stat-matrix-${index}-${col}`,
                          onPaste:
                            col < 3
                              ? (event) =>
                                  handlePaste(
                                    event,
                                    index,
                                    key as "kills" | "deaths" | "assists",
                                  )
                              : undefined,
                          onKeyDown: (event) => {
                            if (event.key === "Enter") {
                              event.preventDefault();
                              const next =
                                col < 5
                                  ? document.getElementById(
                                      `stat-matrix-${index}-${col + 1}`,
                                    )
                                  : document.getElementById(
                                      `stat-matrix-${index + 1}-0`,
                                    );
                              next?.focus();
                            }
                          },
                        },
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <details
        open={showEnemy}
        onToggle={(e) =>
          setShowEnemy((e.currentTarget as HTMLDetailsElement).open)
        }
        className="rounded-xl border border-[#1C2433] bg-[#0C1017] p-4 sm:p-6"
      >
        <summary className="cursor-pointer list-none">
          <span className="font-semibold text-white">
            {en ? "Add opponent stats" : "Tambah statistik lawan"}
          </span>
          <span className="ml-2 text-sm text-[#CBD5E1]">
            {en
              ? "Optional · five rows when enabled"
              : "Opsional · wajib lima baris jika dibuka"}
          </span>
        </summary>
        {showEnemy && (
          <div className="mt-4 overflow-x-auto overflow-y-clip xl:overflow-visible">
            <table className="w-full min-w-[850px] border-separate border-spacing-y-2">
              <thead>
                <tr>
                  {[
                    en ? "Player name" : "Nama pemain",
                    "Agent",
                    "K",
                    "D",
                    "A",
                    "FB",
                    "Plants",
                    "Defuses",
                  ].map((heading) => (
                    <th key={heading} className={`${tableHead} text-left`}>
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {enemyRows.map((row, index) => (
                  <tr
                    key={index}
                    className="bg-[#090C10] [&>td:first-child]:rounded-l-lg [&>td:last-child]:rounded-r-lg"
                  >
                    <td className="min-w-44 p-1">
                      <Input
                        aria-label={`Opponent name ${index + 1}`}
                        maxLength={50}
                        value={row.displayName}
                        onChange={(e) =>
                          updateEnemy(index, "displayName", e.target.value)
                        }
                        className="h-9"
                      />
                    </td>
                    <td className="min-w-40 p-1">
                      <AgentPicker
                        label={`${en ? "Opponent agent" : "Agent lawan"} ${index + 1}`}
                        placeholder={en ? "Choose agent" : "Pilih agent"}
                        duplicateLabel={en ? "Already picked" : "Sudah dipilih"}
                        value={row.agent}
                        onChange={(value) => updateEnemy(index, "agent", value)}
                        otherSelections={enemyRows
                          .filter((_, otherIndex) => otherIndex !== index)
                          .map((item) => item.agent)}
                        focusAfterSelect={() =>
                          document
                            .getElementById(`opponent-stat-matrix-${index}-0`)
                            ?.focus()
                        }
                      />
                      {isAgentSelectedElsewhere(
                        row.agent,
                        enemyRows
                          .filter((_, otherIndex) => otherIndex !== index)
                          .map((item) => item.agent),
                      ) && (
                        <p className="px-1 pt-1 text-[10px] font-medium text-amber-200">
                          {en
                            ? "Agent already picked by another opponent."
                            : "Agent sudah dipilih baris lawan lain; pilihan tetap bisa digunakan."}
                        </p>
                      )}
                    </td>
                    {(
                      [
                        "kills",
                        "deaths",
                        "assists",
                        "firstKills",
                        "plants",
                        "defuses",
                      ] as const
                    ).map((key, col) => (
                      <td key={key} className="w-[72px] p-1">
                        {numericCell(
                          `Opponent ${key} row ${index + 1}`,
                          row[key],
                          (value) => updateEnemy(index, key, value),
                          {
                            className: "font-mono",
                            id: `opponent-stat-matrix-${index}-${col}`,
                          },
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </details>

      <details
        open={showAdvanced}
        onToggle={(e) =>
          setShowAdvanced((e.currentTarget as HTMLDetailsElement).open)
        }
        className="rounded-xl border border-[#1C2433] bg-[#0C1017] p-4 sm:p-6"
      >
        <summary className="cursor-pointer list-none">
          <span className="font-semibold text-white">
            {en ? "Advanced player stats" : "Statistik lanjutan pemain"}
          </span>
          <span className="ml-2 text-sm text-[#CBD5E1]">
            {en
              ? "Optional · blank values stay unknown"
              : "Opsional · nilai kosong tetap tidak diketahui"}
          </span>
        </summary>
        {showAdvanced && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[850px] border-separate border-spacing-y-2">
              <thead>
                <tr>
                  {[
                    en ? "Player" : "Pemain",
                    "ACS",
                    "ADR",
                    "HS%",
                    "KAST%",
                    "FD",
                    "Clutches",
                  ].map((heading) => (
                    <th key={heading} className={`${tableHead} text-left`}>
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr
                    key={index}
                    className="bg-[#090C10] [&>td:first-child]:rounded-l-lg [&>td:last-child]:rounded-r-lg"
                  >
                    <td className="min-w-44 px-3 text-sm text-[#F1F5F9]">
                      {availablePlayers.find(
                        (player) => player.id === row.playerId,
                      )?.name ?? `Player ${index + 1}`}
                    </td>
                    {(
                      [
                        "acs",
                        "adr",
                        "hsPercent",
                        "kastPercent",
                        "firstDeaths",
                        "clutchesWon",
                      ] as const
                    ).map((key) => (
                      <td key={key} className="w-24 p-1">
                        {numericCell(
                          key,
                          row[key],
                          (value) => updateRow(index, key, value),
                          {
                            max: key === "acs" || key === "adr" ? 999 : 100,
                            step: 1,
                          },
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </details>

      <section className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
        <div className="rounded-xl border border-[#1C2433] bg-[#0C1017] p-4 sm:p-6">
          <h2 className="font-semibold text-white">
            {en ? "Notes & screenshots" : "Catatan & screenshot"}
          </h2>
          <p className="mt-1 text-sm text-[#CBD5E1]">
            {en ? "Up to 3 screenshots" : "Maksimal 3 screenshot"}
          </p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-[#1C2433] p-4 text-sm text-[#F1F5F9] transition-colors hover:border-[#FF4655] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4655]"
          >
            <Upload className="h-4 w-4" aria-hidden="true" />
            {en ? "Choose screenshots" : "Pilih screenshot"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleAttachments}
          />
          <ul className="mt-3 space-y-2">
            {attachments.map((attachment) => (
              <li
                key={attachment.id}
                className="flex items-center justify-between gap-2 text-xs text-[#CBD5E1]"
              >
                <span className="truncate">{attachment.name}</span>
                <button
                  type="button"
                  aria-label={`Remove ${attachment.name}`}
                  onClick={() =>
                    setAttachments((current) =>
                      current.filter((item) => item.id !== attachment.id),
                    )
                  }
                  className="rounded p-1 text-[#CBD5E1] hover:text-rose-400"
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>
        <label className="rounded-xl border border-[#1C2433] bg-[#0C1017] p-4 sm:p-6">
          <span className="font-semibold text-white">
            {en ? "Match notes" : "Catatan pertandingan"}
          </span>
          <Textarea
            maxLength={2000}
            rows={7}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-3 resize-y"
            placeholder={
              en
                ? "Optional post-match notes"
                : "Catatan pasca-match (opsional)"
            }
          />
        </label>
      </section>

      <footer className="flex flex-col-reverse justify-end gap-3 border-t border-[#1C2433] pt-4 sm:flex-row">
        <Button
          type="button"
          variant="ghost"
          onClick={resetForm}
          disabled={loading}
          className="gap-2 text-[#CBD5E1] hover:text-white"
        >
          <RotateCcw className="h-4 w-4" />
          {en ? "Clear" : "Kosongkan"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.back()}
          disabled={loading}
        >
          {en ? "Cancel" : "Batal"}
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="min-w-40 bg-[#C92F3D] text-white hover:bg-[#A91E2C]"
        >
          {loading && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
          {loading
            ? en
              ? "Saving…"
              : "Menyimpan…"
            : en
              ? "Save match"
              : "Simpan match"}
        </Button>
      </footer>
    </form>
  );
}
