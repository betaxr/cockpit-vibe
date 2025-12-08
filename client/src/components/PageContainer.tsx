import { cn } from "@/lib/utils";

type PageContainerProps = {
  children: React.ReactNode;
  className?: string;
};

export default function PageContainer({ children, className }: PageContainerProps) {
  return (
    <div className={cn("max-w-5xl mx-auto px-6 pt-10 pb-12", className)}>
      {children}
    </div>
  );
}
