"use client";

import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { DashboardSummary } from "@/lib/utils/analytics";
import { useTranslation } from "@/lib/i18n/context";

type Tone = "up" | "down" | "flat";

const TONE_COLOR: Record<Tone, string> = {
  up: "text-emerald-400",
  down: "text-[#FF4655]",
  flat: "text-[#94A3B8]",
};

const MIN_MAP_SAMPLE = 2;

interface TeamSnapshotProps {
  summary: DashboardSummary;
}

/**
 * Plain-language digest of the dashboard: one sentence + three signals.
 * Aimed at non-analyst readers who need the story, not the raw tables.
 */
export function TeamSnapshot({ summary }: TeamSnapshotProps) {
  const { language } = useTranslation();
  const isEn = language === "en";

  const {
    totalMatches,
    wins,
    losses,
    draws,
    winRate,
    teamKdRatio,
    mapBreakdown,
  } = summary;

  const kdTone: Tone =
    teamKdRatio > 1.05 ? "up" : teamKdRatio < 0.95 ? "down" : "flat";

  // Require at least MIN_MAP_SAMPLE games before calling a map a strength / weakness.
  const rankedMaps = [...mapBreakdown]
    .filter((item) => item.total >= MIN_MAP_SAMPLE)
    .sort((a, b) => b.winRate - a.winRate);
  const bestMap = rankedMaps[0];
  const worstMap = rankedMaps[rankedMaps.length - 1];

  const narration = isEn
    ? `Team SC has played ${totalMatches} scrims with a ${winRate}% win rate (${wins}W · ${losses}L${draws ? ` · ${draws}D` : ""}).`
    : `Team SC memainkan ${totalMatches} scrim dengan win rate ${winRate}% (${wins} menang · ${losses} kalah${draws ? ` · ${draws} seri` : ""}).`;

  return (
    <section
      aria-label={isEn ? "Team snapshot" : "Ringkasan singkat tim"}
      className="rounded-xl border border-[#1C2433] bg-gradient-to-br from-[#0F141C] to-[#0C1017] p-5"
    >
      <p className="text-sm leading-relaxed text-[#CBD5E1]">{narration}</p>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <Signal
          icon={
            kdTone === "up"
              ? TrendingUp
              : kdTone === "down"
                ? TrendingDown
                : Minus
          }
          tone={kdTone}
          label={isEn ? "Team K/D" : "K/D Tim"}
          value={teamKdRatio.toFixed(2)}
          note={
            teamKdRatio >= 1
              ? isEn
                ? "More kills than deaths"
                : "Kill lebih banyak dari death"
              : isEn
                ? "More deaths than kills"
                : "Death lebih banyak dari kill"
          }
        />
        <MapSignal
          kind="best"
          map={bestMap}
          isEn={isEn}
          sampleFloor={MIN_MAP_SAMPLE}
        />
        <MapSignal
          kind="worst"
          map={bestMap && worstMap !== bestMap ? worstMap : undefined}
          isEn={isEn}
          sampleFloor={MIN_MAP_SAMPLE}
        />
      </div>
    </section>
  );
}

/* ---------- Signals ---------- */

interface SignalProps {
  icon: LucideIcon;
  tone: Tone;
  label: string;
  value: string;
  note: string;
}

function Signal({ icon: Icon, tone, label, value, note }: SignalProps) {
  return (
    <div className="flex items-start gap-3">
      <span
        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#1C2433] bg-[#090C10] ${TONE_COLOR[tone]}`}
      >
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#94A3B8]">
          {label}
        </p>
        <p
          className={`mt-0.5 text-base font-bold tabular-nums ${TONE_COLOR[tone]}`}
        >
          {value}
        </p>
        <p className="mt-0.5 text-xs text-[#64748B]">{note}</p>
      </div>
    </div>
  );
}

interface MapSignalProps {
  kind: "best" | "worst";
  map?: { map: string; winRate: number; total: number };
  isEn: boolean;
  sampleFloor: number;
}

function MapSignal({ kind, map, isEn, sampleFloor }: MapSignalProps) {
  const label =
    kind === "best"
      ? isEn
        ? "Strongest map"
        : "Map terkuat"
      : isEn
        ? "Needs practice"
        : "Perlu latihan";

  if (!map) {
    return (
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#1C2433] bg-[#090C10] text-[#475569]">
          <Minus className="h-4 w-4" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#94A3B8]">
            {label}
          </p>
          <p className="mt-0.5 text-base font-bold text-[#475569]">—</p>
          <p className="mt-0.5 text-xs text-[#64748B]">
            {isEn
              ? `Need ≥${sampleFloor} games per map`
              : `Butuh ≥${sampleFloor} game per map`}
          </p>
        </div>
      </div>
    );
  }

  const tone: Tone = kind === "best" ? "up" : "down";
  return (
    <Signal
      icon={kind === "best" ? TrendingUp : TrendingDown}
      tone={tone}
      label={label}
      value={map.map}
      note={`${map.winRate}% ${isEn ? "win rate" : "win rate"} · ${map.total} ${
        isEn ? (map.total === 1 ? "game" : "games") : "game"
      }`}
    />
  );
}
