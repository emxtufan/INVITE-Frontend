
import React, { useState, useEffect } from "react";
import {
  Plus, Search, Copy, Check, ExternalLink, Trash2, Mail, Users, Baby, Heart,
  AlertTriangle, MessageSquare, Info, Lock, Crown, UserPlus, Globe, Link as LinkIcon, Send
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import Button from "./ui/button";
import Input from "./ui/input";
import { API_URL, PLAN_LIMITS as DEFAULT_LIMITS } from "../constants";
import { GuestListEntry, UserSession } from "../types";
import { cn } from "../lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { useToast } from "./ui/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";

interface GuestListViewProps {
  session: UserSession;
  isPremium?: boolean;
  onShowUpgrade?: () => void;
  onNavigateToSettings?: () => void;
  onCheckActive?: () => boolean; // Global restriction check
  isEventActive?: boolean; // NEW: Visual state for read-only mode
  snapshotGuests?: GuestListEntry[]; // NEW: Data from archive
}

const GuestListView: React.FC<GuestListViewProps> = ({
  session,
  isPremium = false,
  onShowUpgrade,
  onNavigateToSettings,
  onCheckActive,
  isEventActive = true,
  snapshotGuests
}) => {
  const { toast } = useToast();
  const [guests, setGuests] = useState<GuestListEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState("");
  const [newGuestName, setNewGuestName] = useState("");
  const [newGuestType, setNewGuestType] = useState("adult");
  const [isAdding, setIsAdding] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [publicLinkCopied, setPublicLinkCopied] = useState(false);
  
  // Dynamic Limits
  const normalizedPlan = String(session.plan || "").trim().toLowerCase();
  const isPremiumPlan = isPremium || normalizedPlan === "premium";
  const isBasicPlan = !isPremiumPlan && normalizedPlan === "basic";
  const fallbackLimits = isPremiumPlan
    ? DEFAULT_LIMITS.premium
    : isBasicPlan
      ? DEFAULT_LIMITS.basic
      : DEFAULT_LIMITS.free;
  const maxGuestsFromSession = Number(session.limits?.maxGuests);
  const maxGuests = isPremiumPlan
    ? Number.MAX_SAFE_INTEGER
    : Number.isFinite(maxGuestsFromSession) && maxGuestsFromSession > 0
      ? maxGuestsFromSession
      : fallbackLimits.maxGuests;

  // Link Configuration Logic
  const hasInviteSlug = !!session.profile?.inviteSlug;
  const slug = hasInviteSlug ? session.profile.inviteSlug : "";
  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  useEffect(() => {
    // If in Archive Mode, use passed data
    if (!isEventActive && snapshotGuests) {
        setGuests(snapshotGuests);
        return;
    }

    if (session.token) {
      fetchGuests();
    }
  }, [session.userId, session.token, isEventActive, snapshotGuests]);

  const fetchGuests = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/guests/${session.userId}`, {
        headers: { Authorization: `Bearer ${session.token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setGuests(data);
      }
    } catch (error) {
      console.error("Failed to fetch guests", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (onCheckActive && !onCheckActive()) return;
    if (!newGuestName.trim()) return;

    if (guests.length >= maxGuests) {
      if (onShowUpgrade) onShowUpgrade();
      return;
    }

    setIsAdding(true);
    try {
      const res = await fetch(`${API_URL}/guests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify({
          userId: session.userId, 
          name: newGuestName,
          type: newGuestType,
        }),
      });

      if (res.ok) {
        const newGuest = await res.json();
        setGuests((prev) => [...prev, newGuest]);
        setNewGuestName("");
        toast({ title: "Invitat adaugat", variant: "success" });
      } else {
          const err = await res.json();
          if (err.error === 'Limit reached.') {
              if (isPremiumPlan) {
                toast({
                  title: "Limita nu a fost sincronizata",
                  description: "Contul apare Premium, dar serverul a returnat limita de invitati. Reincarca pagina; daca problema persista, revino in Billing.",
                  variant: "warning",
                });
              } else if (onShowUpgrade) {
                onShowUpgrade();
              }
          }
      }
    } catch (error) {
      console.error("Failed to add guest", error);
      toast({
        title: "Eroare",
        description: "Nu am putut adauga invitatul.",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteGuest = async (id: string) => {
    if (onCheckActive && !onCheckActive()) return;
    try {
      await fetch(`${API_URL}/guests/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session.token}` },
      });
      setGuests((prev) => prev.filter((g) => g._id !== id));
      toast({ title: "Invitat sters", variant: "default" });
    } catch (error) {
      console.error("Failed to delete", error);
      toast({
        title: "Eroare",
        description: "Nu am putut sterge invitatul.",
        variant: "destructive",
      });
    }
  };

  const toggleSentStatus = async (id: string, currentStatus: boolean) => {
      if (onCheckActive && !onCheckActive()) return;
      try {
          const res = await fetch(`${API_URL}/guests/${id}/sent`, {
              method: 'PUT',
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.token}` },
              body: JSON.stringify({ isSent: !currentStatus })
          });
          if (res.ok) {
              setGuests(prev => prev.map(g => g._id === id ? { ...g, isSent: !currentStatus } : g));
              toast({ title: !currentStatus ? "Marcat ca Trimis" : "Marcat ca Netrimis" });
          }
      } catch (error) { console.error(error); }
  };

  const copyToClipboard = (fullUrl: string, token: string, id: string, isSent: boolean) => {
    if (onCheckActive && !onCheckActive()) return; // Prevent generating invites if inactive
    navigator.clipboard.writeText(fullUrl);
    setCopiedToken(token);
    toast({
      title: "Link copiat",
      description: isSent ? "Link-ul este in clipboard." : "Marcheaza ca trimis daca l-ai expediat.",
      duration: 2000,
    });
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const copyPublicLink = () => {
    if (onCheckActive && !onCheckActive()) return; // Block copy if read-only
    if (!hasInviteSlug) {
        toast({ title: "Va rugam sa configurati preferinta link-ului", variant: "warning" });
        return;
    }
    const url = `${origin}/events/${slug}/public`;
    navigator.clipboard.writeText(url);
    setPublicLinkCopied(true);
    toast({
      title: "Link Public Copiat!",
      description: "Oricine are acest link se poate inscrie.",
      variant: "success",
    });
    setTimeout(() => setPublicLinkCopied(false), 2000);
  };

  const simulateOpenInvite = async (token: string) => {
        const targetUrl = `${origin}/invite/${token}`;
        try {
            await fetch(`${API_URL}/guest/rsvp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, status: 'opened' })
            });
            fetchGuests();
            window.open(targetUrl, '_blank');
        } catch (e) { 
            console.error(e);
            window.open(targetUrl, '_blank');
        }
    };

  const filteredGuests = guests.filter((g) =>
    g.name.toLowerCase().includes(filter.toLowerCase()),
  );
  const guestsComingCount = guests.filter((g) => g.status === "confirmed").length;
  const guestsNotComingCount = guests.filter((g) => g.status === "declined").length;

  const formatAccessDate = (dateStr?: string) => {
      if (!dateStr) return null;
      return new Date(dateStr).toLocaleDateString('ro-RO', {
          day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
      });
  };

  const getStatusBadge = (status: string, openedAt?: string, isSent?: boolean) => {
    switch (status) {
      case "confirmed":
        return (
            <div className="flex flex-col items-start">
                <span className="inline-flex items-center rounded-full bg-green-50 dark:bg-green-500/10 px-2 py-1 text-xs font-medium text-green-700 dark:text-green-400 ring-1 ring-inset ring-green-600/20 dark:ring-green-500/20">Confirmat</span>
                {openedAt && <span className="text-[10px] text-muted-foreground mt-0.5" title="Ultima accesare">{formatAccessDate(openedAt)}</span>}
            </div>
        );
      case "declined":
        return (
            <div className="flex flex-col items-start">
                <span className="inline-flex items-center rounded-full bg-red-50 dark:bg-red-500/10 px-2 py-1 text-xs font-medium text-red-700 dark:text-red-400 ring-1 ring-inset ring-red-600/20 dark:ring-red-500/20">Refuzat</span>
                {openedAt && <span className="text-[10px] text-muted-foreground mt-0.5" title="Ultima accesare">{formatAccessDate(openedAt)}</span>}
            </div>
        );
      case "opened":
        return (
            <div className="flex flex-col items-start">
                <span className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-500/10 px-2 py-1 text-xs font-medium text-blue-700 dark:text-blue-400 ring-1 ring-inset ring-blue-700/10 dark:ring-blue-500/20">Vazut</span>
                {openedAt && <span className="text-[10px] text-muted-foreground mt-0.5" title="Ultima accesare">{formatAccessDate(openedAt)}</span>}
            </div>
        );
      default:
        if (isSent) {
            return (
                <div className="flex flex-col items-start">
                    <span className="inline-flex items-center rounded-full bg-amber-50 dark:bg-amber-900/20 px-2 py-1 text-xs font-medium text-amber-700 dark:text-amber-400 ring-1 ring-inset ring-amber-600/20 dark:ring-amber-500/20">Trimis</span>
                    {openedAt && <span className="text-[10px] text-muted-foreground mt-0.5" title="Ultima accesare">{formatAccessDate(openedAt)}</span>}
                </div>
            );
        }
        return <span className="inline-flex items-center rounded-full bg-gray-50 dark:bg-zinc-800/50 px-2 py-1 text-xs font-medium text-gray-600 dark:text-zinc-400 ring-1 ring-inset ring-gray-500/10 dark:ring-zinc-700">Nevazut</span>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "child": return <Baby className="w-4 h-4 text-pink-500" />;
      case "family": return <Users className="w-4 h-4 text-indigo-500" />;
      case "couple": return <Heart className="w-4 h-4 text-red-500" />;
      default: return <UserIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  const UserIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
  );

  const inviteBaseUrl = `${origin}/invite/`;
  const isLocked = !isPremiumPlan && guests.length >= maxGuests;

  return (
    <TooltipProvider>
      <div className="flex-1 min-h-0 overflow-y-auto bg-zinc-50 dark:bg-zinc-950/50 p-4 md:p-6 lg:p-8">
        <div className="mx-auto w-full max-w-[1400px] space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-semibold tracking-tight">Lista Invitati & RSVP</CardTitle>
              <CardDescription className="text-sm">
                Fiecare sectiune este separata, iar continutul dinamic ramane stabil pe orice ecran.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-lg border bg-background px-4 py-3">
                  <p className="text-xs text-muted-foreground">Invitati total</p>
                  <p className="text-lg font-semibold">{guests.length}</p>
                </div>
                <div className="rounded-lg border bg-background px-4 py-3">
                  <p className="text-xs text-muted-foreground">Vin</p>
                  <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">{guestsComingCount}</p>
                </div>
                <div className="rounded-lg border bg-background px-4 py-3">
                  <p className="text-xs text-muted-foreground">Nu vin</p>
                  <p className="text-lg font-semibold text-rose-600 dark:text-rose-400">{guestsNotComingCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {!hasInviteSlug && isEventActive && (
            <Card className="border-indigo-200 bg-indigo-50/70 dark:border-indigo-900 dark:bg-indigo-900/10">
              <CardContent className="p-4 md:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-indigo-100 dark:bg-indigo-900/40 shrink-0">
                      <LinkIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-semibold text-sm text-indigo-900 dark:text-indigo-200">Configureaza link-ul public</p>
                      <p className="text-xs text-indigo-700 dark:text-indigo-300 leading-relaxed">
                        Pentru generare link public, seteaza un `inviteSlug` in configurari.
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onNavigateToSettings}
                    className="w-full sm:w-auto border-indigo-300 text-indigo-800 hover:bg-indigo-100"
                  >
                    Configurare Link
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {hasInviteSlug && (
            <Card className={cn("border-indigo-200/70 dark:border-indigo-900", !isEventActive && "opacity-60")}>
              <CardContent className="p-4 md:p-5">
                <div className="grid grid-cols-1 lg:grid-cols-[auto_minmax(0,1fr)_auto] items-start lg:items-center gap-4">
                  <div className="p-3 bg-background rounded-full border w-fit">
                    <Globe className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <p className="font-semibold text-sm">Link public universal</p>
                    <p className="text-xs text-muted-foreground leading-relaxed break-words">
                      {isEventActive
                        ? "Oricine acceseaza acest link poate confirma prezenta."
                        : "Event-ul este in read-only, iar actiunile sunt blocate."}
                    </p>
                    <p className="text-xs font-mono text-muted-foreground break-all">/events/{slug}/public</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={copyPublicLink}
                    disabled={!isEventActive}
                    className={cn("w-full lg:w-auto", publicLinkCopied && "text-green-600")}
                  >
                    {publicLinkCopied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                    Copiaza link
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className={cn("relative overflow-hidden", isLocked || !isEventActive ? "border-indigo-200 dark:border-indigo-900" : "")}>
            {(isLocked || !isEventActive) && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/60 dark:bg-zinc-950/65 backdrop-blur-[2px] p-4">
                <div className="flex flex-col sm:flex-row items-center gap-3 bg-background border px-4 py-3 rounded-xl shadow-lg max-w-full">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground text-center sm:text-left">
                    <Lock className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span>{!isEventActive ? "Modificari blocate (Read-Only)" : `Limita atinsa (${maxGuests})`}</span>
                  </div>
                  {isLocked && isEventActive && (
                    <Button
                      size="sm"
                      onClick={onShowUpgrade}
                      className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-0"
                    >
                      <Crown className="w-3 h-3 mr-1 text-yellow-200" />
                      Upgrade
                    </Button>
                  )}
                </div>
              </div>
            )}

            <CardHeader className="pb-3">
              <CardTitle className="text-base md:text-lg">Adauga invitat</CardTitle>
              <CardDescription>
                Formular separat, compact si stabil. Nu se suprapune peste alte sectiuni.
              </CardDescription>
            </CardHeader>
            <CardContent className={cn((isLocked || !isEventActive) && "opacity-20 pointer-events-none")}>
              <form
                onSubmit={handleAddGuest}
                className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_220px_auto] gap-3 items-end"
              >
                <div className="space-y-2 min-w-0">
                  <label className="text-xs font-medium text-muted-foreground">Nume invitat</label>
                  <div className="flex items-center gap-2 rounded-md border border-input bg-background px-3">
                    <UserPlus className="w-4 h-4 text-primary shrink-0" />
                    <Input
                      placeholder="Nume Invitat Manual (ex: Familia Popescu)"
                      value={newGuestName}
                      onChange={(e: any) => setNewGuestName(e.target.value)}
                      className="border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 px-0 h-11"
                      disabled={isLocked || !isEventActive}
                    />
                  </div>
                </div>

                <div className="space-y-2 min-w-0">
                  <label className="text-xs font-medium text-muted-foreground">Tip invitat</label>
                  <select
                    className="w-full h-11 rounded-md border border-input bg-background text-foreground text-sm font-medium px-3 shadow-sm focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    value={newGuestType}
                    onChange={(e) => setNewGuestType(e.target.value)}
                    disabled={isLocked || !isEventActive}
                  >
                    <option value="adult">Adult (Single)</option>
                    <option value="couple">Cuplu</option>
                    <option value="family">Familie</option>
                    <option value="child">Copil</option>
                  </select>
                </div>

                <Button
                  type="submit"
                  size="sm"
                  disabled={isAdding || isLocked || !isEventActive}
                  className="w-full xl:w-auto xl:px-6 h-11"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  Adauga
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="gap-3">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="space-y-1">
                  <CardTitle className="text-lg">Invitati ({guests.length})</CardTitle>
                  <CardDescription>Lista separata, cu scroll automat pe continut mare.</CardDescription>
                </div>
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cauta invitat..."
                    className="pl-8"
                    value={filter}
                    onChange={(e: any) => setFilter(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border bg-background overflow-hidden">
                <div className="w-full overflow-x-auto">
                  <div className="max-h-[62vh] overflow-y-auto">
                    <table className="w-full min-w-[920px] caption-bottom text-sm text-left">
                      <thead className="sticky top-0 z-10 bg-background [&_tr]:border-b">
                        <tr className="border-b">
                          <th className="h-9 px-3 align-middle font-medium text-muted-foreground w-[42px]">#</th>
                          <th className="h-9 px-3 align-middle font-medium text-muted-foreground w-[220px]">Nume</th>
                          <th className="h-9 px-3 align-middle font-medium text-muted-foreground">Link / Sursa</th>
                          <th className="h-9 px-3 align-middle font-medium text-muted-foreground w-[108px]">Status</th>
                          <th className="h-9 px-3 align-middle font-medium text-muted-foreground w-[190px]">Detalii RSVP</th>
                          <th className="h-9 px-3 align-middle font-medium text-muted-foreground text-right w-[112px] whitespace-nowrap">Actiuni</th>
                        </tr>
                      </thead>
                      <tbody className="[&_tr:last-child]:border-0">
                        {isLoading ? (
                          <tr>
                            <td colSpan={6} className="p-8 text-center text-muted-foreground">
                              Se incarca lista de invitati...
                            </td>
                          </tr>
                        ) : filteredGuests.length > 0 ? (
                          filteredGuests.map((guest, idx) => {
                            const fullInviteUrl = `${inviteBaseUrl}${guest.token}`;
                            const isPublicSource = guest.source === "public";
                            const rsvp = guest.rsvp;

                            return (
                              <tr key={guest._id} className="border-b transition-colors hover:bg-muted/40">
                                <td className="px-3 py-2.5 align-top font-mono text-xs text-muted-foreground">{idx + 1}</td>
                                <td className="px-3 py-2.5 align-top">
                                  <div className="flex items-center gap-2 font-medium">
                                    <div className="p-1.5 bg-muted rounded-full shrink-0">{getTypeIcon(guest.type)}</div>
                                    <div className="min-w-0 space-y-1">
                                      <p className="break-words leading-snug">{guest.name}</p>
                                      {isPublicSource && (
                                        <span
                                          className="inline-flex items-center rounded-full bg-indigo-50 px-1.5 py-0.5 text-[10px] font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10 dark:bg-indigo-400/10 dark:text-indigo-300 dark:ring-indigo-400/20"
                                          title="Venit din Link Public"
                                        >
                                          <Globe className="w-3 h-3 mr-1" /> Public
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-3 py-2.5 align-top">
                                  {isPublicSource ? (
                                    <span className="text-xs text-muted-foreground italic break-words">Inregistrat via Public Link</span>
                                  ) : (
                                    <div
                                      data-slot="input-group"
                                      className={cn(
                                        "group/input-group relative flex h-9 w-full max-w-md items-center rounded-lg border border-input bg-background shadow-sm transition-colors focus-within:ring-1 focus-within:ring-ring",
                                        !isEventActive && "opacity-60",
                                      )}
                                    >
                                      <div className="flex items-center justify-center pl-2 pr-1 text-muted-foreground border-r border-border/50 mr-1 h-full">
                                        <LinkIcon className="w-3.5 h-3.5" />
                                      </div>
                                      <div className="flex items-center text-xs text-muted-foreground select-none px-1 bg-muted/30 h-full overflow-hidden whitespace-nowrap">
                                        .../invite/
                                      </div>
                                      <input
                                        readOnly
                                        className="flex-1 min-w-0 bg-transparent px-1 text-xs font-mono text-foreground focus:outline-none truncate"
                                        value={guest.token}
                                        disabled={!isEventActive}
                                      />
                                      <button
                                        type="button"
                                        onClick={() => copyToClipboard(fullInviteUrl, guest.token, guest._id, !!guest.isSent)}
                                        className="flex items-center justify-center h-full px-2.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-r-lg transition-colors border-l border-border/50"
                                        title="Copiaza Link"
                                        disabled={!isEventActive}
                                      >
                                        {copiedToken === guest.token ? (
                                          <Check className="w-3.5 h-3.5 text-green-500" />
                                        ) : (
                                          <Copy className="w-3.5 h-3.5" />
                                        )}
                                      </button>
                                    </div>
                                  )}
                                </td>
                                <td className="px-3 py-2.5 align-top">{getStatusBadge(guest.status, guest.openedAt, guest.isSent)}</td>
                                <td className="px-3 py-2.5 align-top">
                                  <div className="flex flex-col gap-1.5 min-w-0">
                                    {guest.status === "confirmed" && rsvp && (
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <div title="Adulti" className="flex items-center gap-1 text-xs font-medium bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-700 dark:text-zinc-300">
                                          <Users className="w-3 h-3" />
                                          {(rsvp.adultsCount !== undefined) ? rsvp.adultsCount : (rsvp.confirmedCount || 1)}
                                        </div>
                                        {(rsvp.childrenCount || (rsvp.hasChildren && !rsvp.childrenCount)) && (
                                          <div title="Copii" className="flex items-center gap-1 text-xs bg-pink-50 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300 px-1.5 py-0.5 rounded border border-pink-100 dark:border-pink-900">
                                            <Baby className="w-3 h-3" />
                                            {rsvp.childrenCount ? rsvp.childrenCount : "Da"}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                    {guest.rsvp?.message && (
                                      <div className="flex items-start gap-1 text-xs text-muted-foreground mt-1">
                                        <MessageSquare className="w-3 h-3 mt-0.5 shrink-0" />
                                        <span className="italic break-words whitespace-normal">"{guest.rsvp.message}"</span>
                                      </div>
                                    )}
                                  </div>
                                </td>
                                <td className="px-3 py-2.5 align-top text-right">
                                  <div className="flex justify-end gap-1 flex-nowrap whitespace-nowrap">
                                    {!isPublicSource && (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className={cn("h-7 w-7", guest.isSent ? "text-amber-500 hover:text-amber-600 hover:bg-amber-50" : "text-zinc-300 hover:text-zinc-500 hover:bg-zinc-100")}
                                        onClick={() => toggleSentStatus(guest._id, !!guest.isSent)}
                                        title={guest.isSent ? "Marcat ca Trimis" : "Marcheaza ca Trimis"}
                                        disabled={!isEventActive}
                                      >
                                        <Send className="w-3.5 h-3.5" />
                                      </Button>
                                    )}
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50" disabled={!isEventActive}>
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Stergi acest invitat?</AlertDialogTitle>
                                          <AlertDialogDescription>Aceasta actiune nu poate fi anulata. Link-ul va deveni invalid.</AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Anuleaza</AlertDialogCancel>
                                          <AlertDialogAction onClick={() => handleDeleteGuest(guest._id)} className="bg-red-600">Sterge</AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 text-blue-500 hover:bg-blue-50"
                                      onClick={() => simulateOpenInvite(guest.token)}
                                      title="Simuleaza vizualizarea"
                                    >
                                      <ExternalLink className="w-3.5 h-3.5" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={6} className="p-10 text-center text-muted-foreground">
                              Niciun invitat gasit. Adauga unul din formularul de mai sus.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default GuestListView;
