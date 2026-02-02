import { Github, Linkedin, Instagram, Mail, Rss } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-ccug-gray/30 mt-16">
      <div className="container mx-auto px-6 py-8">
        {/* Desktop Layout */}
        <div className="hidden md:flex items-center justify-between">
          <p className="text-gray-400 text-sm">
            © 2025 Cyber Community Universitas Gunadarma | All rights reserved.
          </p>
          
          <div className="flex items-center gap-4">
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="GitHub"
            >
              <Github className="w-5 h-5 hover:text-ccug-purple transition" />
            </a>
            <a 
              href="https://linkedin.com" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-5 h-5 hover:text-ccug-purple transition" />
            </a>
            <a 
              href="https://www.instagram.com/cybercom.ug/" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <Instagram className="w-5 h-5 hover:text-ccug-purple transition" />
            </a>
            <a 
              href="mailto:cycomug@gmail.com"
              aria-label="Email"
            >
              <Mail className="w-5 h-5 hover:text-ccug-purple transition" />
            </a>
            <a 
              href="/rss"
              aria-label="RSS Feed"
            >
              <Rss className="w-5 h-5 hover:text-ccug-purple transition" />
            </a>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden space-y-4">
          <div className="flex justify-center gap-6">
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="GitHub"
            >
              <Github className="w-6 h-6 hover:text-ccug-purple transition" />
            </a>
            <a 
              href="https://linkedin.com" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-6 h-6 hover:text-ccug-purple transition" />
            </a>
            <a 
              href="https://www.instagram.com/cybercom.ug/" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <Instagram className="w-6 h-6 hover:text-ccug-purple transition" />
            </a>
            <a 
              href="mailto:cycomug@gmail.com"
              aria-label="Email"
            >
              <Mail className="w-6 h-6 hover:text-ccug-purple transition" />
            </a>
            <a 
              href="/rss"
              aria-label="RSS Feed"
            >
              <Rss className="w-6 h-6 hover:text-ccug-purple transition" />
            </a>
          </div>
          
          <p className="text-gray-400 text-xs text-center">
            © 2025 Cyber Community Universitas Gunadarma
          </p>
          <p className="text-gray-400 text-xs text-center">
            All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}