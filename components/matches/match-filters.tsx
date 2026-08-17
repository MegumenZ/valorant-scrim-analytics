"use client";

import React from "react";
import { Search, Download, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { VALORANT_MAPS } from "@/lib/data/valorant";
import { MatchWithStats } from "@/lib/actions/matches";

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
      "StartSide",
      "PlayerName",
      "Agent",
      "ACS",
      "Kills",
      "Deaths",
      "Assists",
      "ADR",
      "HS_Percent",
      "FirstKills",
      "FirstDeaths",
      "Clutches",
    ];

    const rows: string[] = [];
    rows.push(headers.join(","));

    for (const m of matches) {
      for (const s of m.playerStats) {
        rows.push([
          m.id,
          m.matchDate,
          m.map,
          `"${m.opponentName}"`,
          m.scoreTeam,
          m.scoreOpponent,
          m.result,
          m.startSide,
          `"${s.player?.name || "Player"}"`,
          s.agent,
          s.acs,
          s.kills,
          s.deaths,
          s.assists,
          s.adr,
          s.hsPercent ?? "",
          s.firstKills,
          s.firstDeaths,
          s.clutchesWon,
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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-[#141a24] border border-[#242e40] rounded-xl shadow-sm">
      <div className="flex flex-wrap items-center gap-2.5 flex-1">
        {/* Search Opponent */}
        <div className="relative min-w-[200px] flex-1 max-w-xs">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <Input
            placeholder="Cari tim lawan..."
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
            <option value="ALL">Semua Map</option>
            {VALORANT_MAPS.map((m) => (
              <option key={m} value={m}>
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
            <option value="ALL">Semua Hasil</option>
            <option value="WIN">Menang (WIN)</option>
            <option value="LOSS">Kalah (LOSS)</option>
            <option value="DRAW">Seri (DRAW)</option>
          </Select>
        </div>

        {/* Reset Filter Button */}
        {(selectedMap !== "ALL" || selectedResult !== "ALL" || searchQuery) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-9 text-xs text-slate-400 hover:text-slate-200 gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
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
          title="Ekspor data match ke spreadsheet CSV"
        >
          <Download className="w-3.5 h-3.5 text-emerald-400" />
          <span>Ekspor CSV</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportJSON}
          className="text-xs gap-1.5 h-9"
          title="Ekspor data match ke JSON"
        >
          <Download className="w-3.5 h-3.5 text-sky-400" />
          <span>JSON</span>
        </Button>
      </div>
    </div>
  );
}
