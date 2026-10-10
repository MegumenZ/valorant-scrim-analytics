"use client";
/* eslint-disable @next/next/no-img-element -- Native static map art avoids Vercel image optimization usage. */
import React from "react";
import Link from "next/link";
import { MAP_METADATA, ValorantMap } from "@/lib/data/valorant";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/context";
import { MapAggregateStats } from "@/lib/utils/analytics";
import { PageHeader } from "@/components/ui/page-header";

function signed(value: number | null) {
  if (value == null) return "—";
  return `${value > 0 ? "+" : ""}${value.toFixed(1)}`;
}
export function MapsClientView({ mapData }: { mapData: MapAggregateStats[] }) {
  const { language } = useTranslation();
  const isEn = language === "en";
  return <div className="mx-auto max-w-6xl space-y-6 pb-12"><PageHeader title={isEn ? "Map Statistics" : "Statistik Map"} description={isEn ? "Match results and scoreboard performance by map" : "Hasil pertandingan dan performa scoreboard per map"} /><div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">{mapData.map((stat) => {
    const meta = MAP_METADATA[stat.map as ValorantMap] || { name: stat.map, location: "Valorant Protocol", callout: "Map", color: "from-slate-900 to-slate-950", listViewIcon: "/maps/ascent.png" };
    const hasMatches = stat.totalMatches > 0;
    const winPercent = hasMatches ? (stat.wins / stat.totalMatches) * 100 : 0;
    const lossPercent = hasMatches ? (stat.losses / stat.totalMatches) * 100 : 0;
    const drawPercent = hasMatches ? (stat.draws / stat.totalMatches) * 100 : 0;
    return <Card key={stat.map} className="overflow-hidden border-[#1C2433] bg-[#0C1017] shadow-sm"><div className="relative flex h-28 items-end overflow-hidden border-b border-[#1C2433] p-4"><img src={meta.listViewIcon} alt={stat.map} width={640} height={360} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover brightness-75" /><div className="absolute inset-0 bg-gradient-to-t from-[#0C1017] via-[#0C1017]/50 to-transparent" /><div className="relative z-10 flex w-full items-end justify-between"><div><h2 className="font-tactical text-2xl font-black uppercase tracking-wide text-white">{stat.map}</h2><p className="text-[11px] text-[#CBD5E1]">{meta.location}</p></div>{hasMatches ? <div className="font-tactical text-xl font-black text-white">{stat.winRate}% <span className="text-xs text-[#CBD5E1]">WIN</span></div> : <span className="rounded bg-black/60 px-2 py-1 text-xs font-semibold text-white">{isEn ? "Not played" : "Belum dimainkan"}</span>}</div></div><CardContent className="space-y-4 p-4 sm:p-5"><div className="space-y-2"><div className="flex justify-between text-xs"><span className="text-[#94A3B8]">{isEn ? "Scrim record" : "Rekor scrim"}</span><span className="font-semibold tabular-nums text-white">{stat.wins}W · {stat.losses}L · {stat.draws}D</span></div><div className="flex h-2 overflow-hidden rounded-full border border-[#1C2433] bg-[#090C10]"><div className="bg-emerald-400" style={{ width: `${winPercent}%` }} /><div className="bg-[#FF4655]" style={{ width: `${lossPercent}%` }} /><div className="bg-amber-400" style={{ width: `${drawPercent}%` }} /></div></div><div className="grid grid-cols-3 gap-2 border-t border-[#1C2433] pt-3"><div className="rounded-lg bg-[#090C10] p-2.5"><div className="text-[10px] text-[#94A3B8]">{isEn ? "Scrims" : "Scrim"}</div><div className="mt-1 font-tactical text-lg font-bold tabular-nums text-white">{stat.totalMatches}</div></div><div className="rounded-lg bg-[#090C10] p-2.5"><div className="text-[10px] text-[#94A3B8]">{isEn ? "Avg round diff" : "Rata-rata selisih ronde"}</div><div className={`mt-1 font-tactical text-lg font-bold tabular-nums ${stat.avgRoundDifference == null ? "text-[#CBD5E1]" : stat.avgRoundDifference >= 0 ? "text-emerald-400" : "text-[#FF4655]"}`}>{signed(stat.avgRoundDifference)}</div></div><div className="rounded-lg bg-[#090C10] p-2.5"><div className="text-[10px] text-[#94A3B8]">{isEn ? "Team K/D" : "K/D Tim"}</div><div className="mt-1 font-tactical text-lg font-bold tabular-nums text-sky-300">{stat.teamKdRatio == null ? "—" : stat.teamKdRatio.toFixed(2)}</div><div className="text-[9px] text-[#CBD5E1]">{stat.teamKills} K / {stat.teamDeaths} D</div></div></div></CardContent><div className="flex items-center justify-between border-t border-[#1C2433] bg-[#090C10]/40 p-3.5 text-xs text-[#94A3B8]"><span>{isEn ? "Total scrims" : "Total scrim"}: <strong className="text-white">{stat.totalMatches}</strong></span><Link href={`/matches?map=${stat.map}`}><Button variant="ghost" size="sm" className="h-9 gap-1 px-2 text-xs text-[#CBD5E1] hover:text-white">{isEn ? "View scrims" : "Lihat scrim"}<span aria-hidden="true">›</span></Button></Link></div></Card>;
  })}</div></div>;
}
