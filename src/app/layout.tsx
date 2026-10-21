import type { Metadata } from 'next';
import './globals.css';
import './dashboard-luxury.css';
import AppShell from '@/components/AppShell';

export const metadata: Metadata = {
  title: 'Paradise Hospitality | Luxury Suites, Resort & Hotel Management',
  description: 'Welcome to Paradise Hospitality. Experience world-class 5-star luxury living, bespoke suites, and an advanced hotel management platform.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,400;1,600&display=swap" rel="stylesheet" />
      </head>
      <body>
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
