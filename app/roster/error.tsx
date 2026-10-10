"use client";
import { PageError } from "@/components/ui/page-error";
export default function RosterError({ reset }: { error: Error & { digest?: string }; reset: () => void }) { return <PageError reset={reset} />; }
