import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Clock3,
  Eye,
  EyeOff,
  MapPin,
  Plus,
  Trash2,
} from "lucide-react";
import { InvitationBlock } from "../../types";
import { cn } from "../../lib/utils";
import { InlineEdit, InlineTime, InlineWaze } from "../invitations/InlineEdit";
import { SimpleTemplateRenderProps } from "./types";

const safeJSON = <T,>(value: string | undefined, fallback: T): T => {
  try {
    if (!value) return fallback;
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

const formatDate = (value?: string) => {
  if (!value) return "Data evenimentului";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Data evenimentului";
  return date.toLocaleDateString("ro-RO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const CLASSIC_ADDABLE_BLOCKS: Array<{
  type: InvitationBlock["type"];
  label: string;
  def: Partial<InvitationBlock>;
}> = [
  { type: "text", label: "Text", def: { content: "" } },
  {
    type: "location",
    label: "Locatie",
    def: {
      label: "",
      time: "",
      locationName: "",
      locationAddress: "",
      wazeLink: "",
    },
  },
  { type: "title", label: "Titlu", def: { content: "" } },
];

const ClassicSimpleFullTemplate: React.FC<SimpleTemplateRenderProps> = ({
  data,
  onOpenRSVP,
  editMode = false,
  onProfileUpdate,
}) => {
  const { profile, guest } = data;
  const eventType = String(profile.eventType || "").toLowerCase();
  const isWeddingEvent = eventType === "wedding";

  const [blocks, setBlocks] = useState<InvitationBlock[]>(() =>
    safeJSON(profile.customSections, []),
  );
  useEffect(() => {
    setBlocks(safeJSON(profile.customSections, []));
  }, [profile.customSections]);

  const profileQueueRef = useRef<Record<string, any>>({});
  const profileTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pushProfilePatch = useCallback(
    (patch: Record<string, any>) => {
      profileQueueRef.current = { ...profileQueueRef.current, ...patch };
      if (profileTimerRef.current) clearTimeout(profileTimerRef.current);
      profileTimerRef.current = setTimeout(() => {
        const payload = { ...profileQueueRef.current };
        profileQueueRef.current = {};
        onProfileUpdate?.(payload);
      }, 220);
    },
    [onProfileUpdate],
  );

  const pushBlocks = useCallback(
    (next: InvitationBlock[]) => {
      setBlocks(next);
      onProfileUpdate?.({ customSections: JSON.stringify(next) });
    },
    [onProfileUpdate],
  );

  const updateBlock = useCallback(
    (index: number, patch: Partial<InvitationBlock>) => {
      const next = blocks.map((block, idx) =>
        idx === index ? { ...block, ...patch } : block,
      );
      pushBlocks(next);
    },
    [blocks, pushBlocks],
  );

  const moveBlock = useCallback(
    (index: number, dir: -1 | 1) => {
      const target = index + dir;
      if (target < 0 || target >= blocks.length) return;
      const next = [...blocks];
      [next[index], next[target]] = [next[target], next[index]];
      pushBlocks(next);
    },
    [blocks, pushBlocks],
  );

  const removeBlock = useCallback(
    (index: number) => {
      const next = blocks.filter((_, idx) => idx !== index);
      pushBlocks(next);
    },
    [blocks, pushBlocks],
  );

  const addBlock = useCallback(
    (type: InvitationBlock["type"], def: Partial<InvitationBlock>) => {
      const next: InvitationBlock[] = [
        ...blocks,
        {
          id: `cls-${Date.now()}`,
          type,
          show: true,
          ...(def as InvitationBlock),
        },
      ];
      pushBlocks(next);
    },
    [blocks, pushBlocks],
  );

  const visibleBlocks = editMode ? blocks : blocks.filter((block) => block.show !== false);

  const guestName = useMemo(() => {
    const raw = String(guest?.name || "").trim();
    if (!raw || raw.toLowerCase() === "invitat exemplu") return "Draga invitat";
    return raw;
  }, [guest?.name]);

  const showWelcomeText = profile.showWelcomeText !== false;
  const showCelebrationText = profile.showCelebrationText !== false;
  const showRsvpButton = profile.showRsvpButton !== false;
  const rsvpButtonText = String(profile.rsvpButtonText || "").trim() || "Confirma prezenta";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#f8f6ef,_#efebe0_45%,_#e6e0d1)] px-4 py-6 md:py-10">
      <div className="mx-auto w-full max-w-2xl">
        <div className="overflow-hidden rounded-[28px] border border-stone-300/70 bg-white/95 shadow-[0_20px_55px_rgba(51,39,20,0.18)]">
          <div className="h-1.5 w-full bg-gradient-to-r from-amber-100 via-amber-400/80 to-amber-100" />

          <div className="space-y-7 px-5 py-7 md:px-10 md:py-10">
            <div className="space-y-4 text-center">
              {showWelcomeText && (
                <InlineEdit
                  tag="p"
                  editMode={editMode}
                  value={profile.welcomeText || ""}
                  onChange={(value) => pushProfilePatch({ welcomeText: value })}
                  placeholder="Text introductiv"
                  className="text-[11px] font-semibold uppercase tracking-[0.28em] text-stone-500"
                />
              )}

              {isWeddingEvent ? (
                <h1 className="text-4xl font-semibold leading-tight text-stone-800 md:text-5xl">
                  <InlineEdit
                    tag="span"
                    editMode={editMode}
                    value={profile.partner1Name || ""}
                    onChange={(value) => pushProfilePatch({ partner1Name: value, eventName: value })}
                    placeholder="Nume 1"
                  />
                  <span className="mx-2 text-2xl text-stone-400">&</span>
                  <InlineEdit
                    tag="span"
                    editMode={editMode}
                    value={profile.partner2Name || ""}
                    onChange={(value) => pushProfilePatch({ partner2Name: value })}
                    placeholder="Nume 2"
                  />
                </h1>
              ) : (
                <InlineEdit
                  tag="h1"
                  editMode={editMode}
                  value={profile.partner1Name || ""}
                  onChange={(value) => pushProfilePatch({ partner1Name: value, eventName: value })}
                  placeholder="Nume eveniment"
                  className="text-4xl font-semibold leading-tight text-stone-800 md:text-5xl"
                />
              )}

              {showCelebrationText && (
                <p className="text-base italic text-stone-600 md:text-lg">
                  va invita la{" "}
                  <InlineEdit
                    tag="span"
                    editMode={editMode}
                    value={profile.celebrationText || ""}
                    onChange={(value) => pushProfilePatch({ celebrationText: value })}
                    placeholder="Descriere eveniment"
                  />
                </p>
              )}
            </div>

            <div className="mx-auto flex max-w-md flex-col items-center gap-2 rounded-2xl border border-stone-200 bg-stone-50/85 px-4 py-3 text-center">
              <p className="text-base font-semibold text-stone-800">{guestName}</p>
              <p className="text-[10px] uppercase tracking-[0.18em] text-stone-500">
                invitat de onoare
              </p>
            </div>

            <div className="mx-auto flex max-w-md items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-700 shadow-sm">
              <CalendarDays className="h-4 w-4 text-stone-400" />
              {editMode ? (
                <input
                  type="date"
                  value={
                    profile.weddingDate
                      ? new Date(profile.weddingDate).toISOString().split("T")[0]
                      : ""
                  }
                  onChange={(e) => pushProfilePatch({ weddingDate: e.target.value })}
                  className="w-full border-none bg-transparent text-center text-sm font-semibold uppercase tracking-wide text-stone-700 outline-none"
                />
              ) : (
                <span className="text-center text-xs font-semibold uppercase tracking-wide text-stone-700">
                  {formatDate(profile.weddingDate)}
                </span>
              )}
            </div>

            <div className="space-y-3">
              {visibleBlocks.map((block, idx) => {
                const locationName = String(block.locationName || "").trim();
                const locationAddress = String(block.locationAddress || "").trim();

                return (
                  <div
                    key={block.id || `block-${idx}`}
                    className={cn(
                      "relative rounded-2xl border border-stone-200 bg-white px-4 py-4 shadow-sm",
                      block.show === false && "opacity-45",
                    )}
                  >
                    {editMode && (
                      <div className="absolute right-2 top-2 z-10 flex items-center gap-1 rounded-full border border-stone-200 bg-white px-1 py-0.5 shadow-sm">
                        <button
                          type="button"
                          onClick={() => moveBlock(idx, -1)}
                          disabled={idx === 0}
                          className="rounded p-1 text-stone-500 transition hover:bg-stone-100 disabled:opacity-30"
                        >
                          <ChevronUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveBlock(idx, 1)}
                          disabled={idx === blocks.length - 1}
                          className="rounded p-1 text-stone-500 transition hover:bg-stone-100 disabled:opacity-30"
                        >
                          <ChevronDown className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => updateBlock(idx, { show: block.show === false })}
                          className="rounded p-1 text-stone-500 transition hover:bg-stone-100"
                        >
                          {block.show === false ? (
                            <EyeOff className="h-3.5 w-3.5" />
                          ) : (
                            <Eye className="h-3.5 w-3.5" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => removeBlock(idx)}
                          className="rounded p-1 text-red-500 transition hover:bg-red-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}

                    {block.type === "text" && (
                      <InlineEdit
                        tag="p"
                        editMode={editMode}
                        value={block.content || ""}
                        onChange={(value) => updateBlock(idx, { content: value })}
                        placeholder="Descriere"
                        className="mx-auto max-w-xl text-center text-[15px] italic leading-relaxed text-stone-700"
                        multiline
                      />
                    )}

                    {block.type === "title" && (
                      <InlineEdit
                        tag="p"
                        editMode={editMode}
                        value={block.content || ""}
                        onChange={(value) => updateBlock(idx, { content: value })}
                        placeholder="Titlu sectiune"
                        className="text-center text-[11px] font-bold uppercase tracking-[0.22em] text-stone-500"
                      />
                    )}

                    {block.type === "location" && (
                      <div className="space-y-3">
                        {(() => {
                          const wazeHref = String(block.wazeLink || "").trim();
                          const mapsQuery = `${block.locationName || ""} ${block.locationAddress || ""}`.trim();
                          const mapsHref = mapsQuery
                            ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}`
                            : "";

                          return (
                            <>
                        <InlineEdit
                          tag="p"
                          editMode={editMode}
                          value={block.label || ""}
                          onChange={(value) => updateBlock(idx, { label: value })}
                          placeholder="Titlu locatie"
                          className="text-center text-[11px] font-bold uppercase tracking-[0.22em] text-stone-500"
                        />

                        <div className="flex items-center justify-center gap-1.5 text-stone-800">
                          <Clock3 className="h-4 w-4 text-stone-400" />
                          <InlineTime
                            value={block.time || ""}
                            onChange={(value) => updateBlock(idx, { time: value })}
                            editMode={editMode}
                            className="font-semibold"
                          />
                        </div>

                        {(editMode || locationName) && (
                          <InlineEdit
                            tag="p"
                            editMode={editMode}
                            value={block.locationName || ""}
                            onChange={(value) => updateBlock(idx, { locationName: value })}
                            placeholder="Nume locatie"
                            className="text-center text-base font-semibold text-stone-800"
                          />
                        )}

                        {(editMode || locationAddress) && (
                          <div className="flex items-start justify-center gap-1.5 text-center">
                            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-stone-400" />
                            <InlineEdit
                              tag="p"
                              editMode={editMode}
                              value={block.locationAddress || ""}
                              onChange={(value) => updateBlock(idx, { locationAddress: value })}
                              placeholder="Adresa (optional)"
                              className="max-w-lg text-sm italic text-stone-600"
                            />
                          </div>
                        )}

                        {(editMode || wazeHref || mapsHref) && (
                          <div className="space-y-2 pt-1 text-center">
                            {editMode && (
                            <InlineWaze
                              value={block.wazeLink || ""}
                              onChange={(value) => updateBlock(idx, { wazeLink: value })}
                              editMode={editMode}
                            />
                            )}
                            <div className="flex flex-wrap items-center justify-center gap-2">
                              <a
                                href={wazeHref || "#"}
                                target={wazeHref ? "_blank" : undefined}
                                rel={wazeHref ? "noopener noreferrer" : undefined}
                                onClick={(e) => {
                                  if (!wazeHref) e.preventDefault();
                                }}
                                className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] transition"
                                style={{
                                  background: wazeHref ? "#2f4858" : "rgba(120,113,108,0.12)",
                                  color: wazeHref ? "#fff" : "rgba(120,113,108,0.7)",
                                  border: wazeHref
                                    ? "1px solid rgba(47,72,88,0.75)"
                                    : "1px solid rgba(120,113,108,0.25)",
                                  cursor: wazeHref ? "pointer" : "not-allowed",
                                }}
                              >
                                Waze
                              </a>
                              <a
                                href={mapsHref || "#"}
                                target={mapsHref ? "_blank" : undefined}
                                rel={mapsHref ? "noopener noreferrer" : undefined}
                                onClick={(e) => {
                                  if (!mapsHref) e.preventDefault();
                                }}
                                className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] transition"
                                style={{
                                  background: mapsHref ? "#57534e" : "rgba(120,113,108,0.12)",
                                  color: mapsHref ? "#fff" : "rgba(120,113,108,0.7)",
                                  border: mapsHref
                                    ? "1px solid rgba(87,83,78,0.75)"
                                    : "1px solid rgba(120,113,108,0.25)",
                                  cursor: mapsHref ? "pointer" : "not-allowed",
                                }}
                              >
                                Maps
                              </a>
                            </div>
                          </div>
                        )}
                            </>
                          );
                        })()}
                      </div>
                    )}

                    {block.type === "divider" && (
                      <div className="flex items-center justify-center py-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-stone-300" />
                      </div>
                    )}

                    {![
                      "text",
                      "title",
                      "location",
                      "divider",
                    ].includes(String(block.type)) && (
                      <InlineEdit
                        tag="p"
                        editMode={editMode}
                        value={block.content || ""}
                        onChange={(value) => updateBlock(idx, { content: value })}
                        placeholder="Continut"
                        className="mx-auto max-w-xl text-center text-sm leading-relaxed text-stone-700"
                        multiline
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {editMode && (
              <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-4 py-3">
                <p className="mb-2 text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-500">
                  Adauga bloc
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {CLASSIC_ADDABLE_BLOCKS.map((item) => (
                    <button
                      key={item.type}
                      type="button"
                      onClick={() => addBlock(item.type, item.def)}
                      className="inline-flex items-center gap-1 rounded-full border border-stone-300 bg-white px-3 py-1.5 text-[11px] font-semibold text-stone-700 transition hover:bg-stone-100"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {showRsvpButton && (
              <div className="pt-1 text-center">
                {editMode ? (
                  <InlineEdit
                    tag="span"
                    editMode={editMode}
                    value={rsvpButtonText}
                    onChange={(value) => pushProfilePatch({ rsvpButtonText: value })}
                    className="inline-block rounded-full bg-stone-900 px-8 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-white"
                    placeholder="Text buton"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => onOpenRSVP()}
                    className="rounded-full bg-stone-900 px-8 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-white shadow-lg transition hover:bg-stone-800"
                  >
                    {rsvpButtonText}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassicSimpleFullTemplate;
