import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
}

export function usePageSEO({ title, description, keywords }: SEOProps) {
  useEffect(() => {
    // 1. Update Title
    const formattedTitle = title.includes('NexGen') ? title : `${title} — NexGen AI`;
    document.title = formattedTitle;

    // 2. Helper to set or create meta tag
    const setMeta = (nameOrProperty: string, key: 'name' | 'property', content: string) => {
      let meta = document.querySelector(`meta[${key}="${nameOrProperty}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(key, nameOrProperty);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // 3. Update Standard Meta
    setMeta('title', 'name', formattedTitle);
    setMeta('description', 'name', description);
    if (keywords) {
      setMeta('keywords', 'name', keywords);
    }

    // 4. Update Open Graph
    setMeta('og:title', 'property', formattedTitle);
    setMeta('og:description', 'property', description);

    // 5. Update Twitter
    setMeta('twitter:title', 'name', formattedTitle);
    setMeta('twitter:description', 'name', description);

    // 6. Scroll window to top on route change (unless hash exists)
    if (!window.location.hash) {
      window.scrollTo(0, 0);
    }
  }, [title, description, keywords]);
}
