type SalaryDonutItem = {
  name: string;
  value: number;
};

type SalaryDonutChartProps = {
  data: SalaryDonutItem[];
};

const SalaryDonutChart = ({ data }: SalaryDonutChartProps) => (
  <div className="salary-donut-summary">
    <ul>
      {data.map((item) => (
        <li key={item.name}>
          <span>{item.name}</span>
          <strong>{item.value.toLocaleString("en-US")}</strong>
        </li>
      ))}
    </ul>
  </div>
);

export default SalaryDonutChart;
