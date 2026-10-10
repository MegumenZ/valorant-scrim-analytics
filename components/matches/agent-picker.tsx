"use client";

import { createPortal } from "react-dom";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { VALORANT_AGENTS, VALORANT_ROLES } from "@/lib/data/valorant";
import { filterAgents, getAgentPanelPosition, isAgentSelectedElsewhere, moveGroupedAgentGridHighlight, type AgentPanelPosition } from "@/lib/utils/agent-picker";
import { AgentIcon } from "./agent-icon";

interface AgentPickerProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder: string;
  duplicateLabel: string;
  otherSelections: string[];
  focusAfterSelect?: () => void;
}

const PANEL_WIDTH = 400;
const PANEL_MAX_HEIGHT = 360;
const GRID_COLUMNS_DESKTOP = 8;
const GRID_COLUMNS_MOBILE = 6;

export function AgentPicker({ value, onChange, label, placeholder, duplicateLabel, otherSelections, focusAfterSelect }: AgentPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [position, setPosition] = useState<AgentPanelPosition | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const listId = `agent-picker-options-${useId().replace(/:/g, "")}`;
  const results = useMemo(() => filterAgents(VALORANT_AGENTS, query), [query]);
  const groups = useMemo(() => VALORANT_ROLES.filter((role) => role !== "Flex").map((role) => ({ role, agents: results.filter((agent) => agent.role === role) })).filter((group) => group.agents.length), [results]);
  const orderedGroups = useMemo(() => groups.map((group) => group.agents), [groups]);
  const orderedResults = useMemo(() => orderedGroups.flat(), [orderedGroups]);
  const activeAgent = orderedResults[activeIndex] ?? orderedResults[0];

  const close = useCallback((restoreFocus = true) => {
    setOpen(false);
    setQuery("");
    setPosition(null);
    if (restoreFocus) requestAnimationFrame(() => buttonRef.current?.focus());
  }, []);

  const choose = useCallback((agentName: string) => {
    onChange(agentName);
    close(false);
    requestAnimationFrame(() => {
      if (focusAfterSelect) focusAfterSelect();
      else buttonRef.current?.focus();
    });
  }, [close, focusAfterSelect, onChange]);

  const measurePosition = useCallback(() => {
    if (!buttonRef.current || !panelRef.current) return;
    const mobile = window.matchMedia("(max-width: 639px)").matches;
    setIsMobile(mobile);
    if (mobile) {
      setPosition(null);
      return;
    }
    const button = buttonRef.current.getBoundingClientRect();
    const panel = panelRef.current.getBoundingClientRect();
    setPosition(getAgentPanelPosition(
      { left: button.left, right: button.right, top: button.top, bottom: button.bottom },
      { width: window.innerWidth, height: window.innerHeight },
      { width: Math.max(PANEL_WIDTH, panel.width), height: Math.max(PANEL_MAX_HEIGHT, panel.height) },
    ));
  }, []);

  useEffect(() => {
    if (!open) return;
    let frame = 0;
    const scheduleMeasure = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => { frame = 0; measurePosition(); });
    };
    scheduleMeasure();
    document.addEventListener("scroll", scheduleMeasure, { capture: true, passive: true });
    window.addEventListener("resize", scheduleMeasure, { passive: true });
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Node && (panelRef.current?.contains(target) || buttonRef.current?.contains(target))) return;
      const clickedOtherPicker = target instanceof Element && Boolean(target.closest("[data-agent-picker-trigger]"));
      close(!clickedOtherPicker);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); close(); return; }
      if (!isMobile || event.key !== "Tab" || !panelRef.current) return;
      const focusable = Array.from(panelRef.current.querySelectorAll<HTMLElement>('input:not([disabled]), button:not([disabled])'));
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      document.removeEventListener("scroll", scheduleMeasure, true);
      window.removeEventListener("resize", scheduleMeasure);
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("keydown", onKeyDown, true);
    };
  }, [close, isMobile, measurePosition, open]);

  useEffect(() => {
    if (!open || !isMobile) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [isMobile, open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open, isMobile]);

  const openPicker = () => {
    setActiveIndex(Math.max(0, orderedResults.findIndex((agent) => agent.name === value)));
    setOpen(true);
  };

  const panel = open && typeof document !== "undefined" ? createPortal(<>
    {isMobile && <button type="button" tabIndex={-1} aria-label={placeholder} onClick={() => close()} className="fixed inset-0 z-[90] bg-black/65 motion-reduce:transition-none" />}
    <div ref={panelRef} data-agent-picker-panel role={isMobile ? "dialog" : undefined} aria-modal={isMobile ? true : undefined} aria-label={isMobile ? label : undefined} className={`fixed z-[100] flex flex-col border border-slate-600 bg-slate-950 shadow-2xl motion-reduce:transition-none ${isMobile ? "inset-x-0 bottom-0 max-h-[70dvh] rounded-t-2xl p-4 pb-[max(1rem,env(safe-area-inset-bottom))]" : "max-h-[360px] w-[min(400px,calc(100vw-16px))] rounded-xl p-3"}`} style={isMobile ? undefined : { left: position?.left ?? 8, top: position?.top ?? 8, width: position?.width ?? undefined, maxHeight: Math.min(position?.maxHeight ?? PANEL_MAX_HEIGHT, PANEL_MAX_HEIGHT), visibility: position ? "visible" : "hidden" }}>
      {isMobile && <button type="button" aria-label={placeholder} onClick={() => close()} className="mx-auto mb-3 h-1.5 w-12 shrink-0 rounded-full bg-slate-500"><span className="sr-only">{placeholder}</span></button>}
      <input ref={inputRef} role="combobox" aria-label={label} aria-autocomplete="list" aria-expanded="true" aria-controls={listId} aria-activedescendant={activeAgent ? `agent-option-${listId}-${activeAgent.name.replace(/[^a-z0-9]/gi, "-")}` : undefined} value={query} onChange={(event) => { setQuery(event.target.value); setActiveIndex(0); }} onKeyDown={(event) => {
        if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) {
          event.preventDefault();
          const columns = window.matchMedia("(max-width: 639px)").matches ? GRID_COLUMNS_MOBILE : GRID_COLUMNS_DESKTOP;
          setActiveIndex((current) => moveGroupedAgentGridHighlight(current, event.key as "ArrowLeft" | "ArrowRight" | "ArrowUp" | "ArrowDown", orderedGroups, columns));
        } else if (event.key === "Enter") {
          event.preventDefault();
          const chosen = orderedResults[activeIndex] ?? orderedResults[0];
          if (chosen) choose(chosen.name);
        }
      }} className="mb-2 h-10 shrink-0 rounded-md border border-slate-600 bg-slate-900 px-3 text-sm text-white outline-none placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-400" placeholder={placeholder} />
      <div id={listId} role="listbox" aria-label={label} className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {groups.map(({ role, agents }) => <section key={role} role="group" aria-label={role} className="mb-1">
          <h3 className="mb-1 border-b border-slate-800 pb-0.5 text-[11px] font-bold uppercase tracking-wider text-slate-300">{role}</h3>
          <div className={`grid gap-1 ${isMobile ? "grid-cols-6" : "grid-cols-8"}`}>
            {agents.map((agent) => {
              const index = orderedResults.findIndex((item) => item.name === agent.name);
              const duplicate = isAgentSelectedElsewhere(agent.name, otherSelections);
              const highlighted = index === activeIndex;
              return <button id={`agent-option-${listId}-${agent.name.replace(/[^a-z0-9]/gi, "-")}`} key={agent.name} type="button" role="option" aria-selected={value === agent.name} aria-label={`${agent.name}${duplicate ? `, ${duplicateLabel}` : ""}`} title={`${agent.name}${duplicate ? ` · ${duplicateLabel}` : ""}`} onMouseEnter={() => setActiveIndex(index)} onFocus={() => setActiveIndex(index)} onClick={() => choose(agent.name)} className={`flex aspect-square min-h-10 min-w-10 items-center justify-center rounded-md border bg-slate-900 p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${isMobile ? "min-h-11 min-w-11" : ""} ${duplicate ? "opacity-60" : ""} ${highlighted || value === agent.name ? "border-sky-400 bg-sky-400/15" : "border-slate-800 hover:border-slate-500"}`}>
                <AgentIcon agentName={agent.name} size={32} />
              </button>;
            })}
          </div>
        </section>)}
        {!results.length && <p className="py-4 text-center text-sm text-slate-300">—</p>}
      </div>
      <p aria-live="polite" className="mt-2 min-h-5 shrink-0 text-xs font-medium text-slate-200">{activeAgent ? `${activeAgent.name} · ${activeAgent.role}` : "—"}</p>
    </div>
  </>, document.body) : null;

  return <>
    <button ref={buttonRef} data-agent-picker-trigger type="button" aria-label={`${label}: ${value || placeholder}`} aria-haspopup="listbox" aria-expanded={open} onClick={open ? () => close() : openPicker} className="flex h-11 w-full min-w-0 items-center gap-2 overflow-hidden rounded-md border border-slate-700 bg-slate-900 px-2 text-left text-sm text-white outline-none hover:border-slate-500 focus-visible:ring-2 focus-visible:ring-sky-400">
      {value ? <><AgentIcon agentName={value} size={28} /><span className="truncate">{value}</span></> : <span className="truncate text-slate-300">{placeholder}</span>}
      <span aria-hidden="true" className="ml-auto shrink-0 text-slate-400">⌄</span>
    </button>
    {panel}
  </>;
}
