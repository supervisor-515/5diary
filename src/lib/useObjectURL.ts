import { useEffect, useState } from 'react';

// Create and revoke an object URL for a Blob for the lifetime it is shown.
export const useObjectURL = (blob: Blob | null | undefined): string | null => {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!blob) {
      setUrl(null);
      return;
    }
    const u = URL.createObjectURL(blob);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [blob]);
  return url;
};
