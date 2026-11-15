import { useEffect, useState } from 'react';
import type { MacArch } from '../../downloads';

export function useDetectedMacArch() {
  const [arch, setArch] = useState<MacArch | null>(null);

  useEffect(() => {
    let active = true;
    const isMac = /Macintosh|Mac OS X/.test(navigator.userAgent) && navigator.maxTouchPoints < 2;

    if (isMac && 'userAgentData' in navigator) {
      const data = navigator.userAgentData;

      if (data && typeof data === 'object' && 'getHighEntropyValues' in data && typeof data.getHighEntropyValues === 'function') {
        Promise.resolve(data.getHighEntropyValues(['architecture']))
          .then((values: unknown) => {
            if (active && values && typeof values === 'object' && 'architecture' in values) {
              if (values.architecture === 'arm') {
                setArch('arm64');
              } else if (values.architecture === 'x86') {
                setArch('x64');
              }
            }
          })
          .catch(() => {});
      }
    }

    return () => {
      active = false;
    };
  }, []);

  return arch;
}
