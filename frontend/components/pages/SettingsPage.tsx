"use client";

import { useState } from "react";
import { Settings, Key, CheckCircle2, ShieldCheck } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function SettingsPage() {
  const [mistralKey, setMistralKey] = useState("K48sHiGXXFGhLiTBjQgqAIGcl8qkHoyy");
  const [saved, setSaved] = useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <PageContainer eyebrow="System" title="Settings" description="Manage API keys, environment settings, and backend connections.">
      <div className="space-y-6">
        <Card className="border-slate-200 bg-white shadow-xs">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-800">
              <Key className="size-5 text-blue-600" />
              API Key Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4 max-w-xl">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mistral API Key</label>
                <Input
                  type="password"
                  value={mistralKey}
                  onChange={(e) => setMistralKey(e.target.value)}
                  placeholder="K48sHiGXXFGhLiTBjQgqAIGcl..."
                />
                <p className="text-[11px] text-slate-500 mt-1">Used for Mistral AI Comment-to-Content clustering & intent analysis.</p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button type="submit" className="bg-accent hover:bg-red-700 text-white font-bold h-10 px-5">
                  Save Settings
                </Button>

                {saved ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
                    <CheckCircle2 className="size-4" />
                    Key Updated & Saved
                  </span>
                ) : null}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-xs">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-800">
              <ShieldCheck className="size-5 text-emerald-600" />
              Environment & Connection Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5 text-xs text-slate-600">
            <p><strong className="text-slate-800">Frontend Environment Variable:</strong> <code className="bg-slate-100 px-2 py-0.5 rounded text-blue-600">NEXT_PUBLIC_API_URL</code></p>
            <p><strong className="text-slate-800">Backend Server URL:</strong> <code className="bg-slate-100 px-2 py-0.5 rounded text-slate-800">http://localhost:8000</code></p>
            <p><strong className="text-slate-800">Configured System Keys:</strong> <span className="font-semibold text-emerald-600">MISTRAL_API_KEY (Active)</span>, YOUTUBE_API_KEY, OPENAI_API_KEY, GLM_API_KEY</p>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
