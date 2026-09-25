(function () {
  function safeUrl(value) {
    try {
      const candidate = new URL(value, window.location.origin);
      return ['http:', 'https:'].includes(candidate.protocol) ? candidate.href : null;
    } catch {
      return null;
    }
  }

  function escapeVCard(value) {
    return String(value || '')
      .replace(/\\/g, '\\\\')
      .replace(/\r?\n/g, '\\n')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,');
  }

  function replaceWithImage(container, source, alt) {
    const url = safeUrl(source);
    if (!url) return false;
    const image = document.createElement('img');
    image.src = url;
    image.alt = alt || '';
    container.replaceChildren(image);
    return true;
  }

  window.NoshutdownCard = { safeUrl, escapeVCard, replaceWithImage };
})();
