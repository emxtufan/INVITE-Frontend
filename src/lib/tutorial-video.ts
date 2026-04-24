export const GLOBAL_TUTORIAL_VIDEO_CONFIG_ID = "global-tutorial-video";
export const TUTORIAL_VIDEO_STEP_IDS = [
  "design",
  "guests",
  "advanced",
] as const;

export type TutorialVideoStepId = (typeof TUTORIAL_VIDEO_STEP_IDS)[number];

export type TutorialVideoUrls = Partial<Record<TutorialVideoStepId, string>>;

export type TutorialVideoMedia = {
  type: "iframe" | "video";
  src: string;
};

export const getTutorialVideoUrlFromConfig = (config: any): string =>
  String(config?.videoUrl || config?.tutorialVideoUrl || "").trim();

export const getTutorialVideoUrlsFromConfig = (config: any): TutorialVideoUrls => {
  const raw = config?.tutorialVideos;
  const next: TutorialVideoUrls = {};

  TUTORIAL_VIDEO_STEP_IDS.forEach((stepId) => {
    const rawValue =
      stepId === "design"
        ? raw?.[stepId] || config?.videoUrl || config?.tutorialVideoUrl
        : raw?.[stepId];
    const normalized = String(rawValue || "").trim();
    if (normalized) next[stepId] = normalized;
  });

  return next;
};

export const resolveTutorialVideoMedia = (
  rawValue?: string | null,
): TutorialVideoMedia | null => {
  const raw = String(rawValue || "").trim();
  if (!raw) return null;

  if (
    /^(blob:|data:)/i.test(raw) ||
    /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(raw)
  ) {
    return { type: "video", src: raw };
  }

  const youtubeMatch =
    raw.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{6,})/i) ||
    raw.match(/youtube\.com\/embed\/([\w-]{6,})/i);
  if (youtubeMatch?.[1]) {
    return {
      type: "iframe",
      src: `https://www.youtube.com/embed/${youtubeMatch[1]}`,
    };
  }

  const vimeoMatch =
    raw.match(/vimeo\.com\/(\d+)/i) ||
    raw.match(/player\.vimeo\.com\/video\/(\d+)/i);
  if (vimeoMatch?.[1]) {
    return {
      type: "iframe",
      src: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
    };
  }

  return { type: "iframe", src: raw };
};
