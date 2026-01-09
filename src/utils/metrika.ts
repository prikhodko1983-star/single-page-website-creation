declare global {
  interface Window {
    ym: (id: number, method: string, ...params: any[]) => void;
  }
}

export const initYandexMetrika = () => {
  if (typeof window === 'undefined') return;

  // Загружаем скрипт Метрики
  (function(m, e, t, r, i, k, a) {
    // @ts-ignore
    m[i] = m[i] || function() { (m[i].a = m[i].a || []).push(arguments); };
    // @ts-ignore
    m[i].l = 1 * new Date();
    
    for (let j = 0; j < document.scripts.length; j++) {
      if (document.scripts[j].src === r) { return; }
    }
    
    k = e.createElement(t);
    a = e.getElementsByTagName(t)[0];
    // @ts-ignore
    k.async = 1;
    // @ts-ignore
    k.src = r;
    // @ts-ignore
    a.parentNode.insertBefore(k, a);
  })(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js', 'ym');

  // Инициализируем счетчик
  window.ym(106114603, 'init', {
    clickmap: true,
    trackLinks: true,
    accurateTrackBounce: true,
    webvisor: true,
    ecommerce: 'dataLayer'
  });
};

export const ymHit = (url: string, options?: any) => {
  if (typeof window !== 'undefined' && window.ym) {
    window.ym(106114603, 'hit', url, options);
  }
};

export const ymReachGoal = (target: string, params?: any) => {
  if (typeof window !== 'undefined' && window.ym) {
    window.ym(106114603, 'reachGoal', target, params);
  }
};
