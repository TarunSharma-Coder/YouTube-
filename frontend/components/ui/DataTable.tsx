import { InsightRow } from "@/types";

function cellText(value: unknown) {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "number") return Number.isInteger(value) ? value.toString() : value.toFixed(2);
  return String(value);
}

export function DataTable({ rows, limit = 40 }: { rows: InsightRow[]; limit?: number }) {
  const visibleRows = rows.slice(0, limit);
  const columns = Array.from(new Set(visibleRows.flatMap((row) => Object.keys(row)))).slice(0, 10);

  if (!visibleRows.length) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-8 text-sm text-muted">
        No data available for this section yet. Run Dashboard analysis with a wider date range.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="text-left text-xs uppercase tracking-[0.14em] text-muted">
          <tr>
            {columns.map((column) => (
              <th key={column} className="whitespace-nowrap px-3 py-3">
                {column.replaceAll("_", " ")}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {visibleRows.map((row, index) => (
            <tr key={index} className="text-muted">
              {columns.map((column) => (
                <td key={column} className="max-w-[320px] truncate px-3 py-3">
                  {cellText(row[column])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

