import { useEffect, useRef } from 'react';

/**
 * ============================================================
 * ADSTERRA ADS COMPONENT - ULTIMATE ALARM
 * ============================================================
 * 
 * HOW TO ADD YOUR ADSTERRA AD CODES:
 * 
 * 1. Banner 468x60:
 *    - Go to Adsterra Dashboard → Sites → Get Code
 *    - Copy the script tag for 468x60 banner
 *    - Replace the placeholder script in AdsterraBanner component below
 * 
 * 2. Smartlink:
 *    - Go to Adsterra Dashboard → Direct Link
 *    - Copy your smartlink URL
 *    - Replace the URL in AdsterraSmartlink component below
 * 
 * 3. Social Bar:
 *    - Go to Adsterra Dashboard → Social Bar
 *    - Copy the script code
 *    - Replace the placeholder in AdsterraSocialBar component below
 * 
 * IMPORTANT: Replace 'YOUR_ADSTERRA_SCRIPT_HERE' with your actual ad code!
 */

// ============================================
// 1. BANNER AD 468x60
// ============================================
// Place this at the top of your page
export function AdsterraBanner({ className = '' }: { className?: string }) {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // ⬇️⬇️⬇️ REPLACE THIS WITH YOUR ADSTERRA BANNER CODE ⬇️⬇️⬇️
    // Example Adsterra Banner Script (replace with yours):
    /*
    <script type="text/javascript">
    atOptions = {
      'key' : 'YOUR_BANNER_KEY_HERE',
      'format' : 'iframe',
      'height' : 60,
      'width' : 468,
      'params' : {}
    };
    </script>
    <script type="text/javascript" src="//www.profitablecpmrate.com/YOUR_BANNER_SCRIPT.js"></script>
    */
    
    // Current placeholder - REPLACE WITH YOUR AD CODE
    const script = document.createElement('script');
    script.type = 'text/javascript';
    // ⬇️ REPLACE THIS URL WITH YOUR ADSTERRA BANNER SCRIPT URL ⬇️
    script.src = '//www.profitablecpmrate.com/YOUR_BANNER_SCRIPT_468x60.js';
    script.async = true;
    
    if (adRef.current) {
      adRef.current.innerHTML = '';
      adRef.current.appendChild(script);
    }

    return () => {
      if (adRef.current && script.parentNode === adRef.current) {
        adRef.current.removeChild(script);
      }
    };
  }, []);

  return (
    <div 
      ref={adRef} 
      className={`adsterra-banner mx-auto ${className}`}
      style={{ 
        width: '468px', 
        height: '60px',
        maxWidth: '100%',
        overflow: 'hidden'
      }}
    >
      {/* Ad will be loaded here */}
    </div>
  );
}

// ============================================
// 2. SMARTLINK (Direct Link)
// ============================================
// This opens your smartlink in a new tab when user clicks anywhere
export function AdsterraSmartlink() {
  useEffect(() => {
    // ⬇️⬇️⬇️ REPLACE THIS WITH YOUR ADSTERRA SMARTLINK URL ⬇️⬇️⬇️
    // Example: 'https://www.profitablecpmrate.com/abc123?var=xyz'
    const SMARTLINK_URL = 'https://www.profitablecpmrate.com/YOUR_SMARTLINK_HERE';
    
    let clickCount = 0;
    const MAX_CLICKS_PER_SESSION = 3;

    const handleClick = () => {
      if (clickCount < MAX_CLICKS_PER_SESSION) {
        window.open(SMARTLINK_URL, '_blank');
        clickCount++;
      }
    };

    // Add click listener to document
    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []);

  return null; // This component doesn't render anything visible
}

// ============================================
// 3. SOCIAL BAR
// ============================================
// Sticky bar at the bottom of the screen
export function AdsterraSocialBar({ className = '' }: { className?: string }) {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // ⬇️⬇️⬇️ REPLACE THIS WITH YOUR ADSTERRA SOCIAL BAR CODE ⬇️⬇️⬇️
    // Example Adsterra Social Bar Script:
    /*
    <script type='text/javascript' src='//plXXXXX.profitablecpmrate.com/XX/XX/XX/XX.js'></script>
    */
    
    // Current placeholder - REPLACE WITH YOUR AD CODE
    const script = document.createElement('script');
    script.type = 'text/javascript';
    // ⬇️ REPLACE THIS URL WITH YOUR ADSTERRA SOCIAL BAR SCRIPT URL ⬇️
    script.src = '//www.profitablecpmrate.com/YOUR_SOCIAL_BAR_SCRIPT.js';
    script.async = true;
    
    if (adRef.current) {
      adRef.current.innerHTML = '';
      adRef.current.appendChild(script);
    }

    return () => {
      if (adRef.current && script.parentNode === adRef.current) {
        adRef.current.removeChild(script);
      }
    };
  }, []);

  return (
    <div 
      ref={adRef} 
      className={`adsterra-social fixed bottom-0 left-0 right-0 z-50 ${className}`}
      style={{ minHeight: '50px' }}
    />
  );
}

// ============================================
// 4. NATIVE AD (Optional - for content integration)
// ============================================
export function AdsterraNative({ className = '' }: { className?: string }) {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.async = true;
    // ⬇️ REPLACE WITH YOUR NATIVE AD SCRIPT URL ⬇️
    script.src = '//www.profitablecpmrate.com/YOUR_NATIVE_AD_SCRIPT.js';
    script.setAttribute('data-cfasync', 'false');
    
    if (adRef.current) {
      adRef.current.appendChild(script);
    }

    return () => {
      if (adRef.current && script.parentNode === adRef.current) {
        adRef.current.removeChild(script);
      }
    };
  }, []);

  return (
    <div 
      ref={adRef} 
      className={`adsterra-native ${className}`}
    >
      <div className="text-xs text-center text-muted-foreground py-1">Sponsored</div>
    </div>
  );
}

// ============================================
// 5. POPUNDER AD (Optional)
// ============================================
export function AdsterraPopunder() {
  useEffect(() => {
    // Only show popunder once per session
    const hasPopped = sessionStorage.getItem('adsterra-popped');
    if (hasPopped) return;

    const script = document.createElement('script');
    script.type = 'text/javascript';
    // ⬇️ REPLACE WITH YOUR POPUNDER SCRIPT URL ⬇️
    script.src = '//www.profitablecpmrate.com/YOUR_POPUNDER_SCRIPT.js';
    script.async = true;
    
    document.body.appendChild(script);
    sessionStorage.setItem('adsterra-popped', 'true');

    return () => {
      if (script.parentNode) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return null;
}

// ============================================
// MAIN EXPORT - All Ad Types
// ============================================
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
      return <AdsterraSocialBar className={className} />;
    case 'smartlink':
      return <AdsterraSmartlink />;
    default:
      return null;
  }
}

export default AdsterraAd;
