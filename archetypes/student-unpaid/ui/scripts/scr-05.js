document.addEventListener("DOMContentLoaded", () => {
    
    // ================= MOCK DATA =================
    
    const universities = [
        { id: 1, name: 'New York University', country: 'USA', match: 92, tuition: '$58,000', deadline: 'Dec 15, 2024', category: 'Moderate', saved: false },
        { id: 2, name: 'University of Toronto', country: 'Canada', match: 88, tuition: 'CAD 45,000', deadline: 'Jan 10, 2025', category: 'Safe', saved: true },
        { id: 3, name: 'Columbia University', country: 'USA', match: 74, tuition: '$65,000', deadline: 'Jan 1, 2025', category: 'Ambitious', saved: false }
    ];

    const applications = [
        { uni: 'University of Toronto', status: 'Documents Pending', statusCode: 'pending', deadline: 'Nov 30', progress: 40 },
        { uni: 'New York University', status: 'Under Review', statusCode: 'review', deadline: 'Submitted', progress: 70 },
        { uni: 'Arizona State Univ.', status: 'Shortlisted', statusCode: 'shortlisted', deadline: 'Action Required', progress: 90 }
    ];

    const documents = [
        { name: 'Passport', status: 'Verified', isMissing: false },
        { name: 'Transcripts', status: 'Uploaded', isMissing: false },
        { name: 'Statement of Purpose', status: 'Missing', isMissing: true },
        { name: 'IELTS Scorecard', status: 'Uploaded', isMissing: false }
    ];

    const deadlines = [
        { title: 'Book TOEFL Exam', date: 'Within 7 days', action: 'Book Now' },
        { title: 'SOP Final Draft', date: 'Nov 15, 2024', action: 'Upload' },
        { title: 'UofT Application', date: 'Nov 30, 2024', action: 'Resume' }
    ];

    // ================= RENDER FUNCTIONS =================

    const renderUniversities = () => {
        const grid = document.getElementById('university-grid');
        grid.innerHTML = '';
        universities.forEach(uni => {
            const catClass = uni.category.toLowerCase();
            const btnClass = uni.saved ? 'btn-small active' : 'btn-small';
            const btnText = uni.saved ? 'Saved' : 'Save';

            const card = document.createElement('div');
            card.className = 'uni-card';
            card.innerHTML = `
                <div class="uni-header">
                    <div class="uni-logo-placeholder">${uni.name.charAt(0)}</div>
                    <div class="match-badge">${uni.match}% Match</div>
                </div>
                <div class="uni-info">
                    <h3>${uni.name}</h3>
                    <p>${uni.country}</p>
                </div>
                <div class="uni-tags">
                    <span class="tag ${catClass}">${uni.category}</span>
                </div>
                <div class="uni-stats">
                    <div class="stat-row"><span class="stat-label">Est. Tuition</span><span class="stat-val">${uni.tuition}/yr</span></div>
                    <div class="stat-row"><span class="stat-label">Deadline</span><span class="stat-val">${uni.deadline}</span></div>
                </div>
                <div class="uni-actions">
                    <button class="btn-primary" style="flex-grow:1;">View Details</button>
                    <button class="${btnClass}" onclick="toggleSave(${uni.id}, this)">${btnText}</button>
                </div>
            `;
            grid.appendChild(card);
        });
    };

    const renderApplications = () => {
        const list = document.getElementById('application-list');
        list.innerHTML = '';
        applications.forEach(app => {
            const row = document.createElement('div');
            row.className = 'tracker-row';
            row.innerHTML = `
                <div class="track-uni">${app.uni}</div>
                <div class="track-status">
                    <span class="status-chip ${app.statusCode}">${app.status}</span>
                </div>
                <div class="track-progress">
                    <div class="mini-bar"><div class="mini-bar-fill" style="width: ${app.progress}%"></div></div>
                    <span>${app.progress}%</span>
                </div>
                <div class="track-action">
                    <button class="btn-text-muted">Manage</button>
                </div>
            `;
            list.appendChild(row);
        });
    };

    const renderDocuments = () => {
        const grid = document.getElementById('document-grid');
        grid.innerHTML = '';
        documents.forEach(doc => {
            const cardClass = doc.isMissing ? 'doc-card missing' : 'doc-card';
            const icon = doc.isMissing ? '⚠️' : '✅';
            const btnText = doc.isMissing ? 'Upload File' : 'Update';

            const card = document.createElement('div');
            card.className = cardClass;
            card.innerHTML = `
                <div class="doc-header">
                    <h4>${doc.name}</h4>
                    <span class="doc-icon">${icon}</span>
                </div>
                <p class="doc-status">${doc.status}</p>
                <button class="btn-small" style="align-self: flex-start;">${btnText}</button>
            `;
            grid.appendChild(card);
        });
    };

    const renderDeadlines = () => {
        const list = document.getElementById('deadline-list');
        list.innerHTML = '';
        deadlines.forEach(dl => {
            const item = document.createElement('div');
            item.className = 'deadline-item';
            item.innerHTML = `
                <div class="dl-info">
                    <h4>${dl.title}</h4>
                    <p>${dl.date}</p>
                </div>
                <div class="dl-action">${dl.action}</div>
            `;
            list.appendChild(item);
        });
    };

    // ================= INTERACTIONS =================

    // Save Toggle Logic
    window.toggleSave = (id, btnElement) => {
        const uni = universities.find(u => u.id === id);
        if(uni) {
            uni.saved = !uni.saved;
            if(uni.saved) {
                btnElement.classList.add('active');
                btnElement.textContent = 'Saved';
            } else {
                btnElement.classList.remove('active');
                btnElement.textContent = 'Save';
            }
        }
    };

    // Sidebar Navigation Active State Logic
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
        });
    });

    // Initialize
    renderUniversities();
    renderApplications();
    renderDocuments();
    renderDeadlines();
});