import { useMemo, useState } from "react";
import { FiDollarSign, FiFilter, FiTrendingUp, FiUsers } from "react-icons/fi";
import { AdminButton, AdminPanel, DateRangeInput, FilterSelect } from "../components/admin/AdminUi";
import SalaryBarChart from "../components/admin/SalaryBarChart";
import SalaryDonutChart from "../components/admin/SalaryDonutChart";
import StatCard from "../components/admin/StatCard";
import { experienceOptions, fieldOptions } from "../data/adminInsights";
import { isDateRangeValid } from "../utils/dateRange";

type SalaryFilters = {
  field: string;
  experience: string;
  fromDate: string;
  toDate: string;
};

type SalaryDistribution = {
  field: string;
  experience: string;
  minimum: number;
  maximum: number;
  count: number;
  updatedAt: string;
};

const initialFilters: SalaryFilters = {
  field: "All Fields",
  experience: "All Experience",
  fromDate: "2026-04-01",
  toDate: "2026-05-19",
};

const salaryMockData: SalaryDistribution[] = [
  { field: "Software Engineering", experience: "0-2 Years", minimum: 62000, maximum: 92000, count: 386, updatedAt: "2026-05-16" },
  { field: "Software Engineering", experience: "3-5 Years", minimum: 82000, maximum: 132000, count: 512, updatedAt: "2026-05-18" },
  { field: "Software Engineering", experience: "6-8 Years", minimum: 108000, maximum: 168000, count: 284, updatedAt: "2026-05-12" },
  { field: "Data Analytics", experience: "0-2 Years", minimum: 56000, maximum: 86000, count: 232, updatedAt: "2026-05-11" },
  { field: "Data Analytics", experience: "3-5 Years", minimum: 74000, maximum: 118000, count: 296, updatedAt: "2026-05-09" },
  { field: "Product Design", experience: "3-5 Years", minimum: 70000, maximum: 116000, count: 218, updatedAt: "2026-04-28" },
  { field: "Quality Assurance", experience: "0-2 Years", minimum: 50000, maximum: 78000, count: 178, updatedAt: "2026-05-07" },
  { field: "DevOps", experience: "6-8 Years", minimum: 114000, maximum: 182000, count: 196, updatedAt: "2026-05-17" },
  { field: "Human Resources", experience: "9+ Years", minimum: 84000, maximum: 134000, count: 156, updatedAt: "2026-04-20" },
];

const salaryRanges = ["$40K - $70K", "$70K - $100K", "$100K - $150K", "$150K - $200K", "$200K+"];

const money = (value: number) => `$${Math.round(value).toLocaleString("en-US")}`;

const getSalaryRange = (value: number) => {
  if (value < 70000) {
    return "$40K - $70K";
  }

  if (value < 100000) {
    return "$70K - $100K";
  }

  if (value < 150000) {
    return "$100K - $150K";
  }

  if (value < 200000) {
    return "$150K - $200K";
  }

  return "$200K+";
};

const SalaryInsights = () => {
  const [draftFilters, setDraftFilters] = useState<SalaryFilters>(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState<SalaryFilters>(initialFilters);
  const dateRangeValid = isDateRangeValid(draftFilters.fromDate, draftFilters.toDate);

  const filteredSalaryData = useMemo(
    () =>
      salaryMockData.filter((item) => {
        const updatedTime = new Date(item.updatedAt).getTime();
        const fromTime = appliedFilters.fromDate
          ? new Date(appliedFilters.fromDate).getTime()
          : Number.NEGATIVE_INFINITY;
        const toTime = appliedFilters.toDate ? new Date(appliedFilters.toDate).getTime() : Number.POSITIVE_INFINITY;

        return (
          (appliedFilters.field === "All Fields" || item.field === appliedFilters.field) &&
          (appliedFilters.experience === "All Experience" || item.experience === appliedFilters.experience) &&
          updatedTime >= fromTime &&
          updatedTime <= toTime
        );
      }),
    [appliedFilters],
  );

  const salaryDistribution = useMemo(() => {
    const grouped = filteredSalaryData.reduce<Record<string, SalaryDistribution[]>>((groups, item) => {
      const key = item.field.replace("Software Engineering", "Engineering");
      return { ...groups, [key]: [...(groups[key] ?? []), item] };
    }, {});

    return Object.entries(grouped).map(([field, items]) => {
      const totalCandidates = items.reduce((sum, item) => sum + item.count, 0) || 1;
      return {
        field,
        minimum: Math.round(items.reduce((sum, item) => sum + item.minimum * item.count, 0) / totalCandidates),
        maximum: Math.round(items.reduce((sum, item) => sum + item.maximum * item.count, 0) / totalCandidates),
      };
    });
  }, [filteredSalaryData]);

  const experienceTable = useMemo(
    () =>
      experienceOptions
        .filter((experience) => experience !== "All Experience")
        .map((experience) => {
          const items = filteredSalaryData.filter((item) => item.experience === experience);
          const totalCandidates = items.reduce((sum, item) => sum + item.count, 0);
          const divisor = totalCandidates || 1;
          return {
            experience,
            candidates: totalCandidates,
            minimum: Math.round(items.reduce((sum, item) => sum + item.minimum * item.count, 0) / divisor),
            maximum: Math.round(items.reduce((sum, item) => sum + item.maximum * item.count, 0) / divisor),
            highest: items.length ? Math.max(...items.map((item) => item.maximum)) : 0,
          };
        }),
    [filteredSalaryData],
  );

  const salaryRangeData = useMemo(
    () =>
      salaryRanges.map((range) => ({
        name: range,
        value: filteredSalaryData
          .filter((item) => getSalaryRange((item.minimum + item.maximum) / 2) === range)
          .reduce((sum, item) => sum + item.count, 0),
      })),
    [filteredSalaryData],
  );

  return (
    <div className="page-stack">
      <div className="page-title-block">
        <h1>Salary Insights</h1>
        <p>Insights about salary ranges</p>
      </div>

      <AdminPanel className="filter-panel">
        <div className="salary-filter-grid">
          <FilterSelect
            label="Field"
            value={draftFilters.field}
            options={fieldOptions}
            onChange={(value) => setDraftFilters((filters) => ({ ...filters, field: value }))}
          />
          <FilterSelect
            label="Experience"
            value={draftFilters.experience}
            options={experienceOptions}
            onChange={(value) => setDraftFilters((filters) => ({ ...filters, experience: value }))}
          />
          <DateRangeInput
            from={draftFilters.fromDate}
            to={draftFilters.toDate}
            onFromChange={(value) => setDraftFilters((filters) => ({ ...filters, fromDate: value }))}
            onToChange={(value) => setDraftFilters((filters) => ({ ...filters, toDate: value }))}
          />
          <AdminButton icon={<FiFilter />} onClick={() => setAppliedFilters(draftFilters)} disabled={!dateRangeValid}>
            Apply
          </AdminButton>
        </div>
      </AdminPanel>

      <section className="salary-layout">
        <AdminPanel className="chart-panel">
          <h2>Salary Distribution</h2>
          <SalaryBarChart data={salaryDistribution} />
        </AdminPanel>

        <div className="salary-side-stack">
          <section className="overview-grid">
            <StatCard title="Average Minimum Salary" value="$72,500" icon={<FiDollarSign />} />
            <StatCard title="Average Maximum Salary" value="$125,300" icon={<FiTrendingUp />} />
            <StatCard title="Highest Salary Range" value="$200K+" icon={<FiDollarSign />} />
            <StatCard title="Total Candidates" value="2,458" icon={<FiUsers />} />
          </section>

          <AdminPanel className="chart-panel">
            <h2>Candidates by Salary Range</h2>
            <SalaryDonutChart data={salaryRangeData} />
          </AdminPanel>
        </div>
      </section>

      <AdminPanel className="table-panel">
        <div className="panel-header">
          <h2>Salary Range by Experience</h2>
        </div>
        <div className="table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Experience</th>
                <th>Candidates</th>
                <th>Average Minimum</th>
                <th>Average Maximum</th>
                <th>Highest Range</th>
              </tr>
            </thead>
            <tbody>
              {experienceTable.map((row) => (
                <tr key={row.experience}>
                  <td className="table-primary">{row.experience}</td>
                  <td>{row.candidates.toLocaleString("en-US")}</td>
                  <td>{money(row.minimum)}</td>
                  <td>{money(row.maximum)}</td>
                  <td className="table-strong">{row.highest ? `${money(row.highest)}+` : "$0"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminPanel>
    </div>
  );
};

export default SalaryInsights;
