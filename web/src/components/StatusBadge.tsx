import { Status, StatusColors } from '@/lib/types';

interface Props {
  status: Status;
}

export default function StatusBadge({ status }: Props) {
  const colors = StatusColors[status];
  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${colors}`}>
      {status}
    </span>
  );
}
