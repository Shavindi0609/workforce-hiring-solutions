type SalaryBarChartItem = {
  field: string;
  minimum: number;
  maximum: number;
};

type SalaryBarChartProps = {
  data: SalaryBarChartItem[];
};

const SalaryBarChart = ({ data }: SalaryBarChartProps) => {
  const highest = Math.max(...data.map((item) => item.maximum), 1);

  return (
    <div className="salary-bars">
      {data.map((item) => (
        <div className="salary-bar-item" key={item.field}>
          <div className="salary-bar-track">
            <div className="salary-bar-fill" style={{ height: `${Math.max((item.maximum / highest) * 100, 8)}%` }} />
          </div>
          <span>{item.field}</span>
        </div>
      ))}
    </div>
  );
};

export default SalaryBarChart;
