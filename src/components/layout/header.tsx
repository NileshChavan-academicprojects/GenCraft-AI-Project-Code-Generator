
import Link from 'next/link';
import { Wand2 } from 'lucide-react';

export function Header() {
  return (
    <header className="py-4 px-6 bg-card border-b border-border shadow-sm">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-primary font-headline">
          <Wand2 className="h-7 w-7" />
          <span>GenCraft</span>
        </Link>
        {/* Navigation links can be added here if needed in the future */}
      </div>
    </header>
  );
}
