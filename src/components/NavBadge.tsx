export function NavBadge({ count }: { count: number }) {
  if (count <= 0) return null;

  return (
    <span className="ml-1 inline-flex items-center justify-center min-w-[1.1rem] h-[1.1rem] px-1 rounded-full bg-gold text-ink text-[10px] font-semibold leading-none">
      {count > 9 ? "9+" : count}
    </span>
  );
}
