import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export function NeedAnalysisState() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Dashboard analysis required</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-2xl border border-dashed border-border p-8 text-sm leading-6 text-muted">
          Pehle Dashboard page par apna channel aur competitors analyze karo. Uske baad ye feature same analyzed data par kaam karega.
        </div>
      </CardContent>
    </Card>
  );
}

