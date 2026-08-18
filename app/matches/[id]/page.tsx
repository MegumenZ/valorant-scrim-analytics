import React from "react";
import { notFound } from "next/navigation";
import { getMatchById, getAllMatches } from "@/lib/actions/matches";
import { MatchDetailView } from "@/components/matches/match-detail-view";

export const dynamic = "force-dynamic";

interface MatchDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function MatchDetailPage({ params }: MatchDetailPageProps) {
  const { id } = await params;
  const match = await getMatchById(id);

  if (!match) {
    notFound();
  }

  const allMatches = await getAllMatches();
  const pastMatches = allMatches.filter((m) => m.id !== id);

  return <MatchDetailView match={match} pastMatches={pastMatches} />;
}
