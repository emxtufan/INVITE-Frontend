import React, { useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ImagePlus,
  Loader2,
  Plus,
  Save,
  Trash2,
  Upload,
} from "lucide-react";
import {
  defaultLandingProcessConfig,
  type LandingProcessConfig,
  type LandingProcessStep,
} from "../LandingPage";
import { API_URL } from "../constants";
import { resolveMediaUrl } from "../config/api";
import Button from "../components/ui/button";
import Input from "../components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { useToast } from "../components/ui/use-toast";
import { cn } from "../lib/utils";

const cloneDefaultConfig = (): LandingProcessConfig => ({
  ...defaultLandingProcessConfig,
  steps: defaultLandingProcessConfig.steps.map((step) => ({
    ...step,
    points: [...step.points],
  })),
});

const LandingProcessManagement = ({ token }: { token: string }) => {
  const { toast } = useToast();
  const [config, setConfig] =
    useState<LandingProcessConfig>(cloneDefaultConfig);
  const [expandedStepId, setExpandedStepId] = useState<string | null>(
    defaultLandingProcessConfig.steps[0]?.id || null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    fetch(`${API_URL}/admin/config/landing-process`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data?.error || "Nu am putut incarca pasii.");
        }
        return data;
      })
      .then((data) => {
        if (!isActive || !Array.isArray(data?.steps) || data.steps.length === 0) {
          return;
        }
        setConfig(data);
        setExpandedStepId(data.steps[0]?.id || null);
      })
      .catch((error) => {
        if (!isActive) return;
        toast({
          title: "Eroare",
          description: error.message,
          variant: "destructive",
        });
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [token, toast]);

  const updateGeneral = (
    field: Exclude<keyof LandingProcessConfig, "steps">,
    value: string,
  ) => {
    setConfig((current) => ({ ...current, [field]: value }));
  };

  const updateStep = (
    id: string,
    changes: Partial<LandingProcessStep>,
  ) => {
    setConfig((current) => ({
      ...current,
      steps: current.steps.map((step) =>
        step.id === id ? { ...step, ...changes } : step,
      ),
    }));
  };

  const addStep = () => {
    const id = `process-step-${Date.now()}`;
    const step: LandingProcessStep = {
      id,
      label: "",
      title: "",
      description: "",
      videoSrc: "",
      posterSrc: "",
      background: "#edf7fb",
      points: [],
    };

    setConfig((current) => ({
      ...current,
      steps: [...current.steps, step],
    }));
    setExpandedStepId(id);
  };

  const removeStep = (id: string) => {
    if (config.steps.length <= 1) {
      toast({
        title: "Pasul nu poate fi sters",
        description: "Sectiunea trebuie sa pastreze cel putin un pas.",
        variant: "destructive",
      });
      return;
    }

    setConfig((current) => ({
      ...current,
      steps: current.steps.filter((step) => step.id !== id),
    }));
    if (expandedStepId === id) setExpandedStepId(null);
  };

  const moveStep = (index: number, direction: -1 | 1) => {
    setConfig((current) => {
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= current.steps.length) {
        return current;
      }
      const steps = [...current.steps];
      [steps[index], steps[targetIndex]] = [
        steps[targetIndex],
        steps[index],
      ];
      return { ...current, steps };
    });
  };

  const uploadMedia = async (
    stepId: string,
    field: "videoSrc" | "posterSrc",
    file: File,
  ) => {
    if (file.size > 200 * 1024 * 1024) {
      toast({
        title: "Fisier prea mare",
        description:
          "Limita este 200 MB. Pentru animatii mari, converteste GIF-ul in WebM.",
        variant: "destructive",
      });
      return;
    }

    const uploadKey = `${stepId}-${field}`;
    setUploadingField(uploadKey);

    try {
      const form = new FormData();
      form.append("file", file);
      const response = await fetch(`${API_URL}/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.url) {
        throw new Error(data?.error || "Upload esuat.");
      }
      updateStep(stepId, { [field]: String(data.url) });
    } catch (error: any) {
      toast({
        title: "Upload esuat",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploadingField(null);
    }
  };

  const saveConfig = async () => {
    const missingGeneral =
      !config.eyebrow.trim() ||
      !config.introDescription.trim() ||
      !config.title.trim() ||
      !config.ctaLabel.trim();
    const invalidStep = config.steps.find(
      (step) =>
        !step.id.trim() ||
        !step.label.trim() ||
        !step.title.trim() ||
        !step.description.trim() ||
        !step.videoSrc.trim(),
    );

    if (missingGeneral || invalidStep) {
      toast({
        title: "Date incomplete",
        description:
          "Completeaza textele sectiunii si campurile obligatorii ale fiecarui pas.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(
        `${API_URL}/admin/config/landing-process`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(config),
        },
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error || "Salvarea a esuat.");
      }
      const { success: _success, ...savedConfig } = data;
      setConfig(savedConfig);
      toast({
        title: "Pasii au fost salvati",
        description: "Landing page va folosi noua configurare.",
        variant: "success",
      });
    } catch (error: any) {
      toast({
        title: "Eroare la salvare",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Se incarca pasii...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Pasii de pe landing page
          </h2>
          <p className="text-sm text-muted-foreground">
            Editeaza textele generale si continutul fiecarui pas.
          </p>
        </div>
        <Button onClick={saveConfig} disabled={isSaving || Boolean(uploadingField)}>
          {isSaving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Salveaza pasii
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Textele sectiunii</CardTitle>
          <CardDescription>
            Aceste texte apar deasupra cardurilor cu pasi.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Text mic">
            <Input
              value={config.eyebrow}
              onChange={(event) =>
                updateGeneral("eyebrow", event.target.value)
              }
            />
          </Field>
          <Field label="Text buton">
            <Input
              value={config.ctaLabel}
              onChange={(event) =>
                updateGeneral("ctaLabel", event.target.value)
              }
            />
          </Field>
          <Field label="Titlu mare" className="sm:col-span-2">
            <Input
              value={config.title}
              onChange={(event) =>
                updateGeneral("title", event.target.value)
              }
            />
          </Field>
          <Field label="Descriere introductiva" className="sm:col-span-2">
            <textarea
              value={config.introDescription}
              onChange={(event) =>
                updateGeneral("introDescription", event.target.value)
              }
              className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </Field>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {config.steps.map((step, index) => {
          const isExpanded = expandedStepId === step.id;
          return (
            <Card key={step.id}>
              <CardHeader className="p-4">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedStepId(isExpanded ? null : step.id)
                    }
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  >
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                      style={{ backgroundColor: step.background }}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">
                        {step.title || "Pas fara titlu"}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {step.label || "Fara eticheta"}
                      </span>
                    </span>
                    <ChevronDown
                      className={cn(
                        "ml-auto h-4 w-4 shrink-0 transition-transform",
                        isExpanded && "rotate-180",
                      )}
                    />
                  </button>

                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      disabled={index === 0}
                      onClick={() => moveStep(index, -1)}
                      title="Muta mai sus"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      disabled={index === config.steps.length - 1}
                      onClick={() => moveStep(index, 1)}
                      title="Muta mai jos"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeStep(step.id)}
                      className="text-red-600 hover:bg-red-50 hover:text-red-700"
                      title="Sterge pasul"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="grid gap-5 border-t pt-5 lg:grid-cols-[220px_1fr]">
                  <ProcessMediaPreview step={step} />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Eticheta pasului">
                      <Input
                        value={step.label}
                        onChange={(event) =>
                          updateStep(step.id, { label: event.target.value })
                        }
                      />
                    </Field>
                    <Field label="ID unic">
                      <Input
                        value={step.id}
                        onChange={(event) => {
                          const nextId = event.target.value;
                          updateStep(step.id, { id: nextId });
                          setExpandedStepId(nextId);
                        }}
                      />
                    </Field>
                    <Field label="Titlu" className="sm:col-span-2">
                      <Input
                        value={step.title}
                        onChange={(event) =>
                          updateStep(step.id, { title: event.target.value })
                        }
                      />
                    </Field>
                    <Field label="Descriere" className="sm:col-span-2">
                      <textarea
                        value={step.description}
                        onChange={(event) =>
                          updateStep(step.id, {
                            description: event.target.value,
                          })
                        }
                        className="min-h-[90px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                      />
                    </Field>
                    <Field label="Culoare fundal">
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={step.background}
                          onChange={(event) =>
                            updateStep(step.id, {
                              background: event.target.value,
                            })
                          }
                          className="h-10 w-12 cursor-pointer rounded-md border border-input bg-background p-1"
                        />
                        <Input
                          value={step.background}
                          onChange={(event) =>
                            updateStep(step.id, {
                              background: event.target.value,
                            })
                          }
                        />
                      </div>
                    </Field>
                    <Field label="Etichete scurte">
                      <Input
                        value={step.points.join(", ")}
                        placeholder="Ex: Configurare rapida, Totul intr-un loc"
                        onChange={(event) =>
                          updateStep(step.id, {
                            points: event.target.value
                              .split(",")
                              .map((point) => point.trim())
                              .filter(Boolean),
                          })
                        }
                      />
                    </Field>
                    <Field label="GIF sau video" className="sm:col-span-2">
                      <div className="flex gap-2">
                        <Input
                          value={step.videoSrc}
                          placeholder="/uploads/... sau URL"
                          onChange={(event) =>
                            updateStep(step.id, {
                              videoSrc: event.target.value,
                            })
                          }
                        />
                        <UploadButton
                          busy={uploadingField === `${step.id}-videoSrc`}
                          accept="image/gif,video/mp4,video/webm"
                          onFile={(file) =>
                            uploadMedia(step.id, "videoSrc", file)
                          }
                        />
                      </div>
                    </Field>
                    <Field label="Imagine poster" className="sm:col-span-2">
                      <div className="flex gap-2">
                        <Input
                          value={step.posterSrc || ""}
                          placeholder="/uploads/... sau URL"
                          onChange={(event) =>
                            updateStep(step.id, {
                              posterSrc: event.target.value,
                            })
                          }
                        />
                        <UploadButton
                          busy={uploadingField === `${step.id}-posterSrc`}
                          accept="image/jpeg,image/png,image/webp,image/avif"
                          onFile={(file) =>
                            uploadMedia(step.id, "posterSrc", file)
                          }
                        />
                      </div>
                    </Field>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      <Button variant="outline" onClick={addStep} className="w-full">
        <Plus className="mr-2 h-4 w-4" />
        Adauga un pas
      </Button>
    </div>
  );
};

const ProcessMediaPreview = ({ step }: { step: LandingProcessStep }) => {
  const mediaUrl = resolveMediaUrl(step.videoSrc);
  const posterUrl = resolveMediaUrl(step.posterSrc || "");
  const isGif = /\.gif(?:$|\?)/i.test(mediaUrl || "");

  return (
    <div
      className="overflow-hidden rounded-2xl border bg-black"
      style={{ backgroundColor: step.background }}
    >
      <div className="flex aspect-video items-center justify-center p-2">
        {mediaUrl ? (
          isGif ? (
            <img
              src={mediaUrl}
              alt=""
              className="h-full w-full rounded-xl object-contain"
            />
          ) : (
            <video
              src={mediaUrl}
              poster={posterUrl || undefined}
              className="h-full w-full rounded-xl object-contain"
              muted
              loop
              autoPlay
              playsInline
            />
          )
        ) : (
          <ImagePlus className="h-8 w-8 text-zinc-500" />
        )}
      </div>
    </div>
  );
};

const Field = ({
  label,
  className = "",
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) => (
  <label className={`space-y-2 ${className}`}>
    <span className="text-sm font-medium">{label}</span>
    {children}
  </label>
);

const UploadButton = ({
  busy,
  accept,
  onFile,
}: {
  busy: boolean;
  accept: string;
  onFile: (file: File) => void;
}) => (
  <label className="inline-flex h-10 shrink-0 cursor-pointer items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium hover:bg-accent">
    {busy ? (
      <Loader2 className="h-4 w-4 animate-spin" />
    ) : (
      <Upload className="h-4 w-4" />
    )}
    <input
      type="file"
      accept={accept}
      disabled={busy}
      className="hidden"
      onChange={(event) => {
        const file = event.target.files?.[0];
        if (file) onFile(file);
        event.currentTarget.value = "";
      }}
    />
  </label>
);

export default LandingProcessManagement;
