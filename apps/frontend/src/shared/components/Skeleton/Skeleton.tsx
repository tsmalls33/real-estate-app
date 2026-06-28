type Props = {
  className?: string;
  count?: number;
};

export default function Skeleton({ className, count = 1 }: Props) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className={`skeleton ${className ?? ''}`} aria-hidden />
      ))}
    </>
  );
}
