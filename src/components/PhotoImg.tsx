import { useEffect, useState } from 'react';
import { getPhoto } from '../lib/db';

type Props = {
  photoId: string;
  variant?: 'thumb' | 'full';
  alt?: string;
  className?: string;
};

// Loads a photo blob by id and renders it as an object URL, revoking on cleanup.
export default function PhotoImg({
  photoId,
  variant = 'thumb',
  alt = '',
  className,
}: Props) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let revoke: string | null = null;
    let active = true;
    getPhoto(photoId).then((p) => {
      if (!active || !p) return;
      const blob = variant === 'full' ? p.full : p.thumb;
      const u = URL.createObjectURL(blob);
      revoke = u;
      setUrl(u);
    });
    return () => {
      active = false;
      if (revoke) URL.revokeObjectURL(revoke);
    };
  }, [photoId, variant]);

  if (!url) return <div className={className} aria-hidden />;
  return <img src={url} alt={alt} className={className} draggable={false} />;
}
