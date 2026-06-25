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
  defaultLandingSupplierShowcaseConfig,
  type LandingSupplierShowcaseConfig,
  type LandingSupplierShowcaseItem,
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

const cloneDefaultConfig = (): LandingSupplierShowcaseConfig => ({
  ...defaultLandingSupplierShowcaseConfig,
  tags: [...defaultLandingSupplierShowcaseConfig.tags],
  items: defaultLandingSupplierShowcaseConfig.items.map((item) => ({
    ...item,
  })),
});

const LandingSupplierShowcaseManagement = ({
  token,
}: {
  token: string;
}) => {
  const { toast } = useToast();
  const [config, setConfig] =
    useState<LandingSupplierShowcaseConfig>(cloneDefaultConfig);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(
    defaultLandingSupplierShowcaseConfig.items[0]?.id || null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingItemId, setUploadingItemId] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    fetch(`${API_URL}/admin/config/landing-supplier-showcase`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data?.error || "Nu am putut incarca showcase-ul.");
        }
        return data;
      })
      .then((data) => {
        if (!isActive || !Array.isArray(data?.items) || data.items.length < 2) {
          return;
        }
        setConfig(data);
        setExpandedItemId(data.items[0]?.id || null);
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

  const updateText = (
    field: Exclude<keyof LandingSupplierShowcaseConfig, "tags" | "items">,
    value: string,
  ) => {
    setConfig((current) => ({ ...current, [field]: value }));
  };

  const updateItem = (
    id: string,
    changes: Partial<LandingSupplierShowcaseItem>,
  ) => {
    setConfig((current) => ({
      ...current,
      items: current.items.map((item) =>
        item.id === id ? { ...item, ...changes } : item,
      ),
    }));
  };

  const addItem = () => {
    const id = `supplier-${Date.now()}`;
    const item: LandingSupplierShowcaseItem = {
      id,
      title: "",
      category: "",
      note: "",
      image: "",
      accent: "#ffede3",
    };

    setConfig((current) => ({
      ...current,
      items: [...current.items, item],
    }));
    setExpandedItemId(id);
  };

  const removeItem = (id: string) => {
    if (config.items.length <= 2) {
      toast({
        title: "Cardul nu poate fi sters",
        description:
          "Showcase-ul are nevoie de cel putin doua carduri pentru cele doua coloane.",
        variant: "destructive",
      });
      return;
    }

    setConfig((current) => ({
      ...current,
      items: current.items.filter((item) => item.id !== id),
    }));
    if (expandedItemId === id) setExpandedItemId(null);
  };

  const moveItem = (index: number, direction: -1 | 1) => {
    setConfig((current) => {
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= current.items.length) {
        return current;
      }
      const items = [...current.items];
      [items[index], items[targetIndex]] = [
        items[targetIndex],
        items[index],
      ];
      return { ...current, items };
    });
  };

  const uploadImage = async (itemId: string, file: File) => {
    if (file.size > 200 * 1024 * 1024) {
      toast({
        title: "Fisier prea mare",
        description: "Limita pentru upload este 200 MB.",
        variant: "destructive",
      });
      return;
    }

    setUploadingItemId(itemId);
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
      updateItem(itemId, { image: String(data.url) });
    } catch (error: any) {
      toast({
        title: "Upload esuat",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploadingItemId(null);
    }
  };

  const saveConfig = async () => {
    const missingText = [
      config.sectionEyebrow,
      config.sectionTitle,
      config.sectionDescription,
      config.eyebrow,
      config.title,
      config.description,
    ].some((value) => !value.trim());
    const invalidItem = config.items.find(
      (item) =>
        !item.id.trim() ||
        !item.title.trim() ||
        !item.category.trim() ||
        !item.note.trim() ||
        !item.image.trim(),
    );

    if (missingText || invalidItem) {
      toast({
        title: "Date incomplete",
        description:
          "Completeaza textele sectiunii si campurile obligatorii ale fiecarui card.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(
        `${API_URL}/admin/config/landing-supplier-showcase`,
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
        title: "Showcase salvat",
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
        Se incarca showcase-ul...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Furnizori & inspiratie
          </h2>
          <p className="text-sm text-muted-foreground">
            Editeaza textele, tagurile si cardurile infinite scroll.
          </p>
        </div>
        <Button onClick={saveConfig} disabled={isSaving || Boolean(uploadingItemId)}>
          {isSaving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Salveaza showcase-ul
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Textele sectiunii</CardTitle>
          <CardDescription>
            Primul grup apare deasupra, al doilea in interiorul showcase-ului.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Text mic exterior">
            <Input
              value={config.sectionEyebrow}
              onChange={(event) =>
                updateText("sectionEyebrow", event.target.value)
              }
            />
          </Field>
          <Field label="Text mic interior">
            <Input
              value={config.eyebrow}
              onChange={(event) => updateText("eyebrow", event.target.value)}
            />
          </Field>
          <Field label="Titlu exterior" className="sm:col-span-2">
            <Input
              value={config.sectionTitle}
              onChange={(event) =>
                updateText("sectionTitle", event.target.value)
              }
            />
          </Field>
          <Field label="Descriere exterioara" className="sm:col-span-2">
            <TextArea
              value={config.sectionDescription}
              onChange={(value) => updateText("sectionDescription", value)}
            />
          </Field>
          <Field label="Titlu interior" className="sm:col-span-2">
            <Input
              value={config.title}
              onChange={(event) => updateText("title", event.target.value)}
            />
          </Field>
          <Field label="Descriere interioara" className="sm:col-span-2">
            <TextArea
              value={config.description}
              onChange={(value) => updateText("description", value)}
            />
          </Field>
          <Field label="Taguri, separate prin virgula" className="sm:col-span-2">
            <Input
              value={config.tags.join(", ")}
              onChange={(event) =>
                setConfig((current) => ({
                  ...current,
                  tags: event.target.value
                    .split(",")
                    .map((tag) => tag.trim())
                    .filter(Boolean),
                }))
              }
            />
          </Field>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {config.items.map((item, index) => {
          const isExpanded = expandedItemId === item.id;
          return (
            <Card key={item.id}>
              <CardHeader className="p-4">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedItemId(isExpanded ? null : item.id)
                    }
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  >
                    <span
                      className="h-10 w-10 shrink-0 rounded-xl border bg-cover bg-center"
                      style={{
                        backgroundColor: item.accent,
                        backgroundImage: item.image
                          ? `url("${resolveMediaUrl(item.image)}")`
                          : undefined,
                      }}
                    />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">
                        {item.title || "Card fara titlu"}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        Coloana {(index % 2) + 1} ·{" "}
                        {item.category || "Fara categorie"}
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
                      onClick={() => moveItem(index, -1)}
                      title="Muta mai sus"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      disabled={index === config.items.length - 1}
                      onClick={() => moveItem(index, 1)}
                      title="Muta mai jos"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeItem(item.id)}
                      className="text-red-600 hover:bg-red-50 hover:text-red-700"
                      title="Sterge cardul"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="grid gap-5 border-t pt-5 lg:grid-cols-[200px_1fr]">
                  <div
                    className="overflow-hidden rounded-2xl border"
                    style={{ backgroundColor: item.accent }}
                  >
                    <div className="flex aspect-[0.92/1] items-center justify-center">
                      {item.image ? (
                        <img
                          src={resolveMediaUrl(item.image)}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <ImagePlus className="h-8 w-8 text-zinc-500" />
                      )}
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Titlu">
                      <Input
                        value={item.title}
                        onChange={(event) =>
                          updateItem(item.id, { title: event.target.value })
                        }
                      />
                    </Field>
                    <Field label="ID unic">
                      <Input
                        value={item.id}
                        onChange={(event) => {
                          const nextId = event.target.value;
                          updateItem(item.id, { id: nextId });
                          setExpandedItemId(nextId);
                        }}
                      />
                    </Field>
                    <Field label="Categorie">
                      <Input
                        value={item.category}
                        onChange={(event) =>
                          updateItem(item.id, { category: event.target.value })
                        }
                      />
                    </Field>
                    <Field label="Culoare badge">
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={item.accent}
                          onChange={(event) =>
                            updateItem(item.id, { accent: event.target.value })
                          }
                          className="h-10 w-12 cursor-pointer rounded-md border border-input bg-background p-1"
                        />
                        <Input
                          value={item.accent}
                          onChange={(event) =>
                            updateItem(item.id, { accent: event.target.value })
                          }
                        />
                      </div>
                    </Field>
                    <Field label="Descriere card" className="sm:col-span-2">
                      <TextArea
                        value={item.note}
                        onChange={(value) =>
                          updateItem(item.id, { note: value })
                        }
                      />
                    </Field>
                    <Field label="Imagine" className="sm:col-span-2">
                      <div className="flex gap-2">
                        <Input
                          value={item.image}
                          placeholder="/uploads/... sau URL"
                          onChange={(event) =>
                            updateItem(item.id, { image: event.target.value })
                          }
                        />
                        <UploadButton
                          busy={uploadingItemId === item.id}
                          onFile={(file) => uploadImage(item.id, file)}
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

      <Button variant="outline" onClick={addItem} className="w-full">
        <Plus className="mr-2 h-4 w-4" />
        Adauga un card
      </Button>
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

const TextArea = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) => (
  <textarea
    value={value}
    onChange={(event) => onChange(event.target.value)}
    className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
  />
);

const UploadButton = ({
  busy,
  onFile,
}: {
  busy: boolean;
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
      accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
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

export default LandingSupplierShowcaseManagement;
