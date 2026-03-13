import { BISLogo } from '@/components/BISLogo';

export function Footer() {
  return (
    <footer className="border-t border-border bg-card py-8 sm:py-12">
      <div className="container px-4">
        <div className="flex flex-col items-center gap-6 text-center md:text-left md:flex-row md:justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-white/95 ring-1 ring-border/40 shadow-sm">
              <BISLogo className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <span className="text-lg sm:text-xl font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              BIS<span className="text-primary"> AI</span>
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
            Developed by{" "}
            <a
              href="https://m4milaad.github.io/"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-foreground hover:text-primary transition-colors"
            >
              Milad Ajaz Bhat
            </a>{" "}
            and{" "}
            <a
              href="https://nimrawani.vercel.app/"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-foreground hover:text-primary transition-colors"
            >
              Nimra Wani
            </a>
            . This is a <strong>demonstration project</strong>.
          </p>
        </div>
      </div>
    </footer>
  );
}
