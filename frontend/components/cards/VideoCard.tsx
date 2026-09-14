import Image from "next/image";
import { ArrowUpRight, Calendar, Eye, Zap } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { formatCompactNumber, safeDateLabel } from "@/lib/utils";
import type { Video } from "@/types";

function outlierBadge(video: Video) {
  const score = Number(video.outlier_score ?? 0);
  if (score >= 3) return { label: "Super Outlier", tone: "success" as const };
  if (score >= 1.5) return { label: "Rising", tone: "warning" as const };
  if (video.video_type) return { label: video.video_type, tone: "default" as const };
  return { label: "Video", tone: "default" as const };
}

export function VideoCard({ video }: { video: Video }) {
  const badge = outlierBadge(video);
  const title = video.title || "Untitled video";

  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-video bg-surface-2">
        {video.thumbnail ? (
          <Image
            src={video.thumbnail}
            alt=""
            fill
            className="object-cover"
            sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted">No thumbnail</div>
        )}
        <div className="absolute left-3 top-3">
          <Badge tone={badge.tone}>{badge.label}</Badge>
        </div>
      </div>
      <div className="p-4">
        <h3 className="line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-foreground">
          {title}
        </h3>
        <p className="mt-2 truncate text-xs text-muted">{video.channel || "Unknown channel"}</p>
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-muted">
          <span className="flex items-center gap-1.5 rounded-lg bg-surface-2 px-2 py-2">
            <Eye className="size-3.5" />
            {formatCompactNumber(video.views)} views
          </span>
          <span className="flex items-center gap-1.5 rounded-lg bg-surface-2 px-2 py-2">
            <Zap className="size-3.5" />
            {formatCompactNumber(video.views_per_day)} / day
          </span>
          <span className="flex items-center gap-1.5 rounded-lg bg-surface-2 px-2 py-2">
            <Calendar className="size-3.5" />
            {safeDateLabel(video.upload_date)}
          </span>
          <span className="truncate rounded-lg bg-surface-2 px-2 py-2">
            {video.content_topic || video.content_category || video.video_type || "Topic unavailable"}
          </span>
        </div>
        {video.url ? (
          <a
            href={video.url}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:text-accent/85"
          >
            Open video
            <ArrowUpRight className="size-4" />
          </a>
        ) : null}
      </div>
    </Card>
  );
}
