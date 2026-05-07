/* =============================================================
   scr-02.js — Screen logic for SCR-02: Email / Phone Verification
   Orchestrates: OTP input, countdown timer, resend flow,
                 state transitions, verification API call.

   Dependencies : components.js (window.ZGen) must load first.
   Transitions  : Success → SCR-03 (Onboarding Wizard)
                  Change contact → SCR-01 (Registration)

   State machine:
     WAITING  → user entering code, timer running
     EXPIRED  → timer hit 0, resend available
     INVALID  → code submitted but rejected by server
     VERIFYING→ API call in-flight
     SUCCESS  → code accepted, transitioning
   ============================================================= */

   'use strict';

   (function VerificationScreen() {
   
     /* ── 1. CONSTANTS ────────────────────────────────────────── */
   
     const OTP_LENGTH        = 6;
     const TIMER_SECONDS     = 60;    /* Build Spec SCR-02: 60s countdown */
     const RESEND_COOLDOWN   = 30000; /* 30s cooldown after resend before re-resend */
   
     /* Screen states */
     const STATE = Object.freeze({
       WAITING:    'WAITING',
       EXPIRED:    'EXPIRED',
       INVALID:    'INVALID',
       VERIFYING:  'VERIFYING',
       SUCCESS:    'SUCCESS',
       RESENDING:  'RESENDING',
     });
   
   
     /* ── 2. DOM REFERENCES ───────────────────────────────────── */
   
     const otpInputs       = Array.from(document.querySelectorAll('.otp-cell'));
     const otpStatus       = document.getElementById('otp-status');
     const verifyBtn       = document.getElementById('verify-btn');
     const countdownEl     = document.getElementById('countdown');
     const countdownSrEl   = document.getElementById('countdown-sr');
     const timerEl         = document.getElementById('resend-timer');
     const resendActionEl  = document.getElementById('resend-action');
     const resendBtn       = document.getElementById('resend-btn');
     const destinationEl   = document.getElementById('verification-destination');
     const changeContactEl = document.getElementById('change-contact-link');
   
     /* Bail cleanly if this screen's elements aren't present */
     if (!otpInputs.length || !verifyBtn) return;
   
     /* Destructure ZGen component modules */
     const { PrimaryPillButton } = window.ZGen;
   
   
     /* ── 3. SCREEN STATE ─────────────────────────────────────── */
   
     let currentState  = STATE.WAITING;
     let timerInterval = null;
     let remainingSeconds = TIMER_SECONDS;
   
     /* Verification destination — read from sessionStorage in production.
        Stub provides a masked address for development rendering. */
     const destination = _getDestination();
   
   
     /* ── 4. INITIALISE ───────────────────────────────────────── */
   
     function init() {
       _renderDestination();
       _startTimer();
       _bindOTPInputs();
       _bindVerifyButton();
       _bindResendButton();
       _bindChangeContact();
   
       /* Focus first cell on load for immediate keyboard entry */
       if (otpInputs[0]) otpInputs[0].focus();
     }
   
   
     /* ── 5. DESTINATION RENDERING ────────────────────────────── */
     /*
        In production: read from sessionStorage or a hydration
        attribute set by the server during registration redirect.
        Example: sessionStorage.getItem('zgen_verify_destination')
     */
   
     
        function _getDestination() {
          return sessionStorage.getItem('zgen_verify_destination') || 'your email';
        }
   
     function _renderDestination() {
       if (destinationEl) {
         destinationEl.textContent = destination;
       }
     }
     _showDevOTP();

     function _showDevOTP() {
      const el = document.getElementById('dev-otp-hint');
      const otp = sessionStorage.getItem('zgen_otp');
    
      if (!el || !otp) return;
    
      el.textContent = `Dev OTP: ${otp}`;
    }
   
   
     /* ── 6. COUNTDOWN TIMER ──────────────────────────────────── */
     /*
        Counts down from TIMER_SECONDS to 0.
        At 0: transitions to EXPIRED state.
        SR-only element updated every 15s to avoid excessive announcements.
     */
   
     function _startTimer() {
       remainingSeconds = TIMER_SECONDS;
       _renderCountdown(remainingSeconds);
       _setState(STATE.WAITING);
   
       timerInterval = setInterval(() => {
         remainingSeconds -= 1;
   
         _renderCountdown(remainingSeconds);
   
         /* SR announcement every 15 seconds */
         if (remainingSeconds % 15 === 0 && remainingSeconds > 0) {
           _updateSRCountdown(remainingSeconds);
         }
   
         if (remainingSeconds <= 0) {
           _stopTimer();
           _setState(STATE.EXPIRED);
         }
       }, 1000);
     }
   
     function _stopTimer() {
       if (timerInterval) {
         clearInterval(timerInterval);
         timerInterval = null;
       }
     }
   
     function _renderCountdown(seconds) {
       const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
       const secs = String(Math.max(seconds, 0) % 60).padStart(2, '0');
       const display = `${mins}:${secs}`;
   
       if (countdownEl) countdownEl.textContent = display;
     }
   
     function _updateSRCountdown(seconds) {
       if (countdownSrEl) {
         countdownSrEl.textContent = `${seconds} seconds remaining`;
       }
     }
   
   
     /* ── 7. STATE MACHINE ────────────────────────────────────── */
     /*
        All visual transitions flow through _setState().
        Nothing updates the UI outside of this function except
        OTP cell-level focus/fill states (handled in _bindOTPInputs).
     */
   
     function _setState(state) {
       currentState = state;
   
       switch (state) {
   
         case STATE.WAITING:
           _showTimerBlock(true);
           _setOTPStatus('', null);
           countdownEl?.classList.remove('resend-block__countdown--expired');
           _lockOTPCells(false);
           break;
   
         case STATE.EXPIRED:
           _showTimerBlock(false);
           _setOTPStatus('Your code has expired. Request a new one below.', 'expired');
           countdownEl?.classList.add('resend-block__countdown--expired');
           _renderCountdown(0);
           break;
   
         case STATE.INVALID:
           _applyErrorToAllCells();
           _setOTPStatus('That code doesn\'t look right. Check it and try again.', 'error');
           PrimaryPillButton.clearLoading(verifyBtn);
           PrimaryPillButton.enable(verifyBtn);
           /* Re-focus first cell for correction */
           if (otpInputs[0]) otpInputs[0].focus();
           break;
   
         case STATE.VERIFYING:
           _lockOTPCells(true);
           PrimaryPillButton.setLoading(verifyBtn);
           _setOTPStatus('Verifying your code…', 'waiting');
           break;
   
         case STATE.RESENDING:
           resendBtn.disabled = true;
           resendBtn.textContent = 'Sending…';
           _setOTPStatus('Sending a new code…', 'waiting');
           break;
   
         case STATE.SUCCESS:
           _applySuccessToAllCells();
           _setOTPStatus('Verified! Taking you to the next step…', 'success');
           PrimaryPillButton.clearLoading(verifyBtn);
           _lockOTPCells(true);
           break;
   
         default:
           break;
       }
     }
   
   
     /* ── 8. OTP INPUT BINDING ─────────────────────────────────── */
     /*
        Handles:
          - Digit entry + auto-advance to next cell
          - Backspace: clears cell and retreats to previous cell
          - Arrow keys: manual cell-to-cell navigation
          - Paste: splits across all 6 cells from paste position
          - Auto-submit: triggers verification when 6th digit filled
          - Fill class: .otp-cell--filled applied per cell
     */
   
     function _bindOTPInputs() {
       otpInputs.forEach((cell, index) => {
   
         /* ── Input: digit entry ─────────────────────────── */
         cell.addEventListener('input', (e) => {
           const raw   = e.target.value;
           const digit = raw.replace(/\D/g, '').slice(-1);  /* last numeric char only */
   
           /* Reject non-numeric */
           cell.value = digit;
   
           if (digit) {
             cell.classList.add('otp-cell--filled');
             cell.classList.remove('otp-cell--error');
   
             /* Clear expired state when user starts typing a new code */
             if (currentState === STATE.EXPIRED || currentState === STATE.INVALID) {
               _clearAllCellStates();
               _setOTPStatus('', null);
               if (currentState === STATE.INVALID) {
                 currentState = STATE.WAITING;
               }
             }
   
             /* Advance to next cell */
             const next = otpInputs[index + 1];
             if (next) {
               next.focus();
             } else {
               /* 6th cell filled — auto-submit */
               cell.blur();
               _onOTPComplete();
             }
           } else {
             cell.classList.remove('otp-cell--filled');
           }
   
           _evaluateVerifyButton();
         });
   
         /* ── Keydown: backspace + arrow navigation ──────── */
         cell.addEventListener('keydown', (e) => {
   
           if (e.key === 'Backspace') {
             if (cell.value) {
               /* Clear current cell */
               cell.value = '';
               cell.classList.remove('otp-cell--filled', 'otp-cell--error');
             } else {
               /* Cell already empty — retreat to previous */
               const prev = otpInputs[index - 1];
               if (prev) {
                 prev.focus();
                 prev.value = '';
                 prev.classList.remove('otp-cell--filled', 'otp-cell--error');
               }
             }
             _evaluateVerifyButton();
             return;
           }
   
           if (e.key === 'ArrowLeft' && index > 0) {
             e.preventDefault();
             otpInputs[index - 1].focus();
             return;
           }
   
           if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
             e.preventDefault();
             otpInputs[index + 1].focus();
             return;
           }
   
           /* Prevent double-entry when key is not a digit */
           if (!/^[0-9]$/.test(e.key) && !['Tab', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
             if (e.key !== 'Backspace' && e.key !== 'Delete') {
               e.preventDefault();
             }
           }
         });
   
         /* ── Paste: split across cells ──────────────────── */
         cell.addEventListener('paste', (e) => {
           e.preventDefault();
           const pasted = (e.clipboardData || window.clipboardData)
             .getData('text')
             .replace(/\D/g, '')           /* strip non-digits */
             .slice(0, OTP_LENGTH);        /* cap at OTP_LENGTH */
   
           if (!pasted) return;
   
           /* Distribute digits starting from the focused cell */
           pasted.split('').forEach((digit, i) => {
             const target = otpInputs[index + i];
             if (target) {
               target.value = digit;
               target.classList.add('otp-cell--filled');
               target.classList.remove('otp-cell--error');
             }
           });
   
           /* Focus cell after last pasted digit, or last cell */
           const focusTarget = otpInputs[Math.min(index + pasted.length, OTP_LENGTH - 1)];
           if (focusTarget) focusTarget.focus();
   
           _evaluateVerifyButton();
   
           /* Auto-submit if full code pasted */
           if (_getOTPValue().length === OTP_LENGTH) {
             _onOTPComplete();
           }
         });
   
         /* ── Focus: select existing value for easy overwrite ─ */
         cell.addEventListener('focus', () => {
           cell.select();
         });
   
       });
     }
   
   
     /* ── 9. VERIFY BUTTON ────────────────────────────────────── */
   
     function _bindVerifyButton() {
       verifyBtn.addEventListener('click', () => {
         if (currentState === STATE.VERIFYING) return;
         const code = _getOTPValue();
         if (code.length === OTP_LENGTH) {
           _submitVerification(code);
         }
       });
     }
   
     /* Called automatically when 6th digit entered, or on button click */
     function _onOTPComplete() {
       const code = _getOTPValue();
       if (code.length === OTP_LENGTH && currentState !== STATE.VERIFYING) {
         _submitVerification(code);
       }
     }
   
     /* Gate: enable verify button only when all 6 cells are filled */
     function _evaluateVerifyButton() {
       const complete = _getOTPValue().length === OTP_LENGTH;
       if (complete && currentState !== STATE.VERIFYING && currentState !== STATE.SUCCESS) {
         PrimaryPillButton.enable(verifyBtn);
       } else {
         PrimaryPillButton.disable(verifyBtn);
       }
     }
   
   
     /* ── 10. RESEND BUTTON ───────────────────────────────────── */
   
     function _bindResendButton() {
       if (!resendBtn) return;
   
       resendBtn.addEventListener('click', () => {
         if (currentState !== STATE.EXPIRED && currentState !== STATE.INVALID) return;
         _resendCode();
       });
     }
   
     async function _resendCode() {
       _setState(STATE.RESENDING);
       _clearAllCells();
   
       try {
         await _requestResend();
   
         /* Reset: new code sent, restart timer */
         resendBtn.textContent = 'Resend code';
         resendBtn.disabled = false;
         _startTimer();               /* restarts timer, sets STATE.WAITING internally */
         _setOTPStatus('A new code has been sent.', 'waiting');
   
         /* Focus first cell for new entry */
         if (otpInputs[0]) otpInputs[0].focus();
   
       } catch (err) {
         resendBtn.textContent = 'Resend code';
         resendBtn.disabled = false;
         _setState(STATE.EXPIRED);
         _setOTPStatus('Could not send a new code. Please try again.', 'error');
         console.error('[SCR-02] Resend error:', err);
       }
     }
   
   
     /* ── 11. CHANGE CONTACT LINK ─────────────────────────────── */
     /*
        Navigates back to SCR-01 (Registration).
        In production: preserve partial session data so email
        field is pre-filled on return.
     */
   
     function _bindChangeContact() {
       if (!changeContactEl) return;
   
       changeContactEl.addEventListener('click', (e) => {
         e.preventDefault();
   
         /* Production:
            sessionStorage.setItem('zgen_prefill_email', emailFromSession);
            window.location.href = '/register';
         */
   
         console.info('[SCR-02] Navigating back to SCR-01 to change contact.');
         /* Development stub: would be router.push('/register') */
         window.location.href = changeContactEl.href;
       });
     }
   
   
     /* ── 12. TIMER BLOCK VISIBILITY ──────────────────────────── */
     /*
        Exactly one of timerEl / resendActionEl is visible at a time.
        showTimer=true → WAITING state UI
        showTimer=false → EXPIRED state UI
     */
   
     function _showTimerBlock(showTimer) {
       if (timerEl) {
         timerEl.hidden = !showTimer;
       }
       if (resendActionEl) {
         resendActionEl.hidden = showTimer;
       }
     }
   
   
     /* ── 13. OTP STATUS MESSAGE ──────────────────────────────── */
     /*
        Updates the status paragraph and its data-state attribute.
        data-state drives CSS color variants (error/expired/success/waiting).
     */
   
     function _setOTPStatus(message, state) {
       if (!otpStatus) return;
       otpStatus.textContent = message;
       if (state) {
         otpStatus.setAttribute('data-state', state);
       } else {
         otpStatus.removeAttribute('data-state');
       }
     }
   
   
     /* ── 14. CELL STATE HELPERS ──────────────────────────────── */
   
     function _applyErrorToAllCells() {
       otpInputs.forEach(cell => {
         cell.classList.add('otp-cell--error');
         cell.classList.remove('otp-cell--filled', 'otp-cell--success');
       });
     }
   
     function _applySuccessToAllCells() {
       otpInputs.forEach(cell => {
         cell.classList.add('otp-cell--success');
         cell.classList.remove('otp-cell--error', 'otp-cell--filled');
       });
     }
   
     function _clearAllCellStates() {
       otpInputs.forEach(cell => {
         cell.classList.remove('otp-cell--error', 'otp-cell--success');
       });
     }
   
     function _clearAllCells() {
       otpInputs.forEach(cell => {
         cell.value = '';
         cell.classList.remove('otp-cell--filled', 'otp-cell--error', 'otp-cell--success');
       });
       _evaluateVerifyButton();
     }
   
     function _lockOTPCells(locked) {
       otpInputs.forEach(cell => {
         cell.disabled = locked;
       });
     }
   
     function _getOTPValue() {
       return otpInputs.map(cell => cell.value.trim()).join('');
     }
   
   
     /* ── 15. API CALLS ───────────────────────────────────────── */
     /*
        _submitVerification: sends code to backend for validation.
        _requestResend: triggers a new OTP send.
   
        Production: replace stubs with real fetch() calls.
        Error shape: { code: string, message: string }
          Codes: INVALID_CODE | EXPIRED_CODE | TOO_MANY_ATTEMPTS
     */
   
     async function _submitVerification(code) {
       _setState(STATE.VERIFYING);
   
       try {
         await _callVerifyAPI(code);
   
         _setState(STATE.SUCCESS);
         _stopTimer();
   
         /* Build Spec: Success → SCR-03 (Onboarding Wizard) */
         setTimeout(() => {
           _transitionToOnboarding();
         }, 1200);   /* brief pause so user sees the success state */
   
       } catch (err) {
         const errorCode = err?.code || 'INVALID_CODE';
         _handleVerificationError(errorCode, err?.message);
       }
     }
   
     async function _callVerifyAPI(code) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
    
          const correctCode = sessionStorage.getItem('zgen_otp');
    
          if (code === correctCode) {
            resolve({ status: 'VERIFIED', next: '/onboarding' });
          } else {
            reject({ code: 'INVALID_CODE', message: 'That code doesn’t match.' });
          }
    
        }, 800);
      });
    }
   
    async function _requestResend() {
      return new Promise((resolve) => {
        setTimeout(() => {
    
          /* Generate NEW OTP */
          const newOTP = Math.floor(100000 + Math.random() * 900000).toString();
          sessionStorage.setItem('zgen_otp', newOTP);
    
          console.log('NEW DEV OTP:', newOTP); // 👈 see updated OTP
    
          resolve({ status: 'SENT' });
    
        }, 800);
      });
    }
   
   
     /* ── 16. ERROR HANDLING ──────────────────────────────────── */
   
     function _handleVerificationError(code, message) {
       switch (code) {
         case 'EXPIRED_CODE':
           _stopTimer();
           _setState(STATE.EXPIRED);
           _setOTPStatus('This code has expired. Please request a new one.', 'expired');
           _clearAllCells();
           break;
   
         case 'TOO_MANY_ATTEMPTS':
           _lockOTPCells(true);
           PrimaryPillButton.disable(verifyBtn);
           _setOTPStatus('Too many attempts. Please wait before trying again.', 'error');
           _applyErrorToAllCells();
           break;
   
         case 'INVALID_CODE':
         default:
           _setState(STATE.INVALID);
           /* Don't clear cells on invalid — let user see and correct entry */
           break;
       }
   
       console.warn(`[SCR-02] Verification error: ${code}`, message);
     }
   
   
     /* ── 17. SUCCESS TRANSITION ──────────────────────────────── */
     /*
        Build Spec Flow 1: SCR-02 Success → SCR-03 (Onboarding Wizard)
        In production: use router navigation.
     */
   
        function _transitionToOnboarding() {
          console.info('[SCR-02] Account verified. Transitioning to SCR-03.');
        
          window.location.href = 'scr-03-onboarding.html'; // 👈 match your file name
        }
   
   
     /* ── BOOT ────────────────────────────────────────────────── */
   
     init();
   
   })();