/* =============================================================
   scr-01.js — Screen logic for SCR-01: Landing / Registration
   Orchestrates component modules from components.js.
   Handles: form validation, CTA gating, OAuth, password toggle.

   Dependencies: components.js (must load first)
   Transition: Successful submission → SCR-02 (OTP Verification)
   ============================================================= */

'use strict';

/* ─────────────────────────────────────────────────────────────
   MODULE: RegistrationScreen
   Self-contained IIFE. Accesses ZGen namespace from components.js.
───────────────────────────────────────────────────────────── */

(function RegistrationScreen() {

  /* ── 1. CACHE DOM REFERENCES ──────────────────────────────── */

  const form          = document.getElementById('registration-form');
  const submitBtn     = document.getElementById('submit-btn');
  const toggleBtn     = document.getElementById('toggle-password');

  const emailInput    = document.getElementById('input-email');
  const phoneInput    = document.getElementById('input-phone');
  const passwordInput = document.getElementById('input-password');
  const termsInput    = document.getElementById('input-terms');

  const fieldEmail    = document.getElementById('field-email');
  const fieldPhone    = document.getElementById('field-phone');
  const fieldPassword = document.getElementById('field-password');
  const fieldTerms    = document.getElementById('field-terms');

  /* Bail gracefully if the form isn't on this page */
  if (!form || !submitBtn) return;

  /* ── 2. DESTRUCTURE ZGen COMPONENT MODULES ────────────────── */

  const {
    FormField,
    PrimaryPillButton,
    PasswordToggle,
    Validators,
    OAuthHandler,
  } = window.ZGen;


  /* ── 3. INITIALISE COMPONENT BEHAVIOURS ───────────────────── */

  /* 3a. Password toggle (C-02 + password show/hide) */
  PasswordToggle.init(toggleBtn, passwordInput);

  /* 3b. OAuth block — providers call through to handler */
  OAuthHandler.init((provider) => {
    handleOAuthClick(provider);
  });


  /* ── 4. FIELD-LEVEL VALIDATION (on blur) ──────────────────── */
  /*
     ZGen Form Rule: Real-time validation for critical fields.
     Validate on 'blur' — not on every keystroke (avoid premature errors).
     Re-validate on 'input' only if the field has already been touched.
  */

  const touched = {
    email:    false,
    phone:    false,
    password: false,
    terms:    false,
  };

  /* Email */
  emailInput.addEventListener('blur', () => {
    touched.email = true;
    validateEmail();
    evaluateCTA();
  });

  emailInput.addEventListener('input', () => {
    if (touched.email) {
      validateEmail();
      evaluateCTA();
    }
  });

  /* Phone (optional) */
  phoneInput.addEventListener('blur', () => {
    touched.phone = true;
    validatePhone();
    /* phone doesn't gate the CTA — evaluateCTA not needed here */
  });

  phoneInput.addEventListener('input', () => {
    if (touched.phone) validatePhone();
  });

  /* Password */
  passwordInput.addEventListener('blur', () => {
    touched.password = true;
    validatePassword();
    evaluateCTA();
  });

  passwordInput.addEventListener('input', () => {
    if (touched.password) {
      validatePassword();
      evaluateCTA();
    }
  });

  /* Terms checkbox */
  termsInput.addEventListener('change', () => {
    touched.terms = true;
    validateTerms();
    evaluateCTA();
  });


  /* ── 5. INDIVIDUAL VALIDATOR CALLS ───────────────────────── */

  function validateEmail() {
    const result = Validators.email(emailInput.value);
    if (!result.valid) {
      FormField.setError(fieldEmail, result.message);
    } else {
      FormField.setSuccess(fieldEmail);
    }
    return result.valid;
  }

  function validatePhone() {
    const result = Validators.phone(phoneInput.value);
    if (!result.valid) {
      FormField.setError(fieldPhone, result.message);
    } else {
      /* Phone is optional — success state only if user typed something valid */
      if (phoneInput.value.trim()) {
        FormField.setSuccess(fieldPhone);
      } else {
        FormField.reset(fieldPhone);
      }
    }
    return result.valid;
  }

  function validatePassword() {
    const result = Validators.password(passwordInput.value);
    if (!result.valid) {
      FormField.setError(fieldPassword, result.message);
    } else {
      FormField.setSuccess(fieldPassword);
    }
    return result.valid;
  }

  function validateTerms() {
    const result = Validators.requiredCheckbox(termsInput.checked);
    if (!result.valid) {
      FormField.setError(fieldTerms, result.message);
    } else {
      FormField.setSuccess(fieldTerms);
    }
    return result.valid;
  }


  /* ── 6. CTA GATING ────────────────────────────────────────── */
  /*
     Build Spec §4: CTA disabled until email + password valid
     AND terms checked. Phone is optional — does not gate CTA.
     ZGen C-03: Disabled state is enforced programmatically.
  */

  function evaluateCTA() {
    const emailValid    = Validators.email(emailInput.value).valid;
    const passwordValid = Validators.password(passwordInput.value).valid;
    const termsChecked  = termsInput.checked;

    const allSatisfied  = emailValid && passwordValid && termsChecked;

    if (allSatisfied) {
      PrimaryPillButton.enable(submitBtn);
    } else {
      PrimaryPillButton.disable(submitBtn);
    }
  }


  /* ── 7. FORM SUBMISSION ───────────────────────────────────── */
  /*
     Runs full validation pass on submit.
     On success: sets loading state → calls submitRegistration().
     Transition: success → SCR-02 (OTP verification).
     All field errors surface before loading starts.
  */

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    /* Mark all fields as touched so errors appear on submit attempt */
    touched.email    = true;
    touched.phone    = true;
    touched.password = true;
    touched.terms    = true;

    /* Full validation pass */
    const emailOk    = validateEmail();
    const phoneOk    = validatePhone();     /* optional, still validates format */
    const passwordOk = validatePassword();
    const termsOk    = validateTerms();

    if (!emailOk || !passwordOk || !termsOk) {
      /* Focus first invalid field for accessibility */
      focusFirstError();
      return;
    }

    /* All valid — enter loading state */
    PrimaryPillButton.setLoading(submitBtn);

    try {
      await submitRegistration({
        email:        emailInput.value.trim(),
        phone_prefix: document.getElementById('input-phone-prefix')?.value || '',
        phone:        phoneInput.value.trim(),
        password:     passwordInput.value,
      });

      /* Success: transition to SCR-02 */
      transitionToVerification();

    } catch (error) {
      PrimaryPillButton.clearLoading(submitBtn);
      handleSubmissionError(error);
    }
  });


  /* ── 8. SUBMISSION LOGIC ─────────────────────────────────── */
  /*
     Stub for actual API call.
     Replace with fetch('/api/auth/register', {...}) in production.
     Rejects with { code, message } shaped errors.
  */

  async function submitRegistration(payload) {
    /*
       Production implementation:

       const response = await fetch('/api/auth/register', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(payload),
       });

       if (!response.ok) {
         const err = await response.json();
         throw err;
       }
       return response.json();
    */

    /* Development stub — simulates a 1s API round-trip */
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        /*
          Uncomment to test error path:
          reject({ code: 'EMAIL_TAKEN', message: 'An account with this email already exists.' });
        */
        resolve({ status: 'UNVERIFIED', next: '/verify' });
      }, 1200);
    });
  }


  /* ── 9. OAUTH HANDLING ────────────────────────────────────── */
  /*
     In production: trigger OAuth popup or redirect.
     Provider string: 'google' | 'apple'
  */

  function handleOAuthClick(provider) {
    console.info(`[SCR-01] OAuth initiated: ${provider}`);

    /*
       Production:
       window.location.href = `/auth/${provider}?redirect=/verify`;
    */

    /* Stub: visual feedback while OAuth flow would launch */
    const btn = document.querySelector(`.oauth-btn[data-provider="${provider}"]`);
    if (!btn) return;

    const originalText = btn.querySelector('span:last-child').textContent;
    btn.disabled = true;
    btn.querySelector('span:last-child').textContent = 'Redirecting...';

    setTimeout(() => {
      btn.disabled = false;
      btn.querySelector('span:last-child').textContent = originalText;
    }, 2000);
  }


  /* ── 10. SUCCESS TRANSITION ───────────────────────────────── */
  /*
     Build Spec Flow 1: Registration → SCR-02 (OTP Verification).
     In production: replace with router.push('/verify') or window.location.
  */

  function transitionToVerification() {
    console.info('[SCR-01] Registration complete. Transitioning to SCR-02.');
    /*
       Production:
       window.location.href = '/verify';
    */

    /* Stub: show a visual confirmation before real nav */
    submitBtn.querySelector('.pill-btn__label').textContent = 'Account Created ✓';
    submitBtn.classList.remove('pill-btn--loading');
    submitBtn.style.background = 'var(--color-success, #1a7a4a)';
  }


  /* ── 11. ERROR HANDLING ───────────────────────────────────── */
  /*
     Maps API error codes to field-level or form-level messages.
     ZGen Form Rule: Errors appear inline, not in a toast.
  */

  function handleSubmissionError(error) {
    console.error('[SCR-01] Submission error:', error);

    const code    = error?.code    || 'UNKNOWN';
    const message = error?.message || 'Something went wrong. Please try again.';

    switch (code) {
      case 'EMAIL_TAKEN':
        FormField.setError(fieldEmail, 'An account with this email already exists.');
        emailInput.focus();
        break;

      case 'INVALID_EMAIL':
        FormField.setError(fieldEmail, 'Please enter a valid email address.');
        emailInput.focus();
        break;

      case 'WEAK_PASSWORD':
        FormField.setError(fieldPassword, 'Please choose a stronger password.');
        passwordInput.focus();
        break;

      default:
        /* Attach generic error to submit button area */
        showFormLevelError(message);
        PrimaryPillButton.enable(submitBtn);
        break;
    }
  }


  /* ── 12. HELPERS ─────────────────────────────────────────── */

  /**
   * Focus the first field with an active error state.
   * Assists keyboard and screen reader users.
   */
  function focusFirstError() {
    const firstErrorField = form.querySelector('.form-field--error .form-field__input, .form-field--error .form-field__checkbox');
    if (firstErrorField) {
      firstErrorField.focus();
    }
  }

  /**
   * Injects a form-level error message below the submit button.
   * Used for server errors not tied to a specific field.
   * @param {string} message
   */
  function showFormLevelError(message) {
    let formErrorEl = document.getElementById('form-level-error');

    if (!formErrorEl) {
      formErrorEl = document.createElement('p');
      formErrorEl.id = 'form-level-error';
      formErrorEl.className = 'form-field__error';
      formErrorEl.setAttribute('role', 'alert');
      formErrorEl.setAttribute('aria-live', 'assertive');
      submitBtn.insertAdjacentElement('afterend', formErrorEl);
    }

    formErrorEl.textContent = message;
  }

})();
