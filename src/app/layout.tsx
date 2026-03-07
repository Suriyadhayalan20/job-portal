import type { Metadata } from 'next';
import './globals.css';
import Providers from './providers';

export const metadata: Metadata = {
  title: { default: 'TalentBridge – Find Your Dream Job', template: '%s | TalentBridge' },
  description: 'Discover thousands of job opportunities from top companies. Post jobs, apply, and manage your career with TalentBridge.',
  keywords: ['jobs', 'careers', 'hiring', 'employment', 'job portal'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
