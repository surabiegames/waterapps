import { cn } from "@/lib/utils";

type BentoGridProps = {
  className?: string;
  children: React.ReactNode;
};

type BentoGridItemProps = {
  id?: string;
  className?: string;
  title: string;
  description: string;
  icon?: React.ReactNode;
};

export function BentoGrid({ className, children }: BentoGridProps) {
  return <div className={cn("grid auto-rows-[1fr] grid-cols-1 gap-4 md:grid-cols-2", className)}>{children}</div>;
}

export function BentoGridItem({ id, className, title, description, icon }: BentoGridItemProps) {
  return (
    <article
      id={id}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-sky-300 hover:shadow-lg",
        className,
      )}
    >
      <div className="mb-4 text-sky-700">{icon}</div>
      <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
    </article>
  );
}
