import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import Button from "./ui/button";
import { getSimpleTemplateComponent } from "./simple-templates/registry";

type SimpleTemplatePreviewPayload = {
  templateId: string;
  templateName: string;
  data: any;
  canUseTemplate: boolean;
  isComingSoon: boolean;
  isLockedByPlan: boolean;
};

const SimpleTemplatePreviewPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payload, setPayload] = useState<SimpleTemplatePreviewPayload | null>(
    null,
  );
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const previewKey = String(params.get("previewKey") || "").trim();
    if (!previewKey) {
      setError("Lipseste cheia preview-ului.");
      setLoading(false);
      return;
    }

    const raw = localStorage.getItem(previewKey);
    if (!raw) {
      setError("Preview-ul nu mai este disponibil. Redeschide din wizard.");
      setLoading(false);
      return;
    }

    try {
      const parsed = JSON.parse(raw) as SimpleTemplatePreviewPayload;
      if (!parsed?.templateId || !parsed?.data) {
        throw new Error("Payload invalid");
      }
      setPayload(parsed);
    } catch {
      setError("Datele demo sunt invalide.");
    } finally {
      setLoading(false);
    }
  }, []);

  const TemplateComponent = useMemo(
    () => (payload ? (getSimpleTemplateComponent(payload.templateId) as any) : null),
    [payload],
  );

  const handleBack = () => {
    if (window.opener) {
      window.close();
      return;
    }
    if (window.history.length > 1) {
      window.history.back();
      return;
    }
    window.location.href = "/dashboard";
  };

  const handleUseTemplate = () => {
    if (!payload || !payload.canUseTemplate) return;

    if (window.opener) {
      window.opener.postMessage(
        { type: "simple-template-use", templateId: payload.templateId },
        window.location.origin,
      );
      setApplied(true);
      setTimeout(() => window.close(), 220);
      return;
    }

    setApplied(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          Se incarca preview-ul template-ului...
        </div>
      </div>
    );
  }

  if (error || !payload || !TemplateComponent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-lg border bg-card p-5 text-center space-y-3">
          <p className="text-sm font-semibold text-foreground">Preview indisponibil</p>
          <p className="text-xs text-muted-foreground">
            {error || "Template-ul nu poate fi randat in preview."}
          </p>
          <Button type="button" variant="outline" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Inapoi
          </Button>
        </div>
      </div>
    );
  }

  const actionLabel = payload.isComingSoon
    ? "Coming Soon"
    : payload.isLockedByPlan
      ? "Premium"
      : applied
        ? "Template selectat"
        : "Use this template";

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed top-0 left-0 right-0 h-14 z-[30000] border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="h-14 px-3 md:px-5 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate text-white">
              Demo template: {payload.templateName || payload.templateId}
            </p>
            <p className="text-[11px] text-muted-foreground">
              Preview 1:1 ca invitatie publica, cu intro si scroll complet.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              className="h-8 px-3 text-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              Back
            </Button>
            <Button
              type="button"
              onClick={handleUseTemplate}
              disabled={!payload.canUseTemplate || applied}
              className="h-8 px-3 text-xs"
            >
              {applied ? <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> : null}
              {actionLabel}
            </Button>
          </div>
        </div>
      </div>

      <TemplateComponent
        data={payload.data}
        onOpenRSVP={() => {}}
        editMode={false}
        introOnly={false}
        suppressAudioModal={false}
        enableGsapPreview
      />
    </div>
  );
};

export default SimpleTemplatePreviewPage;
