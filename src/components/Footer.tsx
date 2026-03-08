import { Shield } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border bg-card py-8 sm:py-12">
      <div className="container px-4">
        <div className="flex flex-col items-center gap-6 text-center md:text-left md:flex-row md:justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg gradient-hero">
              <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" />
            </div>
            <span className="text-lg sm:text-xl font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Standard<span className="text-primary">Shield</span>
            </span>
          </div>
          
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xs sm:max-w-none">
            Empowering consumers with product safety information. 
            Aligned with Bureau of Indian Standards initiatives.
          </p>

          <div className="flex items-center gap-4 sm:gap-6">
            <a href="#" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">
              Privacy
            </a>
            <a href="#" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">
              Terms
            </a>
            <a href="#" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </a>
          </div>
        </div>

        <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-border text-center">
          <p className="text-[10px] sm:text-xs text-muted-foreground">
            © 2024 StandardShield. Built for Smart India Hackathon.
            This is a demonstration project.
          </p>
        </div>
      </div>
    </footer>
  );
}
