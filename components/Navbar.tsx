'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Dumbbell, BookOpen, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';

const navLinks = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/training', label: 'Training', icon: Dumbbell },
    { href: '/exercises', label: 'Exercises', icon: BookOpen },
];

export function Navbar() {
    const pathname = usePathname();

    return (
        <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg group-hover:scale-105 transition-transform">
                            <Dumbbell className="h-4 w-4" />
                        </div>
                        <span className="font-bold text-lg tracking-tight">
                            Power<span className="text-primary">Track</span>
                        </span>
                    </Link>

                    {/* Nav links */}
                    <nav className="flex items-center gap-1">
                        {navLinks.map(({ href, label, icon: Icon }) => {
                            const isActive =
                                href === '/' ? pathname === '/' : pathname.startsWith(href);
                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    className={cn(
                                        'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all duration-150',
                                        isActive
                                            ? 'bg-primary/15 text-primary'
                                            : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                                    )}
                                >
                                    <Icon className="h-4 w-4" />
                                    <span className="hidden sm:inline">{label}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </div>
        </header>
    );
}
