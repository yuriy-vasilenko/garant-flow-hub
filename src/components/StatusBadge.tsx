import { Availability } from '@/types/product';

interface StatusBadgeProps {
  status: Availability;
}

const config = {
  available: {
    label: 'В наличии',
    dotClass: 'bg-status-available',
    badgeClass: 'bg-status-available-bg text-status-available border-status-available/20',
  },
  check: {
    label: 'Наличие уточняется',
    dotClass: 'bg-status-check',
    badgeClass: 'bg-status-check-bg text-status-check border-status-check/20',
  },
};

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const c = config[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${c.badgeClass}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dotClass}`} />
      {c.label}
    </span>
  );
};
