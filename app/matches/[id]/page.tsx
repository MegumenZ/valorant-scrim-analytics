import React from "react";
import { notFound } from "next/navigation";
import { getMatchById } from "@/lib/actions/matches";
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

  return <MatchDetailView match={match} />;
}
