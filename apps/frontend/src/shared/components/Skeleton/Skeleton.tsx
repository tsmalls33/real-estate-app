type Props = {
  className?: string;
  count?: number;
};

export default function Skeleton({ className, count = 1 }: Props) {
  const n = Math.max(0, Math.floor(count));
  return (
    <>
      {Array.from({ length: n }, (_, i) => (
        <div key={i} className={`skeleton ${className ?? ''}`} aria-hidden />
      ))}
    </>
  );
}
