/* =============================================================
   components.js — ZGen Reusable Component Behaviours
   All component-level interaction logic lives here.
   Screen-specific orchestration is in scr-XX.js files.
   No inline scripts. No DOM manipulation outside these modules.
   ============================================================= */

'use strict';

/* ─────────────────────────────────────────────────────────────
   MODULE: FormField
   Manages state transitions for a single .form-field element.
   States: default → focused → filled → error → success
───────────────────────────────────────────────────────────── */

const FormField = (() => {

  /**
   * Sets a field into error state.
   * Shows error message, hides helper text, applies error class.
   * @param {HTMLElement} fieldEl  - The .form-field wrapper
   * @param {string}      message  - Human-readable error copy
   */
  function setError(fieldEl, message) {
    const errorEl  = fieldEl.querySelector('.form-field__error');
    const helperEl = fieldEl.querySelector('.form-field__helper');
    const inputEl  = fieldEl.querySelector('.form-field__input, .form-field__select');

    fieldEl.classList.add('form-field--error');
    fieldEl.classList.remove('form-field--success');

    if (errorEl) {
      errorEl.textContent = message;
      errorEl.removeAttribute('hidden');
    }
    if (helperEl) {
      helperEl.setAttribute('hidden', '');
    }
    if (inputEl) {
      inputEl.setAttribute('aria-invalid', 'true');
    }
  }

  /**
   * Sets a field into success (valid) state.
   * Clears error styles; restores helper text.
   * @param {HTMLElement} fieldEl - The .form-field wrapper
   */
  function setSuccess(fieldEl) {
    const errorEl  = fieldEl.querySelector('.form-field__error');
    const helperEl = fieldEl.querySelector('.form-field__helper');
    const inputEl  = fieldEl.querySelector('.form-field__input, .form-field__select');

    fieldEl.classList.remove('form-field--error');
    fieldEl.classList.add('form-field--success');

    if (errorEl) {
      errorEl.textContent = '';
      errorEl.setAttribute('hidden', '');
    }
    if (helperEl) {
      helperEl.removeAttribute('hidden');
    }
    if (inputEl) {
      inputEl.removeAttribute('aria-invalid');
    }
  }

  /**
   * Resets a field to default state (no error, no success).
   * @param {HTMLElement} fieldEl - The .form-field wrapper
   */
  function reset(fieldEl) {
    const errorEl  = fieldEl.querySelector('.form-field__error');
    const helperEl = fieldEl.querySelector('.form-field__helper');
    const inputEl  = fieldEl.querySelector('.form-field__input, .form-field__select');

    fieldEl.classList.remove('form-field--error', 'form-field--success');

    if (errorEl) {
      errorEl.textContent = '';
      errorEl.setAttribute('hidden', '');
    }
    if (helperEl) {
      helperEl.removeAttribute('hidden');
    }
    if (inputEl) {
      inputEl.removeAttribute('aria-invalid');
    }
  }

  return { setError, setSuccess, reset };

})();


/* ─────────────────────────────────────────────────────────────
   MODULE: PrimaryPillButton
   Manages disabled / loading / active states on .pill-btn elements.
───────────────────────────────────────────────────────────── */

const PrimaryPillButton = (() => {

  /**
   * Enables the button — removes disabled attribute and aria-disabled.
   * @param {HTMLButtonElement} btnEl
   */
  function enable(btnEl) {
    btnEl.disabled = false;
    btnEl.removeAttribute('aria-disabled');
  }

  /**
   * Disables the button.
   * @param {HTMLButtonElement} btnEl
   */
  function disable(btnEl) {
    btnEl.disabled = true;
    btnEl.setAttribute('aria-disabled', 'true');
  }

  /**
   * Sets button into loading state.
   * Locks width, hides label, shows spinner.
   * @param {HTMLButtonElement} btnEl
   */
  function setLoading(btnEl) {
    const labelEl   = btnEl.querySelector('.pill-btn__label');
    const iconEl    = btnEl.querySelector('.pill-btn__icon');
    const spinnerEl = btnEl.querySelector('.pill-btn__spinner');

    btnEl.classList.add('pill-btn--loading');
    btnEl.setAttribute('aria-busy', 'true');
    btnEl.disabled = true;

    if (spinnerEl) spinnerEl.removeAttribute('hidden');
    if (labelEl)   labelEl.setAttribute('aria-hidden', 'true');
    if (iconEl)    iconEl.setAttribute('aria-hidden', 'true');
  }

  /**
   * Restores button from loading state.
   * @param {HTMLButtonElement} btnEl
   */
  function clearLoading(btnEl) {
    const labelEl   = btnEl.querySelector('.pill-btn__label');
    const iconEl    = btnEl.querySelector('.pill-btn__icon');
    const spinnerEl = btnEl.querySelector('.pill-btn__spinner');

    btnEl.classList.remove('pill-btn--loading');
    btnEl.removeAttribute('aria-busy');

    if (spinnerEl) spinnerEl.setAttribute('hidden', '');
    if (labelEl)   labelEl.removeAttribute('aria-hidden');
    if (iconEl)    iconEl.removeAttribute('aria-hidden');
  }

  return { enable, disable, setLoading, clearLoading };

})();


/* ─────────────────────────────────────────────────────────────
   MODULE: PasswordToggle
   Manages show/hide toggling on password inputs.
   Pairs with .form-field__toggle button and .form-field__input[type="password"]
───────────────────────────────────────────────────────────── */

const PasswordToggle = (() => {

  /**
   * Initialises a password toggle button.
   * @param {HTMLButtonElement} toggleBtn
   * @param {HTMLInputElement}  passwordInput
   */
  function init(toggleBtn, passwordInput) {
    if (!toggleBtn || !passwordInput) return;

    const iconShow = toggleBtn.querySelector('.form-field__toggle-icon--show');
    const iconHide = toggleBtn.querySelector('.form-field__toggle-icon--hide');

    toggleBtn.addEventListener('click', () => {
      const isPassword = passwordInput.type === 'password';

      passwordInput.type = isPassword ? 'text' : 'password';
      toggleBtn.setAttribute('aria-pressed', String(isPassword));
      toggleBtn.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');

      if (iconShow) iconShow.toggleAttribute('hidden', isPassword);
      if (iconHide) iconHide.toggleAttribute('hidden', !isPassword);
    });
  }

  return { init };

})();


/* ─────────────────────────────────────────────────────────────
   MODULE: Validators
   Pure functions. Return { valid: bool, message: string }.
   No DOM access. Reusable across all screens.
───────────────────────────────────────────────────────────── */

const Validators = (() => {

  /**
   * Validates an email address format.
   * @param  {string} value
   * @returns {{ valid: boolean, message: string }}
   */
  function email(value) {
    const trimmed = (value || '').trim();
    if (!trimmed) {
      return { valid: false, message: 'Email address is required.' };
    }
    // RFC 5322-inspired pattern (practical subset)
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!pattern.test(trimmed)) {
      return { valid: false, message: 'Please enter a valid email address.' };
    }
    return { valid: true, message: '' };
  }

  /**
   * Validates a phone number (optional field).
   * Allows digits, spaces, dashes, parentheses. Min 7 digits when present.
   * @param  {string} value
   * @returns {{ valid: boolean, message: string }}
   */
  function phone(value) {
    const trimmed = (value || '').trim();
    if (!trimmed) return { valid: true, message: '' };  // Optional field
    const digitsOnly = trimmed.replace(/\D/g, '');
    if (digitsOnly.length < 7) {
      return { valid: false, message: 'Please enter a valid phone number.' };
    }
    if (digitsOnly.length > 15) {
      return { valid: false, message: 'Phone number is too long.' };
    }
    return { valid: true, message: '' };
  }

  /**
   * Validates a password.
   * Rules: min 8 chars.
   * @param  {string} value
   * @returns {{ valid: boolean, message: string }}
   */
  function password(value) {
    const trimmed = (value || '');
    if (!trimmed) {
      return { valid: false, message: 'Password is required.' };
    }
    if (trimmed.length < 8) {
      return { valid: false, message: 'Password must be at least 8 characters.' };
    }
    return { valid: true, message: '' };
  }

  /**
   * Validates a required checkbox.
   * @param  {boolean} checked
   * @returns {{ valid: boolean, message: string }}
   */
  function requiredCheckbox(checked) {
    if (!checked) {
      return { valid: false, message: 'You must agree to the Terms of Service and Privacy Policy.' };
    }
    return { valid: true, message: '' };
  }

  return { email, phone, password, requiredCheckbox };

})();


/* ─────────────────────────────────────────────────────────────
   MODULE: OAuthHandler
   Handles OAuth button click simulation.
   In production: replace body with actual OAuth redirect/popup logic.
───────────────────────────────────────────────────────────── */

const OAuthHandler = (() => {

  /**
   * Registers click handlers on all .oauth-btn elements.
   * @param {Function} onProviderSelect - Callback with provider string
   */
  function init(onProviderSelect) {
    const buttons = document.querySelectorAll('.oauth-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const provider = btn.dataset.provider;
        if (typeof onProviderSelect === 'function') {
          onProviderSelect(provider);
        }
      });
    });
  }

  return { init };

})();


/* Export all modules for use in screen-specific scripts */
window.ZGen = window.ZGen || {};
Object.assign(window.ZGen, {
  FormField,
  PrimaryPillButton,
  PasswordToggle,
  Validators,
  OAuthHandler,
});
