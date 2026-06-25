import React, { useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  ImagePlus,
  Loader2,
  Plus,
  Save,
  Trash2,
  Upload,
} from "lucide-react";
import {
  featuredTemplateCategories,
  featuredTemplates,
  type FeaturedTemplateCategory,
  type FeaturedTemplateItem,
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

const cloneDefaultItems = () =>
  featuredTemplates.map((item) => ({ ...item }));

const LandingCarouselManagement = ({ token }: { token: string }) => {
  const { toast } = useToast();
  const [items, setItems] = useState<FeaturedTemplateItem[]>(
    cloneDefaultItems,
  );
  const [activeCategory, setActiveCategory] =
    useState<FeaturedTemplateCategory>("wedding");
  const [enabledCategories, setEnabledCategories] = useState<
    FeaturedTemplateCategory[]
  >(["wedding", "baptism", "anniversary"]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    fetch(`${API_URL}/admin/config/landing-featured-carousel`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data?.error || "Nu am putut incarca caruselul.");
        }
        return data;
      })
      .then((data) => {
        if (!isActive) return;
        if (Array.isArray(data?.items) && data.items.length > 0) {
          setItems(data.items);
        }
        if (
          Array.isArray(data?.enabledCollections) &&
          data.enabledCollections.length > 0
        ) {
          setEnabledCategories(data.enabledCollections);
        }
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

  const categoryItems = items.filter(
    (item) => item.collection === activeCategory,
  );

  const toggleCategoryVisibility = (
    category: FeaturedTemplateCategory,
  ) => {
    setEnabledCategories((current) => {
      if (current.includes(category)) {
        if (current.length === 1) {
          toast({
            title: "Pastreaza o categorie activa",
            description:
              "Caruselul trebuie sa afiseze cel putin o categorie.",
            variant: "destructive",
          });
          return current;
        }
        return current.filter((item) => item !== category);
      }
      return [...current, category];
    });
  };

  const updateItem = (
    id: string,
    changes: Partial<FeaturedTemplateItem>,
  ) => {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, ...changes } : item)),
    );
  };

  const addItem = () => {
    const categoryLabel =
      featuredTemplateCategories.find(
        (category) => category.id === activeCategory,
      )?.label || activeCategory;
    const id = `${activeCategory}-${Date.now()}`;

    setItems((current) => [
      ...current,
      {
        id,
        collection: activeCategory,
        title: "",
        category: categoryLabel,
        year: String(new Date().getFullYear()),
        previewSrc: "",
        posterSrc: "",
        summary: "",
        badge: null,
      },
    ]);
  };

  const removeItem = (id: string) => {
    if (categoryItems.length <= 1) {
      toast({
        title: "Cardul nu poate fi sters",
        description: "Fiecare categorie trebuie sa pastreze cel putin un card.",
        variant: "destructive",
      });
      return;
    }
    setItems((current) => current.filter((item) => item.id !== id));
  };

  const moveItem = (id: string, direction: -1 | 1) => {
    setItems((current) => {
      const categoryIndexes = current
        .map((item, index) =>
          item.collection === activeCategory ? index : -1,
        )
        .filter((index) => index >= 0);
      const currentGlobalIndex = current.findIndex((item) => item.id === id);
      const currentCategoryIndex = categoryIndexes.indexOf(currentGlobalIndex);
      const nextCategoryIndex = currentCategoryIndex + direction;

      if (
        currentCategoryIndex < 0 ||
        nextCategoryIndex < 0 ||
        nextCategoryIndex >= categoryIndexes.length
      ) {
        return current;
      }

      const next = [...current];
      const targetGlobalIndex = categoryIndexes[nextCategoryIndex];
      [next[currentGlobalIndex], next[targetGlobalIndex]] = [
        next[targetGlobalIndex],
        next[currentGlobalIndex],
      ];
      return next;
    });
  };

  const uploadMedia = async (
    itemId: string,
    field: "previewSrc" | "posterSrc",
    file: File,
  ) => {
    const uploadKey = `${itemId}-${field}`;
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
      updateItem(itemId, { [field]: String(data.url) });
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

  const saveItems = async () => {
    const invalidItem = items.find(
      (item) => !item.id.trim() || !item.title.trim() || !item.previewSrc.trim(),
    );
    if (invalidItem) {
      toast({
        title: "Date incomplete",
        description:
          "Fiecare card trebuie sa aiba ID, titlu si media principala.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(
        `${API_URL}/admin/config/landing-featured-carousel`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            items,
            enabledCollections: enabledCategories,
          }),
        },
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error || "Salvarea a esuat.");
      }
      setItems(data.items);
      setEnabledCategories(data.enabledCollections);
      toast({
        title: "Carusel salvat",
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
        Se incarca configurarea...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Carusel landing page
          </h2>
          <p className="text-sm text-muted-foreground">
            Editeaza cardurile din sectiunea cu invitatii de pe homepage.
          </p>
        </div>
        <Button onClick={saveItems} disabled={isSaving || Boolean(uploadingField)}>
          {isSaving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Salveaza caruselul
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {featuredTemplateCategories.map((category) => {
          const count = items.filter(
            (item) => item.collection === category.id,
          ).length;
          const isEnabled = enabledCategories.includes(category.id);
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => setActiveCategory(category.id)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                activeCategory === category.id
                  ? "border-indigo-600 bg-indigo-600 text-white"
                  : "border-border bg-background text-muted-foreground hover:text-foreground"
              }`}
            >
              {category.label} ({count})
              {!isEnabled && " · ascunsa"}
            </button>
          );
        })}
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Sectiuni afisate pe landing</CardTitle>
          <CardDescription>
            Ascunderea unei sectiuni nu sterge cardurile salvate in ea.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {featuredTemplateCategories.map((category) => {
            const isEnabled = enabledCategories.includes(category.id);
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => toggleCategoryVisibility(category.id)}
                className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors ${
                  isEnabled
                    ? "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200"
                    : "border-border bg-muted/30 text-muted-foreground"
                }`}
              >
                <span>
                  <span className="block text-sm font-semibold">
                    {category.label}
                  </span>
                  <span className="text-xs">
                    {isEnabled ? "Vizibila" : "Ascunsa"}
                  </span>
                </span>
                {isEnabled ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )}
              </button>
            );
          })}
        </CardContent>
      </Card>

      <div className="space-y-4">
        {categoryItems.map((item, index) => (
          <CarouselItemEditor
            key={item.id}
            item={item}
            index={index}
            total={categoryItems.length}
            uploadingField={uploadingField}
            onChange={(changes) => updateItem(item.id, changes)}
            onMove={(direction) => moveItem(item.id, direction)}
            onRemove={() => removeItem(item.id)}
            onUpload={(field, file) => uploadMedia(item.id, field, file)}
          />
        ))}
      </div>

      <Button variant="outline" onClick={addItem} className="w-full">
        <Plus className="mr-2 h-4 w-4" />
        Adauga un card in aceasta categorie
      </Button>
    </div>
  );
};

const CarouselItemEditor = ({
  item,
  index,
  total,
  uploadingField,
  onChange,
  onMove,
  onRemove,
  onUpload,
}: {
  item: FeaturedTemplateItem;
  index: number;
  total: number;
  uploadingField: string | null;
  onChange: (changes: Partial<FeaturedTemplateItem>) => void;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
  onUpload: (
    field: "previewSrc" | "posterSrc",
    file: File,
  ) => void;
}) => {
  const previewUrl = resolveMediaUrl(item.previewSrc);
  const isVideo = /\.(mp4|webm)(?:$|\?)/i.test(previewUrl || "");

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-base">
              Card {index + 1}: {item.title || "Fara titlu"}
            </CardTitle>
            <CardDescription>ID: {item.id}</CardDescription>
          </div>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="icon"
              disabled={index === 0}
              onClick={() => onMove(-1)}
              title="Muta mai sus"
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              disabled={index === total - 1}
              onClick={() => onMove(1)}
              title="Muta mai jos"
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={onRemove}
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
              title="Sterge cardul"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="grid gap-5 lg:grid-cols-[190px_1fr]">
        <div className="overflow-hidden rounded-2xl border bg-black">
          <div className="aspect-[9/16]">
            {previewUrl ? (
              isVideo ? (
                <video
                  src={previewUrl}
                  className="h-full w-full object-contain"
                  muted
                  loop
                  autoPlay
                  playsInline
                />
              ) : (
                <img
                  src={previewUrl}
                  alt=""
                  className="h-full w-full object-contain"
                />
              )
            ) : (
              <div className="flex h-full items-center justify-center text-zinc-500">
                <ImagePlus className="h-8 w-8" />
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Titlu">
            <Input
              value={item.title}
              onChange={(event) => onChange({ title: event.target.value })}
            />
          </Field>
          <Field label="ID unic">
            <Input
              value={item.id}
              onChange={(event) => onChange({ id: event.target.value })}
            />
          </Field>
          <Field label="Categorie vizuala">
            <Input
              value={item.category}
              onChange={(event) => onChange({ category: event.target.value })}
            />
          </Field>
          <Field label="An">
            <Input
              value={item.year}
              onChange={(event) => onChange({ year: event.target.value })}
            />
          </Field>
          <Field label="Badge">
            <Input
              value={item.badge || ""}
              placeholder="Ex: Nou, Popular"
              onChange={(event) =>
                onChange({ badge: event.target.value || null })
              }
            />
          </Field>
          <Field label="Media principala" className="sm:col-span-2">
            <div className="flex gap-2">
              <Input
                value={item.previewSrc}
                placeholder="/uploads/... sau URL"
                onChange={(event) =>
                  onChange({ previewSrc: event.target.value })
                }
              />
              <UploadButton
                busy={uploadingField === `${item.id}-previewSrc`}
                accept="image/jpeg,image/png,image/webp,image/gif,image/avif,video/mp4"
                onFile={(file) => onUpload("previewSrc", file)}
              />
            </div>
          </Field>
          <Field label="Poster pentru video / GIF" className="sm:col-span-2">
            <div className="flex gap-2">
              <Input
                value={item.posterSrc || ""}
                placeholder="/uploads/... sau URL"
                onChange={(event) =>
                  onChange({ posterSrc: event.target.value })
                }
              />
              <UploadButton
                busy={uploadingField === `${item.id}-posterSrc`}
                accept="image/jpeg,image/png,image/webp,image/avif"
                onFile={(file) => onUpload("posterSrc", file)}
              />
            </div>
          </Field>
          <Field label="Descriere" className="sm:col-span-2">
            <textarea
              value={item.summary}
              onChange={(event) => onChange({ summary: event.target.value })}
              className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </Field>
        </div>
      </CardContent>
    </Card>
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

export default LandingCarouselManagement;
