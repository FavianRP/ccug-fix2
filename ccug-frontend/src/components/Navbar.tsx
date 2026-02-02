'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleAboutClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (pathname === '/') {
      // Jika di home, scroll langsung
      const aboutSection = document.getElementById('about-section');
      if (aboutSection) {
        aboutSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      // Jika di halaman lain, navigasi ke home dengan query param
      router.push('/?scroll=about');
    }
    setIsMenuOpen(false);
  };

  // Scroll ke About jika ada query ?scroll=about
  useEffect(() => {
    if (pathname === '/' && searchParams.get('scroll') === 'about') {
      const aboutSection = document.getElementById('about-section');
      if (aboutSection) {
        aboutSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [pathname, searchParams]);

  return (
    <nav className="border-b border-ccug-gray/30 backdrop-blur-sm fixed w-full top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <img src="/navbar_logo.png" alt="CCUG Logo" className="h-10 w-auto"/>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <a 
              href="#about-section" 
              onClick={handleAboutClick}
              className="hover:text-ccug-purple transition cursor-pointer"
            >
              About
            </a>
            <Link href="/members" className="hover:text-ccug-purple transition">
              Members
            </Link>
            <Link href="/contests" className="hover:text-ccug-purple transition">
              Contests
            </Link>
            <Link href="/posts" className="hover:text-ccug-purple transition">
              Posts
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={toggleMenu}
            className="md:hidden p-2 hover:text-ccug-purple transition"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-4 border-t border-ccug-gray/30 pt-4">
            <a 
              href="#about-section" 
              onClick={handleAboutClick}
              className="block hover:text-ccug-purple transition py-2 cursor-pointer"
            >
              About
            </a>
            <Link 
              href="/members" 
              className="block hover:text-ccug-purple transition py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Members
            </Link>
            <Link 
              href="/contests" 
              className="block hover:text-ccug-purple transition py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Contests
            </Link>
            <Link 
              href="/posts" 
              className="block hover:text-ccug-purple transition py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Posts
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
