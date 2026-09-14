import Image from "next/image";
import { Card } from "@/components/ui/Card";
import { formatCompactNumber } from "@/lib/utils";
import type { ChannelSummary, Competitor } from "@/types";

type CompetitorCardProps = {
  channel?: Competitor;
  summary: ChannelSummary;
};

export function CompetitorCard({ channel, summary }: CompetitorCardProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <div className="relative size-11 overflow-hidden rounded-2xl bg-surface-2">
          {channel?.thumbnail ? (
            <Image src={channel.thumbnail} alt="" fill className="object-cover" sizes="44px" />
          ) : null}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">{summary.channel}</p>
          <p className="text-xs text-muted">{formatCompactNumber(summary.videos)} videos</p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-muted">
        <span className="rounded-lg bg-surface-2 px-2 py-2">
          {formatCompactNumber(summary.total_views)} views
        </span>
        <span className="rounded-lg bg-surface-2 px-2 py-2">
          {formatCompactNumber(summary.avg_views)} avg
        </span>
      </div>
    </Card>
  );
}

