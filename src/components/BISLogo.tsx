type BISLogoProps = {
  className?: string;
  alt?: string;
};

export function BISLogo({ className = "h-5 w-5", alt = "BIS logo" }: BISLogoProps) {
  return (
    <img
      src="/favicon.ico"
      alt={alt}
      className={`object-contain ${className}`}
      loading="eager"
      decoding="async"
    />
  );
}
