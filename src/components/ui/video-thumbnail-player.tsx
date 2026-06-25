import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

interface VideoPlayerProps extends React.HTMLAttributes<HTMLDivElement> {
  thumbnailUrl: string;
  videoUrl: string;
  title: string;
  description?: string;
  aspectRatio?: "16/9" | "4/3" | "1/1";
  showDetails?: boolean;
  previewAsVideo?: boolean;
}

const VideoPlayer = React.forwardRef<HTMLDivElement, VideoPlayerProps>(
  (
    {
      className,
      thumbnailUrl,
      videoUrl,
      title,
      description,
      aspectRatio = "16/9",
      showDetails = true,
      previewAsVideo = false,
      ...props
    },
    ref,
  ) => {
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const isEmbedVideo =
      videoUrl.includes("youtube.com/embed") ||
      videoUrl.includes("player.vimeo.com");
    const isGif = videoUrl.toLowerCase().endsWith(".gif");

    React.useEffect(() => {
      if (!isModalOpen) return;

      const previousOverflow = document.body.style.overflow;
      const previousHtmlOverflow = document.documentElement.style.overflow;
      const handleEsc = (event: KeyboardEvent) => {
        if (event.key === "Escape") setIsModalOpen(false);
      };

      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      window.addEventListener("keydown", handleEsc);

      return () => {
        document.body.style.overflow = previousOverflow;
        document.documentElement.style.overflow = previousHtmlOverflow;
        window.removeEventListener("keydown", handleEsc);
      };
    }, [isModalOpen]);

    const videoModal = isModalOpen ? (
      <div
        className="fixed inset-0 z-[9999] flex h-[100dvh] w-screen animate-in items-center justify-center bg-black fade-in-0"
        aria-modal="true"
        role="dialog"
        aria-label={title}
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) setIsModalOpen(false);
        }}
      >
        <button
          type="button"
          onClick={() => setIsModalOpen(false)}
          className="absolute right-4 top-4 z-10 rounded-full bg-white/12 p-3 text-white backdrop-blur-md transition-colors hover:bg-white/22"
          aria-label="Inchide video"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="h-[100dvh] w-screen bg-black">
          {isEmbedVideo ? (
            <iframe
              src={videoUrl}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
            />
          ) : isGif ? (
            <img
              src={videoUrl}
              alt={title}
              className="h-full w-full object-contain"
            />
          ) : (
            <video
              src={videoUrl}
              poster={thumbnailUrl}
              title={title}
              controls
              autoPlay
              playsInline
              className="h-full w-full object-contain"
            />
          )}
        </div>
      </div>
    ) : null;

    return (
      <>
        <div
          ref={ref}
          className={cn(
            "group relative cursor-pointer overflow-hidden rounded-2xl shadow-[0_24px_60px_rgba(16,23,23,0.18)]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            className,
          )}
          style={{ aspectRatio }}
          onClick={() => setIsModalOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setIsModalOpen(true);
            }
          }}
          tabIndex={0}
          role="button"
          aria-label={`Reda video: ${title}`}
          {...props}
        >
          {isGif ? (
            <img
              src={videoUrl}
              alt={`Preview pentru ${title}`}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : previewAsVideo && !isEmbedVideo ? (
            <video
              src={videoUrl}
              poster={thumbnailUrl}
              muted
              loop
              autoPlay
              playsInline
              preload="metadata"
              aria-hidden="true"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <img
              src={thumbnailUrl}
              alt={`Preview pentru ${title}`}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/42 via-black/0 to-transparent" />

          {showDetails ? (
            <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
              <h3 className="text-xl font-semibold text-white sm:text-2xl">
                {title}
              </h3>
              {description ? (
                <p className="mt-1 text-sm text-white/80">{description}</p>
              ) : null}
            </div>
          ) : null}
        </div>

        {videoModal && typeof document !== "undefined"
          ? createPortal(videoModal, document.body)
          : null}
      </>
    );
  },
);

VideoPlayer.displayName = "VideoPlayer";

export { VideoPlayer };
