'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const links = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/#about' },
    { label: 'Roster', href: '/members' },
    { label: 'Writeups', href: '/posts' },
    { label: 'Trophies', href: '/#record' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-[#262626] h-20">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3.5 group">
          <div className="w-10 h-10 relative flex items-center justify-center bg-white rounded-full p-1 shadow-sm">
            <Image
              src="/img/ccug_copy.png"
              alt="Team CCUG"
              width={34}
              height={34}
              className="object-contain invert"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="font-heading text-lg font-extrabold tracking-tight text-white leading-none">
              CCUG
            </span>
            <span className="font-mono text-[10px] text-[#737373] tracking-wider">
              Gunadarma • Jakarta
            </span>
          </div>
        </Link>

        {/* Center Nav */}
        <nav className="hidden lg:flex items-center gap-8 font-sans text-sm font-medium">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`transition-colors py-1 ${
                  isActive
                    ? 'text-white font-semibold'
                    : 'text-[#a3a3a3] hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right CTA */}
        <div className="hidden lg:flex items-center gap-4">
          <a
            href="https://pendaftaran.ccug.gunadarma.ac.id"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-black font-heading text-xs font-bold uppercase tracking-wider rounded-full hover:bg-[#e5e5e5] transition shadow-sm"
          >
            <span>Join CCUG</span>
            <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden p-2 text-[#a3a3a3] hover:text-white rounded-full"
          aria-label="Toggle Navigation"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {isOpen && (
        <div className="lg:hidden border-b border-[#262626] bg-[#0a0a0a] px-6 py-6 font-sans text-sm space-y-3">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="block text-[#a3a3a3] hover:text-white py-1"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-4 border-t border-[#262626]">
            <a
              href="https://pendaftaran.ccug.gunadarma.ac.id"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-6 py-3 bg-white text-black font-heading text-xs font-bold uppercase tracking-wider rounded-full"
            >
              <span>Join CCUG</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
