import { useEffect, useRef } from 'react';

/**
 * ============================================================
 * ADSTERRA ADS COMPONENT - ULTIMATE PROFESSIONAL VERSION
 * ============================================================
 */

// 1. NATIVE BANNER
export function AdsterraNative({ className = '' }: { className?: string }) {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://pl28499802.effectivegatecpm.com/9f87f24429f10bc14a8cfecc22feb80e/invoke.js";
    script.async = true;
    script.setAttribute('data-cfasync', 'false');

    if (adRef.current) {
      adRef.current.appendChild(script);
    }

    return () => {
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, []);

  return (
    <div className={`adsterra-native ${className}`}>
      <div id="container-9f87f24429f10bc14a8cfecc22feb80e"></div>
    </div>
  );
}

// 2. BANNER 468x60
export function AdsterraBanner({ className = '' }: { className?: string }) {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (window as any).atOptions = {
      'key' : '7fca0aabf8fdfa928ce23eaead0895b9',
      'format' : 'iframe',
      'height' : 60,
      'width' : 468,
      'params' : {}
    };

    const script = document.createElement('script');
    script.src = "https://www.highperformanceformat.com/7fca0aabf8fdfa928ce23eaead0895b9/invoke.js";
    script.async = true;

    if (adRef.current) {
      adRef.current.innerHTML = '';
      adRef.current.appendChild(script);
    }
  }, []);

  return (
    <div
      ref={adRef}
      className={`adsterra-banner mx-auto ${className}`}
      style={{ width: '468px', height: '60px', minHeight: '60px' }}
    />
  );
}

// 3. POPUNDER
export function AdsterraPopunder() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://pl28499793.effectivegatecpm.com/ae/f4/7e/aef47e23d6650fb664cb0d5d6e2f9334.js";
    script.async = true;
    
    document.body.appendChild(script);

    return () => {
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, []);

  return null;
}

// 4. SOCIAL BAR
export function AdsterraSocialBar() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://pl28499842.effectivegatecpm.com/1d/c4/83/1dc483022bdea82c38794c6963d8072e.js";
    script.async = true;
    
    document.body.appendChild(script);

    return () => {
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, []);

  return null;
}

// 5. SMARTLINK (Script-based)
export function AdsterraSmartlink() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://pl28499842.effectivegatecpm.com/1d/c4/83/1dc483022bdea82c38794c6963d8072e.js";
    script.async = true;
    
    document.body.appendChild(script);

    return () => {
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, []);

  return null;
}

// المكون الرئيسي الشامل (Master Component)
export type AdType = 'banner' | 'native' | 'popunder' | 'social' | 'smartlink';

interface AdsterraAdProps {
  type: AdType;
  className?: string;
}

export function AdsterraAd({ type, className = '' }: AdsterraAdProps) {
  switch (type) {
    case 'banner':
      return <AdsterraBanner className={className} />;
    case 'native':
      return <AdsterraNative className={className} />;
    case 'popunder':
      return <AdsterraPopunder />;
    case 'social':
      return <AdsterraSocialBar />;
    case 'smartlink':
      return <AdsterraSmartlink />;
    default:
      return null;
  }
}

export default AdsterraAd;
