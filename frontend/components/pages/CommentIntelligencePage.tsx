"use client";

import Image from "next/image";
import { AlertTriangle, Brain, CheckCircle2, Lightbulb, MessageSquareText, RefreshCw, SearchCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { MetricCard } from "@/components/cards/MetricCard";
import { PageContainer } from "@/components/layout/PageContainer";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { useChannelAnalysisContext } from "@/contexts/ChannelAnalysisContext";
import { analyzeComments } from "@/lib/api";
import { cn, formatCompactNumber, safeDateLabel } from "@/lib/utils";
import type { CommentAnalysisResponse, CommentCluster, CommentVideoContext, Video } from "@/types";

const progressSteps = [
  "Fetching Comments",
  "Cleaning Comments",
  "Analyzing Sentiment",
  "Creating Embeddings",
  "Finding Audience Themes",
  "Generating Content Opportunities",
];

function sourceVideo(video: Video, source_type: CommentVideoContext["source_type"]): CommentVideoContext | null {
  if (!video.video_id) return null;
  return {
    video_id: video.video_id,
    title: video.title,
    channel: video.channel,
    source_type,
    url: video.url,
    published_at: video.upload_date,
    views: Number(video.views ?? 0),
    outlier_score: Number(video.outlier_score ?? 0),
    topic: video.content_topic || video.content_category || video.keywords || "",
  };
}

function VideoSelectCard({
  video,
  selected,
  onToggle,
}: {
  video: CommentVideoContext & { thumbnail?: string; views_per_day?: number };
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "grid w-full grid-cols-[92px_1fr] gap-3 rounded-2xl border p-3 text-left transition",
        selected ? "border-accent bg-accent/10" : "border-border bg-surface hover:bg-surface-2",
      )}
    >
      <div className="relative aspect-video overflow-hidden rounded-xl bg-surface-2">
        {video.thumbnail ? (
          <Image src={video.thumbnail} alt="" fill className="object-cover" sizes="92px" />
        ) : null}
      </div>
      <div className="min-w-0">
        <div className="mb-2 flex items-center gap-2">
          <Badge tone={video.source_type === "competitor" ? "warning" : "default"}>
            {video.source_type === "competitor" ? "Competitor" : "Own"}
          </Badge>
          {selected ? <CheckCircle2 className="size-4 text-accent" /> : null}
        </div>
        <p className="line-clamp-2 text-sm font-semibold text-foreground">{video.title || "Untitled video"}</p>
        <p className="mt-1 text-xs text-muted">
          {safeDateLabel(video.published_at)} · {formatCompactNumber(video.views)} views
        </p>
      </div>
    </button>
  );
}

function DemandCard({
  cluster,
  active,
  onSelect,
}: {
  cluster: CommentCluster;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full rounded-2xl border p-4 text-left transition",
        active ? "border-accent bg-accent/10" : "border-border bg-surface hover:bg-surface-2",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
            {cluster.audience_intent}
          </p>
          <h3 className="mt-2 text-lg font-semibold text-foreground">{cluster.cluster_name}</h3>
        </div>
        <Badge tone={cluster.urgency === "high" ? "danger" : cluster.urgency === "medium" ? "warning" : "default"}>
          {cluster.urgency}
        </Badge>
      </div>
      <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted">
        {cluster.summary || cluster.content_opportunity || "Local audience-demand cluster from selected comments."}
      </p>
      <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
        <div className="rounded-xl bg-background/70 p-3">
          <p className="text-muted">Demand</p>
          <p className="mt-1 font-semibold text-foreground">{cluster.demand_score}/100</p>
        </div>
        <div className="rounded-xl bg-background/70 p-3">
          <p className="text-muted">Comments</p>
          <p className="mt-1 font-semibold text-foreground">{formatCompactNumber(cluster.comment_count)}</p>
        </div>
        <div className="rounded-xl bg-background/70 p-3">
          <p className="text-muted">Videos</p>
          <p className="mt-1 font-semibold text-foreground">{formatCompactNumber(cluster.unique_video_count)}</p>
        </div>
      </div>
    </button>
  );
}

function EvidencePanel({ cluster }: { cluster?: CommentCluster }) {
  if (!cluster) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>View Evidence</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-2xl border border-dashed border-border p-8 text-sm text-muted">
            Select an audience-demand card to inspect representative comments.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evidence: {cluster.cluster_name}</CardTitle>
        <p className="mt-1 text-sm text-muted">
          {cluster.comment_count} related comments · {cluster.unique_video_count} videos · avg likes {cluster.avg_likes}
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {cluster.evidence.map((item, index) => (
          <div key={`${item.video_id}-${index}`} className="rounded-2xl border border-border bg-surface-2 p-4">
            <p className="text-sm leading-6 text-foreground">“{item.comment_text}”</p>
            <p className="mt-2 text-xs text-muted">
              {item.channel} · {item.video_title} · {formatCompactNumber(item.comment_likes)} likes
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function LoadingProgress() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="size-5 animate-spin text-accent" />
          Analyzing comments
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {progressSteps.map((step) => (
          <div key={step} className="rounded-2xl border border-border bg-surface-2 p-4">
            <Skeleton className="mb-3 h-2 w-20" />
            <p className="text-sm font-medium text-foreground">{step}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function CommentIntelligencePage() {
  const channelState = useChannelAnalysisContext();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [commentLimit, setCommentLimit] = useState(100);
  const [mistralApiKey, setMistralApiKey] = useState("");
  const [includeAi, setIncludeAi] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<CommentAnalysisResponse | null>(null);
  const [activeClusterId, setActiveClusterId] = useState<number | null>(null);

  const availableVideos = useMemo(() => {
    const own = (channelState.result?.own_videos ?? [])
      .map((video) => ({ ...sourceVideo(video, "own"), thumbnail: video.thumbnail, views_per_day: video.views_per_day }))
      .filter(Boolean) as Array<CommentVideoContext & { thumbnail?: string; views_per_day?: number }>;
    const competitor = (channelState.result?.competitor_videos ?? [])
      .map((video) => ({
        ...sourceVideo(video, "competitor"),
        thumbnail: video.thumbnail,
        views_per_day: video.views_per_day,
      }))
      .filter(Boolean) as Array<CommentVideoContext & { thumbnail?: string; views_per_day?: number }>;
    return [...own, ...competitor];
  }, [channelState.result]);

  const selectedVideos = availableVideos.filter((video) => selectedIds.includes(video.video_id));
  const activeCluster = result?.clusters.find((cluster) => cluster.cluster_id === activeClusterId) ?? result?.clusters[0];

  function toggleVideo(videoId: string) {
    setSelectedIds((current) =>
      current.includes(videoId) ? current.filter((id) => id !== videoId) : [...current, videoId],
    );
  }

  async function submit() {
    if (!selectedVideos.length) {
      setError("Select at least one video first.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await analyzeComments({
        videos: selectedVideos,
        youtube_api_key: channelState.youtubeApiKey || undefined,
        mistral_api_key: mistralApiKey || undefined,
        comment_limit_per_video: commentLimit,
        include_ai: includeAi,
      });
      setResult(response);
      setActiveClusterId(response.clusters[0]?.cluster_id ?? null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Comment analysis failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageContainer
      eyebrow="Audience"
      title="Comment-to-Content Analyzer"
      description="Analyze selected video comments to find repeated audience demand, evidence-backed content gaps, and next video ideas."
    >
      {!channelState.result ? (
        <Card>
          <CardHeader>
            <CardTitle>Run channel analysis first</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-2xl border border-dashed border-border p-8 text-sm leading-6 text-muted">
              Go to Dashboard, analyze your channel and competitors, then return here to select videos for comment analysis.
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Select Videos</CardTitle>
              <p className="mt-1 text-sm text-muted">
                Pick own or competitor videos from the latest analyzed dataset.
              </p>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 lg:grid-cols-[1fr_220px_220px_160px] lg:items-end">
                <label className="block text-sm font-medium text-foreground">
                  Mistral API key
                  <Input
                    type="password"
                    value={mistralApiKey}
                    onChange={(event) => setMistralApiKey(event.target.value)}
                    placeholder="Optional if backend .env has MISTRAL_API_KEY"
                    className="mt-2"
                  />
                </label>
                <label className="block text-sm font-medium text-foreground">
                  Comments/video
                  <Input
                    type="number"
                    min={1}
                    max={1000}
                    value={commentLimit}
                    onChange={(event) => setCommentLimit(Number(event.target.value))}
                    className="mt-2"
                  />
                </label>
                <label className="flex items-center gap-3 rounded-xl border border-border bg-surface-2 px-3 py-3 text-sm text-foreground">
                  <input
                    type="checkbox"
                    checked={includeAi}
                    onChange={(event) => setIncludeAi(event.target.checked)}
                    className="size-4 accent-[#FF3B5C]"
                  />
                  Use Mistral interpretation
                </label>
                <Button type="button" onClick={submit} disabled={loading || !selectedVideos.length}>
                  {loading ? "Analyzing..." : "Analyze"}
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setSelectedIds(availableVideos.slice(0, 10).map((video) => video.video_id))}
                >
                  Select top 10
                </Button>
                <Button type="button" variant="ghost" onClick={() => setSelectedIds([])}>
                  Clear
                </Button>
                <span className="text-sm text-muted">{selectedVideos.length} selected</span>
              </div>

              <div className="grid gap-3 xl:grid-cols-2">
                {availableVideos.slice(0, 60).map((video) => (
                  <VideoSelectCard
                    key={`${video.source_type}-${video.video_id}`}
                    video={video}
                    selected={selectedIds.includes(video.video_id)}
                    onToggle={() => toggleVideo(video.video_id)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {error ? (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
              {error}
            </div>
          ) : null}

          {loading ? <LoadingProgress /> : null}

          {result ? (
            <>
              {result.ai_error ? (
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-200">
                  <AlertTriangle className="mr-2 inline size-4" />
                  {result.ai_error}
                </div>
              ) : null}

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
                <MetricCard label="Comments" value={formatCompactNumber(result.metrics.comments_analyzed)} icon={MessageSquareText} />
                <MetricCard label="Videos" value={formatCompactNumber(result.metrics.videos_analyzed)} icon={SearchCheck} />
                <MetricCard label="Clusters" value={formatCompactNumber(result.metrics.clusters_found)} icon={Brain} />
                <MetricCard label="Requests" value={formatCompactNumber(result.metrics.content_requests)} icon={Lightbulb} />
                <MetricCard label="Questions" value={formatCompactNumber(result.metrics.questions)} icon={MessageSquareText} />
                <MetricCard label="Negative" value={formatCompactNumber(result.metrics.negative)} icon={AlertTriangle} />
              </div>

              <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
                <Card>
                  <CardHeader>
                    <CardTitle>What Audience Wants</CardTitle>
                    <p className="mt-1 text-sm text-muted">Ranked by Python demand and opportunity scoring.</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {result.clusters.map((cluster) => (
                      <DemandCard
                        key={cluster.cluster_id}
                        cluster={cluster}
                        active={activeCluster?.cluster_id === cluster.cluster_id}
                        onSelect={() => setActiveClusterId(cluster.cluster_id)}
                      />
                    ))}
                  </CardContent>
                </Card>
                <EvidencePanel cluster={activeCluster} />
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Next Content Ideas</CardTitle>
                  <p className="mt-1 text-sm text-muted">
                    Recommendations are grounded in cluster evidence. No CTR or virality prediction.
                  </p>
                </CardHeader>
                <CardContent className="grid gap-4 xl:grid-cols-2">
                  {result.content_ideas.map((idea) => (
                    <div key={idea.topic} className="rounded-2xl border border-border bg-surface-2 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <Badge tone={idea.priority === "high" ? "danger" : "warning"}>{idea.priority}</Badge>
                          <h3 className="mt-3 text-lg font-semibold text-foreground">{idea.topic}</h3>
                        </div>
                        <div className="text-right text-xs text-muted">
                          <p>{idea.demand_score}/100 demand</p>
                          <p>{idea.supporting_comments} comments</p>
                        </div>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-muted">{idea.why_this_opportunity_exists}</p>
                      <div className="mt-4 space-y-3">
                        {idea.ideas.slice(0, 5).map((option) => (
                          <div key={option.title} className="rounded-xl bg-background/70 p-3">
                            <p className="text-sm font-semibold text-foreground">{option.title}</p>
                            <p className="mt-1 text-xs text-muted">{option.angle} · {option.thumbnail_angle}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {result.fetch_errors.length ? (
                <Card className="border-amber-500/30">
                  <CardHeader>
                    <CardTitle>Fetch Warnings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-amber-200">
                      {result.fetch_errors.map((item) => (
                        <li key={item.video_id}>
                          {item.video_id}: {item.error}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ) : null}
            </>
          ) : null}
        </>
      )}
    </PageContainer>
  );
}

