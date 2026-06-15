export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[20px] bg-white py-16 text-center card-shadow">
      <div className="text-5xl mb-4">📭</div>
      <h3 className="text-[16px] font-bold text-gray-900">{title}</h3>
      <p className="mt-2 max-w-xs text-[13px] text-gray-500">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
