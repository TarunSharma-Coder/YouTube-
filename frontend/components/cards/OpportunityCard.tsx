import { Target } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import type { ContentOpportunity } from "@/types";

export function OpportunityCard({ opportunity }: { opportunity: ContentOpportunity }) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Badge tone="warning">{opportunity.label || "Integration Ready"}</Badge>
          <h3 className="mt-3 text-base font-semibold text-foreground">{opportunity.topic}</h3>
        </div>
        <div className="flex size-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
          <Target className="size-5" />
        </div>
      </div>
      <p className="mt-3 text-sm leading-6 text-muted">{opportunity.reason}</p>
      <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-sm">
        <span className="text-muted">Opportunity score</span>
        <span className="font-semibold text-foreground">{opportunity.opportunity_score}/100</span>
      </div>
    </Card>
  );
}

