import type { AdminCandidate, ReportDefinition, ReportFormat } from "../data/adminInsights";

const reportToCsv = (report: ReportDefinition, candidates: AdminCandidate[]) => {
  const rows = [
    ["Report", report.name],
    ["Category", report.category],
    [],
    ["Candidate ID", "Name", "Field", "Status", "Availability", "Updated At"],
    ...candidates.map((candidate) => [
      candidate.id,
      candidate.name,
      candidate.field,
      candidate.status,
      candidate.availability,
      candidate.updatedAt,
    ]),
  ];

  return rows
    .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
    .join("\n");
};

const downloadTextFile = (fileName: string, mimeType: string, content: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export const exportCandidateReport = (
  report: ReportDefinition,
  format: ReportFormat,
  candidates: AdminCandidate[],
) => {
  const slug = report.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const csv = reportToCsv(report, candidates);

  if (format === "Excel") {
    downloadTextFile(`${slug}.csv`, "text/csv;charset=utf-8", csv);
    return;
  }

  downloadTextFile(`${slug}.pdf`, "application/pdf", csv);
};
