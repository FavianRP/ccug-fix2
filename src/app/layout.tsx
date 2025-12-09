import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Inter, Roboto_Mono } from 'next/font/google';

// Inter untuk teks utama
const inter = Inter({ subsets: ['latin'], weight: ['400','500','700'] });

// Roboto Mono untuk monospace / code
const robotoMono = Roboto_Mono({ subsets: ['latin'], weight: ['400','700'] });

export const metadata: Metadata = {
  title: 'Cyber Community Universitas Gunadarma',
  description: 'Tim Akademik Universitas Gunadarma',
  icons: {
    icon: "/ccug.png",
    shortcut: "/ccug.png",
    apple: "/ccug.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* Terapkan Inter sebagai font utama */}
      <body className={inter.className}>
        <Navbar />
        <main className="pt-20 min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
