export type SalaryDistributionItem = {
  range: string;
  count: number;
  heightClass: string;
};

export type SalaryLegendItem = {
  label: string;
  value: string;
  color: 'blue' | 'indigo' | 'green' | 'orange' | 'coral' | 'purple' | 'pink';
};

export type SalaryExperienceRow = {
  experience: string;
  min: string;
  max: string;
};

export const salaryDistribution: SalaryDistributionItem[] = [
  { range: '0 - 40K', count: 96, heightClass: 'salary-bar-height-96' },
  { range: '40K - 60K', count: 248, heightClass: 'salary-bar-height-248' },
  { range: '60K - 80K', count: 412, heightClass: 'salary-bar-height-412' },
  { range: '80K - 100K', count: 568, heightClass: 'salary-bar-height-568' },
  { range: '100K - 150K', count: 676, heightClass: 'salary-bar-height-676' },
  { range: '150K - 200K', count: 312, heightClass: 'salary-bar-height-312' },
  { range: '200K+', count: 148, heightClass: 'salary-bar-height-148' },
];

export const salaryLegend: SalaryLegendItem[] = [
  { label: '0 - 40K', value: '96 (3.9%)', color: 'blue' },
  { label: '40K - 60K', value: '248 (10.1%)', color: 'indigo' },
  { label: '60K - 80K', value: '412 (16.8%)', color: 'green' },
  { label: '80K - 100K', value: '568 (23.1%)', color: 'orange' },
  { label: '100K - 150K', value: '676 (27.5%)', color: 'coral' },
  { label: '150K - 200K', value: '312 (12.7%)', color: 'purple' },
  { label: '200K+', value: '148 (6.0%)', color: 'pink' },
];

export const salaryRangeRows: SalaryExperienceRow[] = [
  { experience: '0 - 2 Years', min: '$45,200', max: '$72,300' },
  { experience: '2 - 4 Years', min: '$60,300', max: '$95,400' },
  { experience: '4 - 6 Years', min: '$80,100', max: '$130,600' },
  { experience: '6+ Years', min: '$110,500', max: '$185,700' },
];

export const salaryOverview = [
  { label: 'Average Minimum Salary', value: '$72,500' },
  { label: 'Average Maximum Salary', value: '$125,300' },
  { label: 'Highest Salary Range', value: '$200K+' },
  { label: 'Total Candidates', value: '2,450' },
];
