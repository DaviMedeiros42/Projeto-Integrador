(function () {
  const key = 'sabor-clic-theme';
  const root = document.body;
  const checkbox = document.getElementById('theme-switch');
  const buttons = document.querySelectorAll('[data-theme-toggle]');
  const saved = localStorage.getItem(key);
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initial = saved || (root.classList.contains('home-page') && prefersDark ? 'dark' : 'light');
  function apply(theme) {
    root.dataset.theme = theme;
    if (checkbox) checkbox.checked = theme === 'dark';
    buttons.forEach((button) => {
      button.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
      button.innerHTML = theme === 'dark' ? '<span aria-hidden="true">☀</span><span>Modo claro</span>' : '<span aria-hidden="true">☾</span><span>Modo escuro</span>';
    });
    localStorage.setItem(key, theme);
  }
  apply(initial);
  if (checkbox) checkbox.addEventListener('change', () => apply(checkbox.checked ? 'dark' : 'light'));
  buttons.forEach((button) => button.addEventListener('click', () => apply(root.dataset.theme === 'dark' ? 'light' : 'dark')));
})();
