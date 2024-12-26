import { type ReactNode } from 'react';
import { Providers } from './providers';
import '../styles/globals.css';
import Navbar from '../components/navbar';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="w-screen h-screen">
            <Navbar/>
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
