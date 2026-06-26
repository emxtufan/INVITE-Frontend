import React, { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Baby,
  BedDouble,
  Check,
  MessageSquare,
  Minus,
  Plus,
  User,
  UserX,
  Utensils,
  X,
} from "lucide-react";

type MenuType = "standard" | "vegetarian" | "vegan" | "kids";

interface RsvpParticipant {
  id: string;
  type: "adult" | "child";
  label: string;
  menuType: MenuType;
  allergies: string;
}

interface RsvpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  guestName: string;
  isPublic?: boolean;
}

const createParticipant = (
  type: "adult" | "child",
  index: number,
  initialLabel = "",
): RsvpParticipant => ({
  id: `${type}-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7)}`,
  type,
  label: initialLabel,
  menuType: type === "adult" ? "standard" : "kids",
  allergies: "",
});

const menuOptions: Record<
  RsvpParticipant["type"],
  Array<{ value: MenuType; label: string }>
> = {
  adult: [
    { value: "standard", label: "Normal" },
    { value: "vegetarian", label: "Vegetarian" },
    { value: "vegan", label: "Vegan" },
  ],
  child: [
    { value: "kids", label: "Meniu copil" },
    { value: "standard", label: "Normal" },
    { value: "vegetarian", label: "Vegetarian" },
    { value: "vegan", label: "Vegan" },
  ],
};

const RsvpModal: React.FC<RsvpModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  guestName,
  isPublic,
}) => {
  const [status, setStatus] = useState<"confirmed" | "declined" | null>(null);
  const [participants, setParticipants] = useState<RsvpParticipant[]>([
    createParticipant("adult", 0, isPublic ? "" : guestName),
  ]);
  const [needsAccommodation, setNeedsAccommodation] = useState<boolean | null>(
    null,
  );
  const [message, setMessage] = useState("");
  const [publicName, setPublicName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const previousAutoLabelRef = useRef(isPublic ? "" : guestName.trim());

  const adults = participants.filter(
    (participant) => participant.type === "adult",
  ).length;
  const children = participants.filter(
    (participant) => participant.type === "child",
  ).length;

  const getAutoParticipantLabel = () =>
    (isPublic ? publicName : guestName).trim();

  useEffect(() => {
    const previousAutoLabel = previousAutoLabelRef.current;
    const nextAutoLabel = getAutoParticipantLabel();
    previousAutoLabelRef.current = nextAutoLabel;

    setParticipants((current) => {
      if (current.length !== 1) return current;

      const [onlyParticipant] = current;
      const currentLabel = onlyParticipant.label.trim();
      const canUseAutoLabel =
        !currentLabel || currentLabel === previousAutoLabel;

      if (!canUseAutoLabel || onlyParticipant.label === nextAutoLabel) {
        return current;
      }

      return [{ ...onlyParticipant, label: nextAutoLabel }];
    });
  }, [guestName, isPublic, publicName]);

  if (!isOpen) return null;

  const changeParticipantCount = (
    type: RsvpParticipant["type"],
    delta: number,
  ) => {
    setParticipants((current) => {
      const autoLabel = getAutoParticipantLabel();
      const removeAutoFilledLabels = (items: RsvpParticipant[]) =>
        items.map((participant) =>
          autoLabel && participant.label.trim() === autoLabel
            ? { ...participant, label: "" }
            : participant,
        );
      const applySinglePersonAutoLabel = (items: RsvpParticipant[]) =>
        items.length === 1 && autoLabel && !items[0].label.trim()
          ? [{ ...items[0], label: autoLabel }]
          : items;
      const sameType = current.filter(
        (participant) => participant.type === type,
      );
      const minimum = type === "adult" ? 1 : 0;
      const nextCount = Math.max(minimum, sameType.length + delta);

      if (nextCount === sameType.length) return current;
      if (nextCount > sameType.length) {
        const newParticipant = createParticipant(type, sameType.length);
        let nextParticipants: RsvpParticipant[];

        if (type === "adult") {
          nextParticipants = [
            ...current.filter((participant) => participant.type === "adult"),
            newParticipant,
            ...current.filter((participant) => participant.type === "child"),
          ];
        } else {
          nextParticipants = [...current, newParticipant];
        }

        return nextParticipants.length > 1
          ? removeAutoFilledLabels(nextParticipants)
          : applySinglePersonAutoLabel(nextParticipants);
      }

      const idToRemove = sameType[sameType.length - 1]?.id;
      const nextParticipants = current.filter(
        (participant) => participant.id !== idToRemove,
      );

      return nextParticipants.length > 1
        ? removeAutoFilledLabels(nextParticipants)
        : applySinglePersonAutoLabel(nextParticipants);
    });
  };

  const updateParticipant = (
    participantId: string,
    changes: Partial<Pick<RsvpParticipant, "label" | "menuType" | "allergies">>,
  ) => {
    setParticipants((current) =>
      current.map((participant) =>
        participant.id === participantId
          ? { ...participant, ...changes }
          : participant,
      ),
    );
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!status || (isPublic && !publicName.trim())) return;
    if (status === "confirmed" && needsAccommodation === null) return;
    if (
      status === "confirmed" &&
      participants.some((participant) => !participant.label.trim())
    ) {
      return;
    }

    const submittedParticipants =
      status === "confirmed"
        ? participants.map((participant) => ({
            ...participant,
            label: participant.label.trim(),
            allergies: participant.allergies.trim(),
          }))
        : [];
    const vegetarianCount = submittedParticipants.filter(
      (participant) => participant.menuType === "vegetarian",
    ).length;
    const veganCount = submittedParticipants.filter(
      (participant) => participant.menuType === "vegan",
    ).length;
    const allergySummary = submittedParticipants
      .filter((participant) => participant.allergies.trim())
      .map(
        (participant) =>
          `${participant.label}: ${participant.allergies.trim()}`,
      )
      .join(" | ");

    setIsSubmitting(true);
    try {
      await onSubmit({
        status,
        name: isPublic ? publicName : undefined,
        rsvpData: {
          confirmedCount:
            status === "confirmed" ? submittedParticipants.length : 0,
          adultsCount: status === "confirmed" ? adults : 0,
          childrenCount: status === "confirmed" ? children : 0,
          hasChildren: status === "confirmed" && children > 0,
          dietary:
            status === "confirmed" &&
            (vegetarianCount > 0 || veganCount > 0)
              ? "special"
              : "standard",
          vegetarianCount: status === "confirmed" ? vegetarianCount : 0,
          veganCount: status === "confirmed" ? veganCount : 0,
          allergies: status === "confirmed" ? allergySummary : "",
          participants: submittedParticipants,
          needsAccommodation:
            status === "confirmed" ? needsAccommodation === true : false,
          message,
        },
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSubmitDisabled =
    !status ||
    isSubmitting ||
    (isPublic && !publicName.trim()) ||
    (status === "confirmed" &&
      (needsAccommodation === null ||
        participants.some((participant) => !participant.label.trim())));

  return (
    <div className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-black/60 p-4 backdrop-blur-sm duration-200 fade-in">
      <div className="max-h-[calc(100vh-2rem)] w-full max-w-lg animate-in overflow-y-auto rounded-xl bg-white text-black shadow-2xl duration-200 zoom-in-95">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-200 bg-white p-5 sm:p-6">
          <div>
            <h2 className="text-xl font-bold text-black">
              Confirmare Prezenta
            </h2>
            <p className="text-sm text-black/65">
              {isPublic ? (
                "Te rugam sa completezi detaliile."
              ) : (
                <>
                  pentru{" "}
                  <span className="font-semibold text-black">{guestName}</span>
                </>
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-black transition-colors hover:bg-zinc-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 bg-white p-5 text-black sm:p-6"
        >
          {isPublic && (
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium">
                <User className="h-4 w-4" />
                Numele tau / familia ta
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Popescu Ion sau Familia Ionescu"
                className="h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-black placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-black"
                value={publicName}
                onChange={(event) => setPublicName(event.target.value)}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => setStatus("confirmed")}
              className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 p-4 transition-all ${
                status === "confirmed"
                  ? "border-green-500 bg-green-50"
                  : "border-zinc-200 bg-white hover:border-zinc-400"
              }`}
            >
              <span
                className={`rounded-full p-2 ${
                  status === "confirmed"
                    ? "bg-green-500 text-white"
                    : "bg-zinc-100 text-zinc-400"
                }`}
              >
                <Check className="h-5 w-5" />
              </span>
              <span className="font-semibold">Confirm</span>
            </button>

            <button
              type="button"
              onClick={() => setStatus("declined")}
              className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 p-4 transition-all ${
                status === "declined"
                  ? "border-red-500 bg-red-50"
                  : "border-zinc-200 bg-white hover:border-zinc-400"
              }`}
            >
              <span
                className={`rounded-full p-2 ${
                  status === "declined"
                    ? "bg-red-500 text-white"
                    : "bg-zinc-100 text-zinc-400"
                }`}
              >
                <UserX className="h-5 w-5" />
              </span>
              <span className="font-semibold">Nu pot ajunge</span>
            </button>
          </div>

          {status === "confirmed" && (
            <div className="space-y-5 animate-in fade-in slide-in-from-top-2">
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <ParticipantCounter
                  label="Adulti"
                  value={adults}
                  onMinus={() => changeParticipantCount("adult", -1)}
                  onPlus={() => changeParticipantCount("adult", 1)}
                />
                <ParticipantCounter
                  label="Copii"
                  value={children}
                  icon={<Baby className="h-3 w-3" />}
                  onMinus={() => changeParticipantCount("child", -1)}
                  onPlus={() => changeParticipantCount("child", 1)}
                />
              </div>

              <div className="space-y-3">
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-semibold">
                    <Utensils className="h-4 w-4 text-[#ff7633]" />
                    Meniul fiecarei persoane
                  </h3>
                  <p className="mt-1 text-xs text-black/55">
                    Scrie numele, selecteaza meniul si completeaza doar
                    alergiile care trebuie cunoscute.
                  </p>
                </div>

                {participants.map((participant) => (
                  <ParticipantCard
                    key={participant.id}
                    participant={participant}
                    onChange={(changes) =>
                      updateParticipant(participant.id, changes)
                    }
                  />
                ))}
              </div>

              <div className="space-y-3 rounded-xl border border-zinc-200 bg-white p-4">
                <label className="flex items-center gap-2 text-sm font-semibold">
                  <BedDouble className="h-4 w-4 text-[#ff7633]" />
                  Ai nevoie de cazare in ziua evenimentului?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <ChoiceButton
                    active={needsAccommodation === true}
                    onClick={() => setNeedsAccommodation(true)}
                  >
                    Da, doresc cazare
                  </ChoiceButton>
                  <ChoiceButton
                    active={needsAccommodation === false}
                    onClick={() => setNeedsAccommodation(false)}
                    neutral
                  >
                    Nu am nevoie
                  </ChoiceButton>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium">
              <MessageSquare className="h-4 w-4" />
              Mesaj pentru organizatori (optional)
            </label>
            <textarea
              className="min-h-[80px] w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-black placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-black"
              placeholder={
                status === "declined"
                  ? "Ne pare rau, dar..."
                  : "Abia asteptam sa ne vedem!"
              }
              value={message}
              onChange={(event) => setMessage(event.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitDisabled}
            className={`w-full rounded-lg py-3 font-bold text-black transition-all ${
              isSubmitDisabled
                ? "cursor-not-allowed bg-zinc-300"
                : "bg-[#ff7633] shadow-lg hover:bg-[#eb6727]"
            }`}
          >
            {isSubmitting ? "Se trimite..." : "Trimite raspunsul"}
          </button>
        </form>
      </div>
    </div>
  );
};

const ParticipantCounter = ({
  label,
  value,
  icon,
  onMinus,
  onPlus,
}: {
  label: string;
  value: number;
  icon?: React.ReactNode;
  onMinus: () => void;
  onPlus: () => void;
}) => (
  <div className="flex flex-col items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 p-3">
    <span className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-black/65">
      {icon}
      {label}
    </span>
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={onMinus}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-300 bg-white shadow-sm hover:bg-zinc-100"
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className="w-4 text-center text-xl font-bold">{value}</span>
      <button
        type="button"
        onClick={onPlus}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-300 bg-white shadow-sm hover:bg-zinc-100"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  </div>
);

const ParticipantCard = ({
  participant,
  onChange,
}: {
  participant: RsvpParticipant;
  onChange: (
    changes: Partial<Pick<RsvpParticipant, "label" | "menuType" | "allergies">>,
  ) => void;
}) => (
  <div className="space-y-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4 animate-in fade-in slide-in-from-top-2 duration-300">
    <div className="flex items-center gap-2">
      <span
        className={`flex h-8 w-8 items-center justify-center rounded-full ${
          participant.type === "child"
            ? "bg-pink-100 text-pink-700"
            : "bg-orange-100 text-orange-700"
        }`}
      >
        {participant.type === "child" ? (
          <Baby className="h-4 w-4" />
        ) : (
          <User className="h-4 w-4" />
        )}
      </span>
      <p className="text-sm font-bold">
        {participant.type === "adult" ? "Adult" : "Copil"}
      </p>
    </div>

    <label className="block space-y-1.5">
      <span className="text-xs font-semibold text-black/70">
        Numele persoanei <span className="text-red-500">*</span>
      </span>
      <input
        type="text"
        required
        className="h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm font-medium text-black placeholder:font-normal placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-black"
        placeholder={
          participant.type === "adult"
            ? "Ex: Andrei Popescu"
            : "Ex: Maria Popescu"
        }
        value={participant.label}
        onChange={(event) => onChange({ label: event.target.value })}
      />
    </label>

    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {menuOptions[participant.type].map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange({ menuType: option.value })}
          className={`rounded-lg border px-2 py-2 text-xs font-semibold transition-colors ${
            participant.menuType === option.value
              ? "border-[#ff7633] bg-[#fff1e9]"
              : "border-zinc-200 bg-white hover:border-zinc-400"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>

    <label className="block space-y-1.5">
      <span className="flex items-center gap-1.5 text-xs font-semibold text-black/70">
        <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
        Alergii sau intolerante
      </span>
      <input
        type="text"
        className="h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-black placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-black"
        placeholder="Ex: gluten, lactoza, arahide"
        value={participant.allergies}
        onChange={(event) => onChange({ allergies: event.target.value })}
      />
    </label>
  </div>
);

const ChoiceButton = ({
  active,
  onClick,
  neutral = false,
  children,
}: {
  active: boolean;
  onClick: () => void;
  neutral?: boolean;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`rounded-lg border-2 px-3 py-2 text-sm font-semibold transition-colors ${
      active
        ? neutral
          ? "border-black bg-zinc-100"
          : "border-[#ff7633] bg-[#fff1e9]"
        : "border-zinc-200 bg-white hover:border-zinc-400"
    }`}
  >
    {children}
  </button>
);

export default RsvpModal;
