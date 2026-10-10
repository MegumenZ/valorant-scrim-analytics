"use client";

import React from "react";
import { Search, Download, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { VALORANT_MAPS } from "@/lib/data/valorant";
import { MatchWithStats } from "@/lib/actions/matches";

import { useTranslation } from "@/lib/i18n/context";

interface MatchFiltersProps {
  selectedMap: string;
  onMapChange: (val: string) => void;
  selectedResult: string;
  onResultChange: (val: string) => void;
  searchQuery: string;
  onSearchChange: (val: string) => void;
  onReset: () => void;
  matches: MatchWithStats[];
}

export function MatchFilters({
  selectedMap,
  onMapChange,
  selectedResult,
  onResultChange,
  searchQuery,
  onSearchChange,
  onReset,
  matches,
}: MatchFiltersProps) {
  const { t, language } = useTranslation();
  const isEn = language === "en";

  const handleExportCSV = () => {
    if (matches.length === 0) return;

    const headers = [
      "MatchID",
      "Date",
      "Map",
      "Opponent",
      "ScoreTeam",
      "ScoreOpponent",
      "Result",
      "PlayerName",
      "Agent",
      "Kills",
      "Deaths",
      "Assists",
      "KD_Ratio",
      "FirstKills",
      "Plants",
      "Defuses",
    ];

    const rows: string[] = [];
    rows.push(headers.join(","));

    for (const m of matches) {
      for (const s of m.playerStats) {
        const kd = (s.kills / Math.max(1, s.deaths)).toFixed(2);
        rows.push([
          m.id,
          m.matchDate,
          m.map,
          `"${m.opponentName}"`,
          m.scoreTeam,
          m.scoreOpponent,
          m.result,
          `"${s.player?.name || "Player"}"`,
          s.agent,
          s.kills,
          s.deaths,
          s.assists,
          kd,
          s.firstKills,
          s.plants ?? "",
          s.defuses ?? "",
        ].join(","));
      }
    }

    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `valorant-scrims-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    if (matches.length === 0) return;
    const blob = new Blob([JSON.stringify(matches, null, 2)], {
      type: "application/json;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `valorant-scrims-${new Date().toISOString().split("T")[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-3 p-4 bg-[#0F141C] border border-[#1C2433] rounded-xl shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search Opponent */}
          <div className="relative min-w-[200px] flex-1 max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#94A3B8]" />
            <Input
              placeholder={t.matches.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>

          {/* Filter Map */}
          <div className="w-36">
            <Select
              value={selectedMap}
              onChange={(e) => onMapChange(e.target.value)}
              className="h-9 text-xs font-semibold"
            >
              <option value="ALL" className="bg-[#090C10] text-[#F1F5F9]">{t.matches.allMaps}</option>
              {VALORANT_MAPS.map((m) => (
                <option key={m} value={m} className="bg-[#090C10] text-[#F1F5F9]">
                  {m}
                </option>
              ))}
            </Select>
          </div>

          {/* Filter Result */}
          <div className="w-32">
            <Select
              value={selectedResult}
              onChange={(e) => onResultChange(e.target.value)}
              className="h-9 text-xs font-semibold"
            >
              <option value="ALL" className="bg-[#090C10] text-[#F1F5F9]">{t.matches.allResults}</option>
              <option value="WIN" className="bg-[#090C10] text-emerald-400">{t.common.win} (WIN)</option>
              <option value="LOSS" className="bg-[#090C10] text-rose-400">{t.common.loss} (LOSS)</option>
              <option value="DRAW" className="bg-[#090C10] text-amber-400">{t.common.draw} (DRAW)</option>
            </Select>
          </div>

          {/* Reset Filter Button */}
          {(selectedMap !== "ALL" || selectedResult !== "ALL" || searchQuery) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="h-9 text-xs text-[#94A3B8] hover:text-[#F1F5F9] gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t.common.reset}</span>
            </Button>
          )}
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="text-xs gap-1.5 h-9"
            title={isEn ? "Export match data to CSV spreadsheet" : "Ekspor data match ke spreadsheet CSV"}
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t.matches.exportCsv}</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportJSON}
            className="text-xs gap-1.5 h-9"
            title={isEn ? "Export match data to JSON" : "Ekspor data match ke JSON"}
          >
            <Download className="w-3.5 h-3.5 text-sky-400" />
            <span>JSON</span>
          </Button>
        </div>
      </div>

      {/* Quick Filter Presets */}
      <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#1C2433] w-full text-xs">
        <span className="text-[11px] text-[#94A3B8] font-medium mr-1">{t.matches.quickFilter}:</span>
        <button
          type="button"
          onClick={() => { onResultChange("ALL"); onMapChange("ALL"); }}
          className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
            selectedResult === "ALL" && selectedMap === "ALL"
              ? "bg-[#161D28] text-white border border-[#2A364F]"
              : "bg-transparent text-[#94A3B8] hover:text-white hover:bg-[#161D28]/50"
          }`}
        >
          {t.common.all}
        </button>
        <button
          type="button"
          onClick={() => onResultChange("WIN")}
          className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
            selectedResult === "WIN"
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
              : "bg-transparent text-[#94A3B8] hover:text-emerald-400 hover:bg-emerald-500/10"
          }`}
        >
          {t.common.win} (W)
        </button>
        <button
          type="button"
          onClick={() => onResultChange("LOSS")}
          className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
            selectedResult === "LOSS"
              ? "bg-[#FF4655]/20 text-[#FF4655] border border-[#FF4655]/40"
              : "bg-transparent text-[#94A3B8] hover:text-[#FF4655] hover:bg-[#FF4655]/10"
          }`}
        >
          {t.common.loss} (L)
        </button>
      </div>
    </div>
  );
}
