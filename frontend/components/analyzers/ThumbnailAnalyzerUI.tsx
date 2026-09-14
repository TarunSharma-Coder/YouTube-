"use client";

import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import { ImageIcon } from "lucide-react";
import { MetricCard } from "@/components/cards/MetricCard";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { Input } from "@/components/ui/Input";
import { analyzeThumbnail } from "@/lib/api";
import type { ThumbnailAnalyzeResponse } from "@/types";

function ListBlock({ title, items }: { title: string; items?: string[] }) {
  return (
    <Card>
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent>
        {items?.length ? (
          <ul className="space-y-2 text-sm text-muted">
            {items.map((item) => <li key={item}>{item}</li>)}
          </ul>
        ) : (
          <p className="text-sm text-muted">No items returned.</p>
        )}
      </CardContent>
    </Card>
  );
}

export function ThumbnailAnalyzerUI() {
  const [title, setTitle] = useState("");
  const [openaiApiKey, setOpenaiApiKey] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ThumbnailAnalyzeResponse | null>(null);

  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : ""), [file]);

  function handleFile(event: ChangeEvent<HTMLInputElement>) {
    setFile(event.target.files?.[0] ?? null);
    setResult(null);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) {
      setError("Upload thumbnail image first.");
      return;
    }
    const form = new FormData();
    form.append("title", title);
    form.append("openai_api_key", openaiApiKey);
    form.append("image", file);
    setLoading(true);
    setError("");
    try {
      const response = await analyzeThumbnail(form);
      setResult(response);
      if (!response.ok) setError(response.error || "Thumbnail analysis failed");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Thumbnail analysis failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageContainer eyebrow="Create" title="Thumbnail Analyzer" description="Upload your thumbnail and title for packaging intelligence analysis.">
      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ImageIcon className="size-5 text-accent" /> Analyze Thumbnail</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <label className="block text-sm font-medium text-foreground">
                Thumbnail image
                <Input type="file" accept="image/jpeg,image/jpg,image/png" onChange={handleFile} className="mt-2" />
              </label>
              {previewUrl ? (
                <div className="relative aspect-video overflow-hidden rounded-2xl border border-border bg-surface-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={previewUrl} alt="Thumbnail preview" className="h-full w-full object-cover" />
                </div>
              ) : null}
              <label className="block text-sm font-medium text-foreground">
                Proposed title
                <Input value={title} onChange={(event) => setTitle(event.target.value)} required className="mt-2" placeholder="Enter video title" />
              </label>
              <label className="block text-sm font-medium text-foreground">
                OpenAI API key
                <Input value={openaiApiKey} onChange={(event) => setOpenaiApiKey(event.target.value)} type="password" className="mt-2" placeholder="Optional if backend .env has OPENAI_API_KEY" />
              </label>
              <Button disabled={loading || !file || !title.trim()}>{loading ? "Analyzing..." : "Analyze Thumbnail"}</Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <MetricCard label="Packaging Score" value={result ? `${result.packaging_score}/100` : "-"} />
          <MetricCard label="Readability" value={result ? `${result.analysis.readability_score ?? "-"}/10` : "-"} />
          <MetricCard label="Visual Hierarchy" value={result ? `${result.analysis.visual_hierarchy_score ?? "-"}/10` : "-"} />
          <MetricCard label="Alignment" value={result ? `${result.analysis.title_thumbnail_alignment_score ?? "-"}/10` : "-"} />
        </div>
      </div>

      {error ? <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">{error}</div> : null}

      {result ? (
        <>
          <Card><CardHeader><CardTitle>Validation</CardTitle></CardHeader><CardContent><DataTable rows={[result.validation]} /></CardContent></Card>
          <Card><CardHeader><CardTitle>Thumbnail Analysis</CardTitle></CardHeader><CardContent><DataTable rows={[result.analysis]} /></CardContent></Card>
          <div className="grid gap-4 lg:grid-cols-3">
            <ListBlock title="Strengths" items={result.analysis.strengths} />
            <ListBlock title="Problems" items={result.analysis.problems} />
            <ListBlock title="Recommendations" items={result.analysis.recommendations} />
          </div>
        </>
      ) : null}
    </PageContainer>
  );
}
