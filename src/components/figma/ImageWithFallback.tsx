import { useState } from "react";

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
}

export function ImageWithFallback({ src, alt, className }: ImageWithFallbackProps) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  if (error) {
    return (
      <div
        className={`bg-gradient-to-br from-[#E0C7A0] to-[#AF8B5F] flex items-center justify-center ${className}`}
      >
        <span className="text-white/80 text-sm">Imagem indisponível</span>
      </div>
    );
  }

  return (
    <>
      {loading && (
        <div className={`bg-[#E0C7A0] animate-pulse ${className}`} />
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} ${loading ? 'hidden' : ''}`}
        onLoad={() => setLoading(false)}
        onError={() => {
          setError(true);
          setLoading(false);
        }}
      />
    </>
  );
}
