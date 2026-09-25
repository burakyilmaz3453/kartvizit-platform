(function () {
  const meta = document.querySelector('meta[name="turnstile-site-key"]');
  const siteKey = meta?.content?.trim();
  let currentToken = '';
  let widgetId;

  function setStatus(message, isError = false) {
    const status = document.getElementById('captcha-status');
    if (!status) return;
    status.textContent = message;
    status.dataset.state = isError ? 'error' : 'ready';
  }

  function reset() {
    currentToken = '';
    if (widgetId !== undefined && window.turnstile) window.turnstile.reset(widgetId);
    setStatus('Güvenlik doğrulamasını tamamla.');
  }

  function render() {
    const host = document.getElementById('turnstile-widget');
    if (!host || !siteKey || widgetId !== undefined) return;
    host.hidden = false;
    if (!window.turnstile) {
      setStatus('Güvenlik doğrulaması yükleniyor…');
      return;
    }
    widgetId = window.turnstile.render(host, {
      sitekey: siteKey,
      theme: 'dark',
      language: 'tr',
      size: 'flexible',
      appearance: 'always',
      callback: (value) => {
        currentToken = value;
        setStatus('Güvenlik doğrulaması tamamlandı.');
      },
      'error-callback': () => {
        currentToken = '';
        setStatus('Güvenlik doğrulaması yüklenemedi. Sayfayı yenileyip tekrar dene.', true);
        return true;
      },
      'expired-callback': reset,
      'timeout-callback': reset
    });
  }

  function token() {
    return currentToken || undefined;
  }

  function requireToken() {
    return token();
  }

  window.NoshutdownCaptcha = { render, token, requireToken, reset, enabled: Boolean(siteKey) };
  window.noshutdownTurnstileReady = render;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render);
  else render();
})();
