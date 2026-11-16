import Link from 'next/link';
import { Mail, Instagram, ArrowUpRight, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-[#262626] bg-[#050505] text-[#a3a3a3] font-sans text-xs mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-[#262626]">
          {/* Brand Info */}
          <div className="md:col-span-6 space-y-4">
            <div className="font-heading text-2xl font-extrabold tracking-tight text-white">
              Cyber Community Universitas Gunadarma
            </div>
            <p className="text-[#a3a3a3] text-sm leading-relaxed max-w-md">
              Collegiate cybersecurity research organization and competitive Capture The Flag (CTF)
              roster representing Universitas Gunadarma, Jakarta, Indonesia.
            </p>
            <div className="flex items-center gap-2 text-white font-mono text-xs pt-1">
              <MapPin className="w-3.5 h-3.5 text-[#737373]" />
              <span>Universitas Gunadarma • Jakarta, Indonesia</span>
            </div>
          </div>

          {/* Quick links */}
          <div className="md:col-span-3 space-y-3">
            <div className="font-heading text-sm font-bold text-white uppercase tracking-wider">
              Navigation
            </div>
            <ul className="space-y-2 font-sans text-xs">
              <li>
                <Link href="/" className="hover:text-white transition">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/#about" className="hover:text-white transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/members" className="hover:text-white transition">
                  Roster Directory
                </Link>
              </li>
              <li>
                <Link href="/posts" className="hover:text-white transition">
                  Writeups & Blog
                </Link>
              </li>
              <li>
                <Link href="/#record" className="hover:text-white transition">
                  Tournament Record
                </Link>
              </li>
            </ul>
          </div>

          {/* Socials / Join */}
          <div className="md:col-span-3 space-y-3">
            <div className="font-heading text-sm font-bold text-white uppercase tracking-wider">
              Connect
            </div>
            <ul className="space-y-2 font-sans text-xs">
              <li>
                <a
                  href="mailto:cycomug@gmail.com"
                  className="flex items-center gap-2 hover:text-white transition"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>cycomug@gmail.com</span>
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com/cybercom.ug"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-white transition"
                >
                  <Instagram className="w-3.5 h-3.5" />
                  <span>@cybercom.ug</span>
                </a>
              </li>
              <li>
                <a
                  href="https://pendaftaran.ccug.gunadarma.ac.id"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-white transition"
                >
                  <span>Portal Pendaftaran</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px] text-[#737373]">
          <div>UNIVERSITAS GUNADARMA • JAKARTA, INDONESIA</div>
          <div>
            &copy; {new Date().getFullYear()} CCUG. ALL RIGHTS RESERVED.
          </div>
        </div>
      </div>
    </footer>
  );
}
