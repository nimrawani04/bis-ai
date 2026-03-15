import { BISLogo } from '@/components/BISLogo';
import ashokaChakra from '@/assets/ashoka-chakra.png';
import { ExternalLink } from 'lucide-react';

const footerLinks = {
  'About': [
    { label: 'About BIS', href: 'https://www.bis.gov.in/about-bis/' },
    { label: 'Vision & Mission', href: 'https://www.bis.gov.in/about-bis/vision-mission/' },
    { label: 'Organization', href: 'https://www.bis.gov.in/about-bis/organization/' },
    { label: 'Contact Us', href: 'https://www.bis.gov.in/contact-us/' },
  ],
  'Services': [
    { label: 'Product Certification', href: 'https://www.bis.gov.in/product-certification/' },
    { label: 'Hallmarking', href: 'https://www.bis.gov.in/hallmarking/' },
    { label: 'Standards', href: 'https://www.bis.gov.in/standardization/' },
    { label: 'Manak Online', href: 'https://manakonline.bis.gov.in' },
  ],
  'Consumer': [
    { label: 'Consumer Affairs', href: 'https://www.bis.gov.in/consumer-affairs/' },
    { label: 'Lodge Complaint', href: 'https://www.bis.gov.in/consumer-affairs/lodge-complaint/' },
    { label: 'BIS Care App', href: 'https://www.bis.gov.in/bis-care-app/' },
    { label: 'Verify Certificate', href: '#verify' },
  ],
};

export function Footer() {
  return (
    <footer className="bg-[hsl(var(--flag-navy))] text-white/80">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <img src={ashokaChakra} alt="Emblem" className="h-10 w-10 invert brightness-200 opacity-90" />
              <div>
                <p className="text-white font-bold text-sm leading-tight">Bureau of Indian Standards</p>
                <p className="text-white/50 text-[10px]">भारतीय मानक ब्यूरो</p>
              </div>
            </div>
            <p className="text-xs text-white/50 leading-relaxed mb-2">
              Ministry of Consumer Affairs, Food &amp; Public Distribution, Government of India.
            </p>
            <p className="text-xs text-white/50 leading-relaxed mb-4">
              Manak Bhawan, 9 Bahadur Shah Zafar Marg, New Delhi 110002 • Helpline: 1800-11-4000
            </p>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-white/10 border border-white/10">
                <BISLogo className="h-5 w-5" />
              </div>
              <span className="text-sm font-bold text-white">BIS AI Portal</span>
            </div>
          </div>
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h3 className="text-white font-semibold text-xs uppercase tracking-widest mb-3 pb-2 border-b border-white/10">
                {section}
              </h3>
              <ul className="space-y-2">
                {links.map(link => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target={link.href.startsWith('http') ? '_blank' : undefined}
                      rel={link.href.startsWith('http') ? 'noreferrer' : undefined}
                      className="text-xs text-white/60 hover:text-white transition-colors flex items-center gap-1"
                    >
                      {link.href.startsWith('http') && <ExternalLink className="h-2.5 w-2.5 shrink-0" />}
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="tricolor-strip w-full" />
      <div className="bg-black/30 px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-white/40">
          <p>© 2026 Bureau of Indian Standards, Government of India. All Rights Reserved.</p>
          <p>
            Developed by{' '}
            <a href="https://m4milaad.github.io/" target="_blank" rel="noreferrer" className="text-white/60 hover:text-white transition-colors font-medium">Milad Ajaz Bhat</a>
            {' '}&amp;{' '}
            <a href="https://nimrawani.vercel.app/" target="_blank" rel="noreferrer" className="text-white/60 hover:text-white transition-colors font-medium">Nimra Wani</a>
            {' '}— Demonstration Project
          </p>
          <div className="flex items-center gap-3">
            <a href="#" className="hover:text-white/70 transition-colors">Privacy Policy</a>
            <span>|</span>
            <a href="#" className="hover:text-white/70 transition-colors">Terms of Use</a>
            <span>|</span>
            <a href="#" className="hover:text-white/70 transition-colors">Accessibility</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
