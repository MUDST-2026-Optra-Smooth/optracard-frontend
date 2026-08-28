interface OrderHistoryStatProps {
  label: string;
  value: string;
  detail: string;
  detailTone?: 'blue' | 'green';
}

export const OrderHistoryStat = ({
  label,
  value,
  detail,
  detailTone = 'green',
}: OrderHistoryStatProps) => {
  const detailColor = detailTone === 'blue' ? 'text-[#2f65ff]' : 'text-[#18a36b]';

  return (
    <div className="rounded-xl border border-[#e6e9ef] bg-white px-5 py-4 shadow-[0_2px_8px_rgba(27,39,63,0.04)]">
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#a1a8b3]">{label}</p>
      <div className="mt-1 flex items-end gap-3">
        <p className="text-2xl font-black leading-none text-[#171a20]">{value}</p>
        <p className={`pb-0.5 text-[10px] font-bold ${detailColor}`}>{detail}</p>
      </div>
    </div>
  );
};
