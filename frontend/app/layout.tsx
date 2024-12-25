import { type ReactNode } from 'react';
import { Providers } from './providers';
import '../styles/globals.css';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="w-screen h-screen">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
