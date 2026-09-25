(function () {
  const $ = (id) => document.getElementById(id);

  function show(kind, message) {
    const error = $('error-msg');
    const success = $('success-msg');
    if (!error || !success) return;
    error.style.display = 'none';
    success.style.display = 'none';
    const target = kind === 'success' ? success : error;
    target.textContent = message;
    target.style.display = 'block';
  }

  function busy(button, active, workingLabel, idleLabel) {
    button.disabled = active;
    button.textContent = active ? workingLabel : idleLabel;
  }

  function requireCaptchaToken() {
    const captcha = window.NoshutdownCaptcha;
    const captchaToken = captcha?.requireToken();
    if (captcha?.enabled && !captchaToken) {
      show('error', 'Güvenlik doğrulamasını tamamla ve tekrar dene.');
      return null;
    }
    return captchaToken;
  }

  async function registerUser(event) {
    event.preventDefault();
    const username = $('username').value.trim().toLowerCase();
    const email = $('email').value.trim();
    const password = $('password').value;
    const button = $('register-btn');

    if (!/^[a-z0-9_]{3,30}$/.test(username)) {
      show('error', 'Kullanıcı adı 3–30 karakter olmalı; yalnızca küçük harf, rakam ve _ içerebilir.');
      return;
    }
    if (password.length < 8) {
      show('error', 'Şifre en az 8 karakter olmalı.');
      return;
    }
    if (!$('terms-check').checked) {
      show('error', 'Devam etmek için kullanım şartlarını kabul etmelisin.');
      return;
    }

    const captchaToken = requireCaptchaToken();
    if (window.NoshutdownCaptcha?.enabled && !captchaToken) return;
    busy(button, true, 'Kayıt yapılıyor…', 'Kayıt Ol');
    try {
      const { error } = await window.sb.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login.html`,
          data: { username },
          ...(captchaToken ? { captchaToken } : {})
        }
      });
      if (error) throw error;
      show('success', 'Kayıt isteğin alındı. E-postandaki doğrulama bağlantısını açarak devam et.');
    } catch {
      show('error', 'Kayıt işlemi tamamlanamadı. Bilgilerini kontrol edip yeniden dene.');
    } finally {
      window.NoshutdownCaptcha?.reset();
      busy(button, false, '', 'Kayıt Ol');
    }
  }

  async function loginUser(event) {
    event.preventDefault();
    const button = $('login-btn');
    const captchaToken = requireCaptchaToken();
    if (window.NoshutdownCaptcha?.enabled && !captchaToken) return;
    busy(button, true, 'Giriş yapılıyor…', 'Giriş Yap');
    try {
      const { data, error } = await window.sb.auth.signInWithPassword({
        email: $('email').value.trim(),
        password: $('password').value,
        options: { captchaToken }
      });
      if (error || !data.user?.email_confirmed_at) {
        if (data.user && !data.user.email_confirmed_at) await window.sb.auth.signOut();
        show('error', 'Giriş yapılamadı. Bilgilerini ve e-posta doğrulamanı kontrol et.');
        return;
      }
      window.location.assign('dashboard.html');
    } catch {
      show('error', 'Giriş yapılamadı. Bilgilerini ve e-posta doğrulamanı kontrol et.');
    } finally {
      window.NoshutdownCaptcha?.reset();
      busy(button, false, '', 'Giriş Yap');
    }
  }

  async function requestPasswordReset() {
    const email = $('email').value.trim();
    if (!email) {
      show('error', 'Önce e-posta adresini gir.');
      return;
    }
    const captchaToken = requireCaptchaToken();
    if (window.NoshutdownCaptcha?.enabled && !captchaToken) return;
    try {
      await window.sb.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset.html`,
        captchaToken
      });
      show('success', 'Eğer bu adresle eşleşen bir hesap varsa şifre yenileme bağlantısı gönderildi.');
    } finally {
      window.NoshutdownCaptcha?.reset();
    }
  }

  async function updatePassword(event) {
    event.preventDefault();
    const password = $('new-password').value;
    const confirmation = $('confirm-password').value;
    if (password.length < 8) {
      show('error', 'Şifre en az 8 karakter olmalı.');
      return;
    }
    if (password !== confirmation) {
      show('error', 'Şifreler eşleşmiyor.');
      return;
    }
    const button = $('reset-btn');
    busy(button, true, 'Kaydediliyor…', 'Şifreyi Kaydet');
    const { error } = await window.sb.auth.updateUser({ password });
    if (error) {
      show('error', 'Şifre güncellenemedi. Bağlantının süresi dolmuş olabilir.');
      busy(button, false, '', 'Şifreyi Kaydet');
      return;
    }
    show('success', 'Şifren güncellendi. Giriş sayfasına yönlendiriliyorsun…');
    window.setTimeout(() => window.location.assign('login.html'), 1800);
  }

  async function handleLoginCallback() {
    const params = new URLSearchParams(window.location.hash.slice(1));
    if (params.get('type') !== 'signup' || !params.get('access_token')) {
      const { data } = await window.sb.auth.getSession();
      if (data.session?.user?.email_confirmed_at) window.location.assign('dashboard.html');
      return;
    }
    const { data, error } = await window.sb.auth.setSession({
      access_token: params.get('access_token'),
      refresh_token: params.get('refresh_token') || ''
    });
    history.replaceState(null, '', window.location.pathname);
    if (error || !data.session) {
      show('error', 'Doğrulama bağlantısı geçersiz veya süresi dolmuş.');
      return;
    }
    show('success', 'E-posta adresin doğrulandı. Yönlendiriliyorsun…');
    window.setTimeout(() => window.location.assign('dashboard.html'), 1200);
  }

  const page = document.body.dataset.authPage;
  if (page === 'register') $('register-form').addEventListener('submit', registerUser);
  if (page === 'login') {
    $('login-form').addEventListener('submit', loginUser);
    $('forgot-password').addEventListener('click', requestPasswordReset);
    handleLoginCallback();
  }
  if (page === 'reset') $('reset-form').addEventListener('submit', updatePassword);
})();
