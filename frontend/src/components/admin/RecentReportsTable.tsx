import type { AdminCandidate, RecentReport } from "../../data/adminInsights";
import { reportDefinitions } from "../../data/adminInsights";
import { exportCandidateReport } from "../../utils/exportReports";

type RecentReportsTableProps = {
  reports: RecentReport[];
  candidates: AdminCandidate[];
};

const RecentReportsTable = ({ reports, candidates }: RecentReportsTableProps) => (
  <section className="admin-panel table-panel">
    <div className="panel-header">
      <h2>Recent Reports</h2>
      <span>{candidates.length.toLocaleString("en-US")} matching candidates</span>
    </div>
    <div className="table-scroll">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Report</th>
            <th>Type</th>
            <th>Format</th>
            <th>Generated</th>
            <th>Records</th>
            <th className="align-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((report) => {
            const definition =
              reportDefinitions.find((definitionItem) => definitionItem.name === report.name) ?? reportDefinitions[0];

            return (
              <tr key={report.id}>
                <td className="table-primary">{report.name}</td>
                <td>{report.type}</td>
                <td>{report.format}</td>
                <td>{report.generatedAt}</td>
                <td>{report.records.toLocaleString("en-US")}</td>
                <td className="align-right">
                  <button
                    type="button"
                    className="table-action"
                    onClick={() => exportCandidateReport(definition, report.format, candidates)}
                  >
                    Download
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </section>
);

export default RecentReportsTable;
