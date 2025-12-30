import { useEffect } from 'react';
import { useCatThemeStore } from '@/store/useCatThemeStore';

export function useThemeColor() {
  const uiHue = useCatThemeStore((state) => state.uiHue);

  useEffect(() => {
    const root = document.documentElement;
    
    // Update primary color based on hue
    root.style.setProperty('--primary', `${uiHue} 60% 55%`);
    root.style.setProperty('--primary-foreground', `${uiHue} 20% 98%`);
    
    // Update accent/cat colors to match
    root.style.setProperty('--cat', `${uiHue} 50% 70%`);
    root.style.setProperty('--cat-light', `${uiHue} 60% 85%`);
    root.style.setProperty('--cat-accent', `${(uiHue + 30) % 360} 60% 65%`);
    
    // Update ring color
    root.style.setProperty('--ring', `${uiHue} 60% 55%`);
    
  }, [uiHue]);

  return uiHue;
}
