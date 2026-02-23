import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Toaster } from '@/components/ui/sonner';

const geist = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'PowerTrack — Powerlifting Tracker',
  description: 'Track your 8-week powerlifting program, log actual lifts, and monitor your progress.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geist.variable} font-sans antialiased min-h-screen`}>
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  );
}
