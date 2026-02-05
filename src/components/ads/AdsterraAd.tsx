import { useEffect, useRef } from 'react';

/**
 * ============================================================
 * ADSTERRA ADS COMPONENT - FINAL PRODUCTION VERSION
 * ============================================================
 */

// 1. NATIVE BANNER (كما هو - لم يتغير)
export function AdsterraNative({ className = '' }: { className?: string }) {
  const adRef = useRef<HTMLDivElement>(null);
  const isLoaded = useRef(false);

  useEffect(() => {
    if (isLoaded.current || !adRef.current) return;

    const script = document.createElement('script');
    script.src = "https://pl28499802.effectivegatecpm.com/9f87f24429f10bc14a8cfecc22feb80e/invoke.js";
    script.async = true;
    script.setAttribute('data-cfasync', 'false');

    adRef.current.appendChild(script);
    isLoaded.current = true;
  }, []);

  return (
    <div className={`adsterra-native ${className}`} style={{ minHeight: '100px' }}>
      <div id="container-9f87f24429f10bc14a8cfecc22feb80e"></div>
    </div>
  );
}

// 2. BANNER 468x60 (كما هو - لم يتغير)
export function AdsterraBanner({ className = '' }: { className?: string }) {
  const adRef = useRef<HTMLDivElement>(null);
  const isLoaded = useRef(false);

  useEffect(() => {
    if (isLoaded.current || !adRef.current) return;

    const conf = document.createElement('script');
    conf.type = 'text/javascript';
    conf.innerHTML = `
      if (typeof atOptions === 'undefined') {
        atOptions = {
          'key' : '7fca0aabf8fdfa928ce23eaead0895b9',
          'format' : 'iframe',
          'height' : 60,
          'width' : 468,
          'params' : {}
        };
      }
    `;

    const script = document.createElement('script');
    script.src = "https://www.highperformanceformat.com/7fca0aabf8fdfa928ce23eaead0895b9/invoke.js";
    script.type = "text/javascript";
    
    adRef.current.innerHTML = '';
    adRef.current.appendChild(conf);
    adRef.current.appendChild(script);
    isLoaded.current = true;

  }, []);

  return (
    <div
      ref={adRef}
      className={`adsterra-banner mx-auto ${className}`}
      style={{ width: '468px', height: '60px', display: 'flex', justifyContent: 'center' }}
    />
  );
}

// 3. SOCIAL BAR (تم تحديث الرابط)
export function AdsterraSocialBar() {
  const isLoaded = useRef(false);

  useEffect(() => {
    if (isLoaded.current) return;

    const script = document.createElement('script');
    // الرابط الجديد الذي زودتني به
    script.src = "https://pl28499842.effectivegatecpm.com/1d/c4/83/1dc483022bdea82c38794c6963d8072e.js";
    script.async = true;
    
    document.body.appendChild(script);
    isLoaded.current = true;

    // لا نقوم بالحذف في Return لضمان بقاء البار ظاهراً
  }, []);

  return null;
}

// 4. POPUNDER (تم تحديث الرابط + استراتيجية الحقن)
export function AdsterraPopunder() {
  const isLoaded = useRef(false);

  useEffect(() => {
    if (isLoaded.current) return;

    const script = document.createElement('script');
    // الرابط الجديد الذي زودتني به
    script.src = "https://pl28499793.effectivegatecpm.com/ae/f4/7e/aef47e23d6650fb664cb0d5d6e2f9334.js";
    script.async = true;
    
    document.body.appendChild(script);
    isLoaded.current = true;
  }, []);

  return null;
}

// 5. SMARTLINK (النسخة الصحيحة: Event Driven)
export function AdsterraSmartlink() {
  // الرابط الجديد (Direct Link)
  const SMARTLINK_URL = "https://www.effectivegatecpm.com/grnjvbti?key=42d7579d63313f5e68cf88238cffaf36"; 
  
  useEffect(() => {
    // دالة المعالجة: تفتح الرابط مرة واحدة فقط لكل جلسة
    const handleSmartlinkClick = () => {
      const hasOpened = sessionStorage.getItem('smartlink_active');
      
      if (!hasOpened) {
        window.open(SMARTLINK_URL, '_blank');
        sessionStorage.setItem('smartlink_active', 'true'); // تسجيل أنه تم الفتح
      }
    };

    // نربط الحدث بكامل الصفحة (Document)
    // { once: true } تعني أن المستمع سيعمل مرة واحدة ثم يحذف نفسه تلقائياً لتحسين الأداء
    document.addEventListener('click', handleSmartlinkClick, { once: true });

    return () => {
      document.removeEventListener('click', handleSmartlinkClick);
    };
  }, []);

  return null;
}

// ============================================
// MAIN EXPORT
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
      return <AdsterraSocialBar />;
    case 'smartlink':
      return <AdsterraSmartlink />;
    default:
      return null;
  }
}

export default AdsterraAd;
      
