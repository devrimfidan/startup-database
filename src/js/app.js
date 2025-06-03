class CambridgeStartups {
    constructor() {
        this.apiKey = '';
        this.baseUrl = 'https://api.company-information.service.gov.uk';
        this.init();
    }

    init() {
        document.getElementById('searchBtn').addEventListener('click', () => this.searchCompanies());
        document.getElementById('searchQuery').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchCompanies();
        });
        document.getElementById('apiKey').addEventListener('input', (e) => {
            this.apiKey = e.target.value;
        });
    }

    async searchCompanies() {
        const query = document.getElementById('searchQuery').value.trim();
        const apiKey = document.getElementById('apiKey').value.trim();

        if (!apiKey) {
            this.showError('Please enter your Companies House API key first.');
            return;
        }

        if (!query) {
            this.showError('Please enter a search term.');
            return;
        }

        this.apiKey = apiKey;
        this.showLoading();

        try {
            const companies = await this.fetchCompanies(query);
            await this.displayCompanies(companies);
        } catch (error) {
            this.showError(`Search failed: ${error.message}`);
        }
    }

    async fetchCompanies(query) {
        const searchUrl = `${this.baseUrl}/search/companies?q=${encodeURIComponent(query)}&items_per_page=20`;
        
        const response = await fetch(searchUrl, {
            headers: {
                'Authorization': `Basic ${btoa(this.apiKey + ':')}`
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Invalid API key. Please check your Companies House API key.');
            }
            throw new Error(`API request failed: ${response.status}`);
        }

        const data = await response.json();
        return data.items || [];
    }

    async fetchCompanyDetails(companyNumber) {
        const detailUrl = `${this.baseUrl}/company/${companyNumber}`;
        
        try {
            const response = await fetch(detailUrl, {
                headers: {
                    'Authorization': `Basic ${btoa(this.apiKey + ':')}`
                }
            });

            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.log('Could not fetch detailed info for', companyNumber);
        }
        return null;
    }

    async displayCompanies(companies) {
        const resultsDiv = document.getElementById('results');

        if (companies.length === 0) {
            resultsDiv.innerHTML = '<div class="info">No companies found. Try a different search term.</div>';
            return;
        }

        // Show stats
        const stats = this.generateStats(companies);
        let html = `
            <div class="stats">
                <div class="stat-card">
                    <div class="stat-number">${companies.length}</div>
                    <div class="stat-label">Companies Found</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${stats.activeCount}</div>
                    <div class="stat-label">Active Companies</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${stats.recentCount}</div>
                    <div class="stat-label">Incorporated in Last 5 Years</div>
                </div>
            </div>
            <div class="company-grid">
        `;

        // Display companies
        for (const company of companies) {
            html += this.createCompanyCard(company);
        }

        html += '</div>';
        resultsDiv.innerHTML = html;
    }

    createCompanyCard(company) {
        const statusClass = company.company_status === 'active' ? 'status-active' : 'status-dissolved';
        const incorporationDate = company.date_of_creation ? new Date(company.date_of_creation).toLocaleDateString() : 'N/A';
        
        return `
            <div class="company-card">
                <div class="company-name">${this.escapeHtml(company.title)}</div>
                <div class="company-number">Company #${company.company_number}</div>
                
                <div class="company-details">
                    <div class="company-detail">
                        <span class="detail-label">Status:</span>
                        <span class="detail-value ${statusClass}">${this.capitalizeFirst(company.company_status || 'Unknown')}</span>
                    </div>
                    <div class="company-detail">
                        <span class="detail-label">Type:</span>
                        <span class="detail-value">${this.capitalizeFirst(company.company_type || 'N/A')}</span>
                    </div>
                    <div class="company-detail">
                        <span class="detail-label">Incorporated:</span>
                        <span class="detail-value">${incorporationDate}</span>
                    </div>
                    ${company.address ? `
                    <div class="company-detail">
                        <span class="detail-label">Address:</span>
                        <span class="detail-value">${this.formatAddress(company.address)}</span>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    formatAddress(address) {
        const parts = [];
        if (address.address_line_1) parts.push(address.address_line_1);
        if (address.locality) parts.push(address.locality);
        if (address.postal_code) parts.push(address.postal_code);
        return this.escapeHtml(parts.join(', '));
    }

    generateStats(companies) {
        const currentYear = new Date().getFullYear();
        let activeCount = 0;
        let recentCount = 0;

        companies.forEach(company => {
            if (company.company_status === 'active') {
                activeCount++;
            }
            
            if (company.date_of_creation) {
                const incorporationYear = new Date(company.date_of_creation).getFullYear();
                if (currentYear - incorporationYear <= 5) {
                    recentCount++;
                }
            }
        });

        return { activeCount, recentCount };
    }

    showLoading() {
        document.getElementById('results').innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
                Searching Companies House database...
            </div>
        `;
    }

    showError(message) {
        document.getElementById('results').innerHTML = `
            <div class="error">
                <strong>Error:</strong> ${this.escapeHtml(message)}
            </div>
        `;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1).replace(/-/g, ' ');
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new CambridgeStartups();
});