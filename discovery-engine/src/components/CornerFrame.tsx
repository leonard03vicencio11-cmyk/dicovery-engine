export default function CornerFrame({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative p-6 md:p-10 ${className}`}>
      <span className="absolute top-0 left-0 h-4 w-4 border-t-2 border-l-2 border-[var(--dossier-red)]" />
      <span className="absolute top-0 right-0 h-4 w-4 border-t-2 border-r-2 border-[var(--dossier-red)]" />
      <span className="absolute bottom-0 left-0 h-4 w-4 border-b-2 border-l-2 border-[var(--dossier-red)]" />
      <span className="absolute bottom-0 right-0 h-4 w-4 border-b-2 border-r-2 border-[var(--dossier-red)]" />
      {children}
    </div>
  );
}
