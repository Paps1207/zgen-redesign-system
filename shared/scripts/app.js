// ===== GLOBAL USER STATE =====

export function getUser() {
    try {
      return JSON.parse(localStorage.getItem("zgen_user")) || {};
    } catch {
      return {};
    }
  }
  
  export function saveUser(data) {
    localStorage.setItem("zgen_user", JSON.stringify(data));
  }
  
  export function updateUser(updates) {
    const existing = getUser();
    const updated = { ...existing, ...updates };
    saveUser(updated);
  }
  
  // ===== FLOW GUARDS =====
  
  export function requireAuth() {
    const user = getUser();
  
    if (!user.email) {
      window.location.href = "/screens/scr-01/index.html";
    }
  }
  
  export function requireVerification() {
    const user = getUser();
  
    if (!user.verified) {
      window.location.href = "/screens/scr-02/index.html";
    }
  }
  
  export function requireOnboarding() {
    const user = getUser();
  
    if (!user.onboarding || !user.onboarding.step4) {
      window.location.href = "/screens/scr-03/index.html";
    }
  }