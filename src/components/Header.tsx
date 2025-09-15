// This component is no longer used and can be safely removed or ignored.
// Kept for historical purposes.

import { cn } from "@/lib/utils";

type HeaderProps = {
  children: React.ReactNode;
  className?: string;
};

export default function Header({ children, className }: HeaderProps) {
  return (
    <header className={cn("sticky top-0 z-10 w-full bg-card shadow-sm border-b", className)}>
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {children}
      </div>
    </header>
  );
}
