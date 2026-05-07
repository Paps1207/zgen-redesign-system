/* =============================================================
   scr-01.js — Screen logic for SCR-01: Landing / Registration
   Handles: form validation, CTA gating, OAuth, password toggle
   + Flow persistence (ZGen.FlowState)

   Dependencies:
   - components.js
   - flow-state.js  ← MUST load before this file

   Transition: Successful submission → SCR-02
   ============================================================= */

   'use strict';

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
   
     if (!form || !submitBtn) return;
   
     /* ── 2. LOAD ZGen MODULES ─────────────────────────────────── */
   
     const {
       FormField,
       PrimaryPillButton,
       PasswordToggle,
       Validators,
       OAuthHandler,
       FlowState, // ✅ NEW
     } = window.ZGen;
   
   
     /* ── 3. INITIALISE COMPONENTS ─────────────────────────────── */
   
     PasswordToggle.init(toggleBtn, passwordInput);
   
     OAuthHandler.init((provider) => {
       handleOAuthClick(provider);
     });
   
   
     /* ── 4. FIELD VALIDATION STATE ────────────────────────────── */
   
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
   
     /* Phone */
     phoneInput.addEventListener('blur', () => {
       touched.phone = true;
       validatePhone();
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
   
     /* Terms */
     termsInput.addEventListener('change', () => {
       touched.terms = true;
       validateTerms();
       evaluateCTA();
     });
   
   
     /* ── 5. VALIDATORS ───────────────────────────────────────── */
   
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
   
   
     /* ── 6. CTA GATING ───────────────────────────────────────── */
   
     function evaluateCTA() {
       const emailValid    = Validators.email(emailInput.value).valid;
       const passwordValid = Validators.password(passwordInput.value).valid;
       const termsChecked  = termsInput.checked;
   
       if (emailValid && passwordValid && termsChecked) {
         PrimaryPillButton.enable(submitBtn);
       } else {
         PrimaryPillButton.disable(submitBtn);
       }
     }
   
   
     /* ── 7. FORM SUBMISSION ───────────────────────────────────── */
   
     form.addEventListener('submit', async (event) => {
       event.preventDefault();
   
       touched.email = true;
       touched.phone = true;
       touched.password = true;
       touched.terms = true;
   
       const emailOk    = validateEmail();
       const phoneOk    = validatePhone();
       const passwordOk = validatePassword();
       const termsOk    = validateTerms();
   
       if (!emailOk || !passwordOk || !termsOk) {
         focusFirstError();
         return;
       }
   
       PrimaryPillButton.setLoading(submitBtn);
   
       try {
         const payload = {
           email:        emailInput.value.trim(),
           phone_prefix: document.getElementById('input-phone-prefix')?.value || '',
           phone:        phoneInput.value.trim(),
           password:     passwordInput.value,
         };
   
         await submitRegistration(payload);
   
         /* ✅ NEW: Persist flow data */
         FlowState.set({
           user: {
             email: payload.email,
             phone: payload.phone,
             phone_prefix: payload.phone_prefix,
             status: 'UNVERIFIED'
           }
         });
   
         transitionToVerification();
   
       } catch (error) {
         PrimaryPillButton.clearLoading(submitBtn);
         handleSubmissionError(error);
       }
     });
   
   
     /* ── 8. API STUB ─────────────────────────────────────────── */
   
     async function submitRegistration(payload) {
       return new Promise((resolve) => {
         setTimeout(() => {
           resolve({ status: 'UNVERIFIED' });
         }, 1000);
       });
     }
   
   
     /* ── 9. OAUTH ────────────────────────────────────────────── */
   
     function handleOAuthClick(provider) {
       console.info(`[SCR-01] OAuth: ${provider}`);
     }

     function generateOTP() {
      return Math.floor(100000 + Math.random() * 900000).toString();
    }
   
   
     /* ── 10. TRANSITION ───────────────────────────────────────── */
   
     function transitionToVerification() {
      console.info('[SCR-01] Registration complete. Transitioning to SCR-02.');
    
      const email = emailInput.value.trim();
      const otp   = generateOTP();
    
      /* Store data for SCR-02 */
      sessionStorage.setItem('zgen_verify_destination', email);
      sessionStorage.setItem('zgen_otp', otp);
    
      console.log('DEV OTP:', otp); // 👈 check console for OTP
    
      /* Navigate (NO leading slash) */
      window.location.href = 'scr-02.html';
    }
   
   
     /* ── 11. ERROR HANDLING ───────────────────────────────────── */
   
     function handleSubmissionError(error) {
       const code = error?.code || 'UNKNOWN';
   
       switch (code) {
         case 'EMAIL_TAKEN':
           FormField.setError(fieldEmail, 'Email already exists.');
           emailInput.focus();
           break;
   
         default:
           showFormLevelError('Something went wrong. Please try again.');
           PrimaryPillButton.enable(submitBtn);
       }
     }
   
   
     /* ── 12. HELPERS ─────────────────────────────────────────── */
   
     function focusFirstError() {
       const el = form.querySelector('.form-field--error input');
       if (el) el.focus();
     }
   
     function showFormLevelError(message) {
       let el = document.getElementById('form-level-error');
   
       if (!el) {
         el = document.createElement('p');
         el.id = 'form-level-error';
         el.className = 'form-field__error';
         submitBtn.insertAdjacentElement('afterend', el);
       }
   
       el.textContent = message;
     }
   
   })();