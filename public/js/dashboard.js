// Report Management Functions
async function loadReports() {
    try {
        const response = await fetch('/projects');
        const projects = await response.json();
        
        const reportGrid = document.getElementById('reportGrid');
        reportGrid.innerHTML = '';
        
        for (const project of projects) {
            const reportsResponse = await fetch(`/projects/${project._id}/reports`);
            const reports = await reportsResponse.json();
            
            reports.forEach(report => {
                const reportCard = createReportCard(report, project);
                reportGrid.appendChild(reportCard);
            });
        }
    } catch (error) {
        showAlert('Failed to load reports', 'error');
    }
}

function createReportCard(report, project) {
    const card = document.createElement('div');
    card.className = 'report-card';
    card.innerHTML = `
        <div class="report-card-header">
            <h3>${report.title}</h3>
            <span class="report-status">${report.issues.length} issues</span>
        </div>
        <div class="report-card-body">
            <p>${report.description.substring(0, 100)}${report.description.length > 100 ? '...' : ''}</p>
            <div class="report-tags">
                ${report.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
        </div>
        <div class="report-card-footer">
            <span class="project-name">${project.title}</span>
            <button class="btn btn-secondary" onclick="viewReport('${report._id}', '${project._id}')">View Details</button>
        </div>
    `;
    return card;
}

function showCreateReportForm() {
    const modal = document.getElementById('createReportModal');
    const form = document.getElementById('reportForm');
    const projectSelect = document.getElementById('reportProject');
    
    // Populate project select
    fetch('/projects')
        .then(response => response.json())
        .then(projects => {
            projectSelect.innerHTML = projects.map(project => 
                `<option value="${project._id}">${project.title}</option>`
            ).join('');
        });
    
    modal.style.display = 'block';
    
    // Handle form submission
    form.onsubmit = async (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        const projectId = formData.get('project');
        
        try {
            // First upload the file
            const fileResponse = await fetch('/upload', {
                method: 'POST',
                body: formData
            });
            
            if (!fileResponse.ok) throw new Error('Failed to upload file');
            
            const { fileURL } = await fileResponse.json();
            
            // Then create the report
            const reportData = {
                title: formData.get('title'),
                description: formData.get('description'),
                tags: formData.get('tags').split(',').map(tag => tag.trim()),
                fileURL
            };
            
            const reportResponse = await fetch(`/projects/${projectId}/reports`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reportData)
            });
            
            if (!reportResponse.ok) throw new Error('Failed to create report');
            
            showAlert('Report created successfully', 'success');
            modal.style.display = 'none';
            form.reset();
            loadReports();
        } catch (error) {
            showAlert(error.message, 'error');
        }
    };
}

async function viewReport(reportId, projectId) {
    const modal = document.getElementById('viewReportModal');
    const details = document.getElementById('reportDetails');
    
    try {
        const response = await fetch(`/projects/${projectId}/reports/${reportId}`);
        const report = await response.json();
        
        document.getElementById('reportViewTitle').textContent = report.title;
        document.getElementById('reportViewDescription').textContent = report.description;
        document.getElementById('reportViewTags').textContent = report.tags.join(', ');
        document.getElementById('reportViewFile').href = report.fileURL;
        
        // Load project name
        const projectResponse = await fetch(`/projects/${projectId}`);
        const project = await projectResponse.json();
        document.getElementById('reportViewProject').textContent = project.title;
        
        // Load issues
        const issuesList = document.getElementById('reportIssuesList');
        issuesList.innerHTML = report.issues.map(issue => `
            <div class="issue-card">
                <div class="issue-header">
                    <h4>${issue.title}</h4>
                    <span class="issue-status ${issue.status.toLowerCase()}">${issue.status}</span>
                </div>
                <p>${issue.description}</p>
                <div class="issue-actions">
                    <select onchange="updateIssueStatus('${reportId}', '${projectId}', '${issue._id}', this.value)">
                        <option value="Pending" ${issue.status === 'Pending' ? 'selected' : ''}>Pending</option>
                        <option value="InProgress" ${issue.status === 'InProgress' ? 'selected' : ''}>In Progress</option>
                        <option value="Complete" ${issue.status === 'Complete' ? 'selected' : ''}>Complete</option>
                    </select>
                </div>
            </div>
        `).join('');
        
        modal.style.display = 'block';
    } catch (error) {
        showAlert('Failed to load report details', 'error');
    }
}

function showCreateIssueForm(reportId) {
    const modal = document.getElementById('createIssueModal');
    const form = document.getElementById('issueForm');
    
    document.getElementById('issueReportId').value = reportId;
    modal.style.display = 'block';
    
    form.onsubmit = async (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        const issueData = {
            title: formData.get('title'),
            description: formData.get('description')
        };
        
        try {
            const response = await fetch(`/projects/${projectId}/reports/${reportId}/issues`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(issueData)
            });
            
            if (!response.ok) throw new Error('Failed to create issue');
            
            showAlert('Issue created successfully', 'success');
            modal.style.display = 'none';
            form.reset();
            viewReport(reportId, projectId); // Refresh the report view
        } catch (error) {
            showAlert(error.message, 'error');
        }
    };
}

async function updateIssueStatus(reportId, projectId, issueId, newStatus) {
    try {
        const response = await fetch(`/projects/${projectId}/reports/${reportId}/issues/${issueId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
        
        if (!response.ok) throw new Error('Failed to update issue status');
        
        showAlert('Issue status updated', 'success');
    } catch (error) {
        showAlert(error.message, 'error');
    }
}

function filterReports() {
    const filter = document.getElementById('reportFilter').value;
    const search = document.getElementById('reportSearch').value.toLowerCase();
    const cards = document.querySelectorAll('.report-card');
    
    cards.forEach(card => {
        const title = card.querySelector('h3').textContent.toLowerCase();
        const description = card.querySelector('.report-card-body p').textContent.toLowerCase();
        const tags = Array.from(card.querySelectorAll('.tag')).map(tag => tag.textContent.toLowerCase());
        const issues = parseInt(card.querySelector('.report-status').textContent);
        
        let show = true;
        
        // Apply search filter
        if (search && !title.includes(search) && !description.includes(search) && 
            !tags.some(tag => tag.includes(search))) {
            show = false;
        }
        
        // Apply category filter
        if (filter === 'recent') {
            // Show only reports from the last 7 days
            const reportDate = new Date(card.dataset.date);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            if (reportDate < weekAgo) show = false;
        } else if (filter === 'with-issues') {
            if (issues === 0) show = false;
        }
        
        card.style.display = show ? 'block' : 'none';
    });
}

function searchReports() {
    filterReports(); // Reuse the filter function for search
}

// Add this to your existing DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', () => {
    // ... existing code ...
    
    // Load reports if user is an engineer
    if (userRole === 'Engineer') {
        loadReports();
    }
}); 