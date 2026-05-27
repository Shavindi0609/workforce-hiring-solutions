import type { ReactNode } from "react";

type StatCardProps = {
  title: string;
  value: string;
  icon: ReactNode;
};

const StatCard = ({ title, value, icon }: StatCardProps) => (
  <article className="stat-card">
    <div className="stat-icon">{icon}</div>
    <div>
      <span>{title}</span>
      <strong>{value}</strong>
    </div>
  </article>
);

export default StatCard;
