import React from "react";
import { getMapAnalyticsData } from "@/lib/actions/matches";
import { MapsClientView } from "@/components/maps/maps-client-view";

export const dynamic = "force-dynamic";

export default async function MapsAnalyticsPage() {
  const mapData = await getMapAnalyticsData();

  return <MapsClientView mapData={mapData} />;
}
