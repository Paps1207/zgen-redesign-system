/* =============================================================
   flow-state.js — ZGen Global Flow State Manager
   Handles cross-screen data persistence (sessionStorage-based)
   ============================================================= */

   'use strict';

   window.ZGen = window.ZGen || {};
   
   window.ZGen.FlowState = (function () {
     const KEY = 'zgen_flow_state';
   
     function getState() {
       try {
         return JSON.parse(sessionStorage.getItem(KEY)) || {};
       } catch {
         return {};
       }
     }
   
     function setState(newState) {
       const current = getState();
       const updated = { ...current, ...newState };
       sessionStorage.setItem(KEY, JSON.stringify(updated));
     }
   
     function clearState() {
       sessionStorage.removeItem(KEY);
     }
   
     return {
       get: getState,
       set: setState,
       clear: clearState,
     };
   })();