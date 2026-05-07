document.addEventListener("DOMContentLoaded", () => {

    // --- State Management ---
    let state = {
        education: [],
        tests: [],
        preferences: {
            countries: []
        }
    };

    // --- Utility: Generate Years for Dropdowns ---
    const yearSelect = document.getElementById('edu-year');
    const currentYear = new Date().getFullYear();
    for (let i = currentYear + 4; i >= currentYear - 30; i--) {
        let option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        yearSelect.appendChild(option);
    }

    // --- Modal Logic ---
    window.openModal = (modalId) => {
        const modal = document.getElementById(modalId);
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    };

    window.closeModal = (modalId) => {
        const modal = document.getElementById(modalId);
        modal.classList.remove('active');
        document.body.style.overflow = '';
        
        // Reset forms when closing
        if (modalId === 'education-modal') {
            document.getElementById('education-form').reset();
            document.getElementById('edu-id').value = '';
        } else if (modalId === 'test-modal') {
            document.getElementById('test-form').reset();
            document.getElementById('test-id').value = '';
        }
    };

    // --- Dynamic ID Generator ---
    const generateId = () => '_' + Math.random().toString(36).substr(2, 9);

    // ================= EDUCATION LOGIC =================
    
    const eduForm = document.getElementById('education-form');
    const eduList = document.getElementById('education-list');

    eduForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const idInput = document.getElementById('edu-id').value;
        const newEdu = {
            id: idInput ? idInput : generateId(),
            level: document.getElementById('edu-level').value,
            year: document.getElementById('edu-year').value,
            country: document.getElementById('edu-country').value,
            board: document.getElementById('edu-board').value,
            school: document.getElementById('edu-school').value,
            state: document.getElementById('edu-state').value,
            city: document.getElementById('edu-city').value,
            scale: document.getElementById('edu-scale').value,
            score: document.getElementById('edu-score').value,
            major: document.getElementById('edu-major').value,
            medium: document.getElementById('edu-medium').value
        };

        if (idInput) {
            // Update existing
            const index = state.education.findIndex(item => item.id === idInput);
            state.education[index] = newEdu;
        } else {
            // Add new
            state.education.push(newEdu);
        }

        renderEducationCards();
        closeModal('education-modal');
    });

    const renderEducationCards = () => {
        eduList.innerHTML = '';
        state.education.forEach(edu => {
            const card = document.createElement('div');
            card.className = 'summary-card';
            card.innerHTML = `
                <div class="card-content">
                    <div class="card-item">
                        <span class="card-label">Level</span>
                        <span class="card-val">${edu.level}</span>
                    </div>
                    <div class="card-item">
                        <span class="card-label">Institution</span>
                        <span class="card-val">${edu.school}</span>
                    </div>
                    <div class="card-item">
                        <span class="card-label">Board / Uni</span>
                        <span class="card-val">${edu.board}</span>
                    </div>
                    <div class="card-item">
                        <span class="card-label">Passing Year</span>
                        <span class="card-val">${edu.year}</span>
                    </div>
                    <div class="card-item">
                        <span class="card-label">Score / GPA</span>
                        <span class="card-val">${edu.score}</span>
                    </div>
                </div>
                <div class="card-actions">
                    <button class="action-btn edit" onclick="editEducation('${edu.id}')">Edit</button>
                    <button class="action-btn delete" onclick="deleteEducation('${edu.id}')">Delete</button>
                </div>
            `;
            eduList.appendChild(card);
        });
    };

    window.editEducation = (id) => {
        const edu = state.education.find(item => item.id === id);
        if (!edu) return;

        document.getElementById('edu-id').value = edu.id;
        document.getElementById('edu-level').value = edu.level;
        document.getElementById('edu-year').value = edu.year;
        document.getElementById('edu-country').value = edu.country;
        document.getElementById('edu-board').value = edu.board;
        document.getElementById('edu-school').value = edu.school;
        document.getElementById('edu-state').value = edu.state;
        document.getElementById('edu-city').value = edu.city;
        document.getElementById('edu-scale').value = edu.scale;
        document.getElementById('edu-score').value = edu.score;
        document.getElementById('edu-major').value = edu.major;
        document.getElementById('edu-medium').value = edu.medium;

        openModal('education-modal');
    };

    window.deleteEducation = (id) => {
        state.education = state.education.filter(item => item.id !== id);
        renderEducationCards();
    };

    // ================= TEST SCORES LOGIC =================
    
    const testForm = document.getElementById('test-form');
    const testList = document.getElementById('test-list');

    testForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const idInput = document.getElementById('test-id').value;
        const newTest = {
            id: idInput ? idInput : generateId(),
            type: document.getElementById('test-type').value,
            score: document.getElementById('test-score').value,
            date: document.getElementById('test-date').value
        };

        if (idInput) {
            const index = state.tests.findIndex(item => item.id === idInput);
            state.tests[index] = newTest;
        } else {
            state.tests.push(newTest);
        }

        renderTestCards();
        closeModal('test-modal');
    });

    const renderTestCards = () => {
        testList.innerHTML = '';
        state.tests.forEach(test => {
            const card = document.createElement('div');
            card.className = 'summary-card';
            card.innerHTML = `
                <div class="card-content">
                    <div class="card-item">
                        <span class="card-label">Test Type</span>
                        <span class="card-val">${test.type}</span>
                    </div>
                    <div class="card-item">
                        <span class="card-label">Score</span>
                        <span class="card-val">${test.score}</span>
                    </div>
                    <div class="card-item">
                        <span class="card-label">Attempt Date</span>
                        <span class="card-val">${test.date}</span>
                    </div>
                </div>
                <div class="card-actions">
                    <button class="action-btn edit" onclick="editTest('${test.id}')">Edit</button>
                    <button class="action-btn delete" onclick="deleteTest('${test.id}')">Delete</button>
                </div>
            `;
            testList.appendChild(card);
        });
    };

    window.editTest = (id) => {
        const test = state.tests.find(item => item.id === id);
        if (!test) return;

        document.getElementById('test-id').value = test.id;
        document.getElementById('test-type').value = test.type;
        document.getElementById('test-score').value = test.score;
        document.getElementById('test-date').value = test.date;

        openModal('test-modal');
    };

    window.deleteTest = (id) => {
        state.tests = state.tests.filter(item => item.id !== id);
        renderTestCards();
    };

    // ================= PREFERENCES (CHIPS) LOGIC =================
    
    const chips = document.querySelectorAll('.chip');
    
    chips.forEach(chip => {
        chip.addEventListener('click', function() {
            this.classList.toggle('active');
            const val = this.getAttribute('data-value');
            
            if(this.classList.contains('active')) {
                state.preferences.countries.push(val);
            } else {
                state.preferences.countries = state.preferences.countries.filter(c => c !== val);
            }
        });
    });

});