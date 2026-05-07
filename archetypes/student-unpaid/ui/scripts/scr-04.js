/**
 * SCR-04: Welcome / Transition Logic
 * Handles the simulated recommendation engine delay and populates the summary strip
 * using data captured in SCR-03 (Onboarding Wizard).
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- DOM Elements ---
    const DOM = {
        loadingState: document.getElementById('loading-state'),
        readyState: document.getElementById('ready-state'),
        loadingMsg: document.getElementById('loading-msg'),
        progressBar: document.querySelector('.loading-progress'),
        
        // Summary nodes
        sumDest: document.getElementById('sum-dest'),
        sumDegree: document.getElementById('sum-degree'),
        sumIntake: document.getElementById('sum-intake'),
        sumBudget: document.getElementById('sum-budget'),

        // Buttons
        btnDashboard: document.getElementById('btn-dashboard'),
        btnEdit: document.getElementById('btn-edit')
    };

    // --- Data Population ---
    function populateSummary() {
        const rawData = localStorage.getItem('onboardingData');
        if (rawData) {
            try {
                const data = JSON.parse(rawData);
                
                // Format Map
                const degreeMap = { 'bachelors': "Bachelor's", 'masters': "Master's", 'phd': "Ph.D." };
                const intakeMap = { 'fall-2024': "Fall 2024", 'spring-2025': "Spring 2025", 'fall-2025': "Fall 2025" };
                const budgetMap = { '10k-20k': "$10k - $20k", '20k-40k': "$20k - $40k", '40k-plus': "$40k+", 'no-limit': "No Limit" };

                // Apply dynamic values, fallback to generic if missing
                if (data.targetCountries && data.targetCountries.length > 0) {
                    // Capitalize country names
                    DOM.sumDest.textContent = data.targetCountries.map(c => c.toUpperCase()).join(', ');
                }
                if (data.degree) DOM.sumDegree.textContent = degreeMap[data.degree] || data.degree;
                if (data.intake) DOM.sumIntake.textContent = intakeMap[data.intake] || data.intake;
                if (data.budget) DOM.sumBudget.textContent = budgetMap[data.budget] || data.budget;

            } catch (e) {
                console.error("Error parsing onboarding data for welcome screen.", e);
            }
        }
    }

    // --- Loading Sequence Animation ---
    function runTransitionSequence() {
        // Timeline stages for the simulated processing
        const sequence = [
            { time: 100, progress: '20%', text: 'Analyzing your academic profile...' },
            { time: 1200, progress: '60%', text: 'Filtering destination preferences...' },
            { time: 2400, progress: '90%', text: 'Curating university matches...' },
            { time: 3200, progress: '100%', text: 'Finalizing your dashboard...' }
        ];

        // Execute timeline
        sequence.forEach(step => {
            setTimeout(() => {
                DOM.progressBar.style.width = step.progress;
                DOM.loadingMsg.textContent = step.text;
            }, step.time);
        });

        // End sequence and show content
        setTimeout(() => {
            // Hide loading
            DOM.loadingState.classList.remove('active');
            
            // Allow CSS transition to finish before switching display property
            setTimeout(() => {
                DOM.loadingState.classList.add('hidden');
                DOM.readyState.classList.remove('hidden');
                
                // Trigger reflow to ensure the active class fades in properly
                void DOM.readyState.offsetWidth; 
                DOM.readyState.classList.add('active');
            }, 400);

        }, 3800);
    }

    // --- Event Listeners ---
    function bindEvents() {
        DOM.btnDashboard.addEventListener('click', () => {
            // Proceed to dashboard
            window.location.href = 'scr-05-dashboard.html';
        });

        DOM.btnEdit.addEventListener('click', () => {
            // Send user back to edit profile
            window.location.href = 'scr-03-onboarding.html';
        });
    }

    // --- Initialization ---
    function init() {
        populateSummary();
        bindEvents();
        // Start the sequence on load
        runTransitionSequence();
    }

    init();
});