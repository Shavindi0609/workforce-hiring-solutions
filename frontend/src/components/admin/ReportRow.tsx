import { FiDownload } from "react-icons/fi";
import type { ReportDefinition, ReportFormat } from "../../data/adminInsights";

type ReportRowProps = {
  report: ReportDefinition;
  records: number;
  onDownload: (format: ReportFormat) => void;
};

const ReportRow = ({ report, records, onDownload }: ReportRowProps) => (
  <tr>
    <td className="table-primary">{report.name}</td>
    <td>{report.category}</td>
    <td>{records.toLocaleString("en-US")}</td>
    <td className="align-right">
      <button type="button" className="table-action" onClick={() => onDownload("PDF")}>
        <FiDownload />
        PDF
      </button>
      <button type="button" className="table-action" onClick={() => onDownload("Excel")}>
        <FiDownload />
        Excel
      </button>
    </td>
  </tr>
);

export default ReportRow;
