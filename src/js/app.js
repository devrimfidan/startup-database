class CambridgeStartups {
    constructor() {
        this.apiKey = '';
        this.baseUrl = 'https://api.company-information.service.gov.uk';
        this.currentPage = 1;
        this.totalPages = 1;
        this.itemsPerPage = 20;
        this.currentView = 'grid';
        this.companies = [];
        this.sortField = 'relevance';
        this.sortDirection = 'desc';
        this.filters = {
            status: 'all',
            type: 'all',
            year: 'all'
        };
        this.companyTypes = new Set();
        this.init();
    }

    init() {
        // Basic search functionality
        document.getElementById('searchBtn').addEventListener('click', () => this.searchCompanies());
        document.getElementById('searchQuery').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchCompanies();
        });
        document.getElementById('apiKey').addEventListener('input', (e) => {
            this.apiKey = e.target.value;
            localStorage.setItem('ch_api_key', e.target.value);
        });

        // Load API key from localStorage if available
        const savedApiKey = localStorage.getItem('ch_api_key');
        if (savedApiKey) {
            document.getElementById('apiKey').value = savedApiKey;
            this.apiKey = savedApiKey;
        }
        
        // Add event listeners for quick search links
        const quickSearchLinks = document.querySelectorAll('.banner-nav .banner-nav-item');
        quickSearchLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const searchText = e.target.textContent.trim();
                document.getElementById('searchQuery').value = searchText;
                this.searchCompanies();
            });
        });

        // Advanced options toggle
        document.getElementById('showAdvancedBtn').addEventListener('click', () => this.toggleAdvancedPanel());
        
        // Items per page change
        document.getElementById('itemsPerPage').addEventListener('change', (e) => {
            this.itemsPerPage = parseInt(e.target.value);
            if (this.companies.length > 0) {
                this.currentPage = 1;
                this.searchCompanies();
            }
        });

        // Sort change
        document.getElementById('sortBy').addEventListener('change', (e) => {
            this.sortField = e.target.value;
            if (this.companies.length > 0) {
                this.sortCompanies();
                this.displayCompanies(this.companies);
            }
        });

        // View toggle buttons
        document.getElementById('gridViewBtn').addEventListener('click', () => this.changeView('grid'));
        document.getElementById('tableViewBtn').addEventListener('click', () => this.changeView('table'));

        // Filter controls
        document.getElementById('statusFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('typeFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('yearFilter').addEventListener('change', () => this.applyFilters());

        // Pagination
        document.getElementById('prevPage').addEventListener('click', () => this.changePage(-1));
        document.getElementById('nextPage').addEventListener('click', () => this.changePage(1));
    }

    toggleAdvancedPanel() {
        const panel = document.getElementById('advancedPanel');
        const btn = document.getElementById('showAdvancedBtn');
        
        if (panel.style.display === 'block') {
            panel.style.display = 'none';
            btn.textContent = 'Advanced options ▾';
        } else {
            panel.style.display = 'block';
            btn.textContent = 'Advanced options ▴';
        }
    }

    changeView(view) {
        this.currentView = view;
        
        // Update active button
        document.getElementById('gridViewBtn').classList.toggle('active', view === 'grid');
        document.getElementById('tableViewBtn').classList.toggle('active', view === 'table');
        
        // Redisplay companies if we have results
        if (this.companies.length > 0) {
            this.displayCompanies(this.companies);
        }
    }

    async searchCompanies(page = 1) {
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
        this.currentPage = page;
        this.showLoading();

        try {
            const response = await this.fetchCompanies(query);
            this.companies = response.items || [];
            this.totalPages = Math.ceil(Math.min(response.total_results || 0, 400) / this.itemsPerPage);  // API max is 400 results
            
            // Show controls if we have results
            document.getElementById('controlsBar').style.display = this.companies.length > 0 ? 'flex' : 'none';
            document.getElementById('pagination').style.display = this.totalPages > 1 ? 'flex' : 'none';
            
            // Extract company types for filter
            this.extractCompanyTypes();
            
            // Apply any active filters
            this.applyFilters();
            
        } catch (error) {
            this.showError(`Search failed: ${error.message}`);
        }
    }

    async fetchCompanies(query) {
        const start_index = (this.currentPage - 1) * this.itemsPerPage;
        const searchUrl = `${this.baseUrl}/search/companies?q=${encodeURIComponent(query)}&items_per_page=${this.itemsPerPage}&start_index=${start_index}`;
        
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

        return await response.json();
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

    changePage(direction) {
        const newPage = this.currentPage + direction;
        if (newPage >= 1 && newPage <= this.totalPages) {
            this.searchCompanies(newPage);
        }
    }

    extractCompanyTypes() {
        // Clear existing set
        this.companyTypes.clear();
        
        // Add all company types from results
        this.companies.forEach(company => {
            if (company.company_type) {
                this.companyTypes.add(company.company_type);
            }
        });
        
        // Update the type filter dropdown
        const typeFilter = document.getElementById('typeFilter');
        
        // Save current selection
        const currentSelection = typeFilter.value;
        
        // Clear existing options except the first one
        while (typeFilter.options.length > 1) {
            typeFilter.remove(1);
        }
        
        // Add new options
        Array.from(this.companyTypes).sort().forEach(type => {
            const option = document.createElement('option');
            option.value = type;
            option.textContent = this.capitalizeFirst(type);
            typeFilter.appendChild(option);
        });
        
        // Restore selection if it still exists
        if (Array.from(typeFilter.options).some(opt => opt.value === currentSelection)) {
            typeFilter.value = currentSelection;
        } else {
            typeFilter.value = 'all';
        }
    }

    applyFilters() {
        // Get current filter values
        this.filters.status = document.getElementById('statusFilter').value;
        this.filters.type = document.getElementById('typeFilter').value;
        this.filters.year = document.getElementById('yearFilter').value;
        
        // Filter the companies
        const filteredCompanies = this.companies.filter(company => {
            // Status filter
            if (this.filters.status !== 'all') {
                if (this.filters.status === 'active' && company.company_status !== 'active') return false;
                if (this.filters.status === 'dissolved' && company.company_status !== 'dissolved') return false;
            }
            
            // Type filter
            if (this.filters.type !== 'all' && company.company_type !== this.filters.type) {
                return false;
            }
            
            // Year filter
            if (this.filters.year !== 'all' && company.date_of_creation) {
                const incorporationDate = new Date(company.date_of_creation);
                const now = new Date();
                let yearDiff = now.getFullYear() - incorporationDate.getFullYear();
                
                // Adjust for months to get exact years
                if (now.getMonth() < incorporationDate.getMonth() || 
                    (now.getMonth() === incorporationDate.getMonth() && now.getDate() < incorporationDate.getDate())) {
                    yearDiff--;
                }
                
                if (this.filters.year === 'last-1' && yearDiff > 1) return false;
                if (this.filters.year === 'last-5' && yearDiff > 5) return false;
                if (this.filters.year === 'last-10' && yearDiff > 10) return false;
            }
            
            return true;
        });
        
        this.sortCompanies(filteredCompanies);
        this.displayCompanies(filteredCompanies);
    }

    sortCompanies(companies = this.companies) {
        const [field, direction] = this.sortField.split('-');
        
        return companies.sort((a, b) => {
            switch (field) {
                case 'name':
                    const nameA = a.title.toLowerCase();
                    const nameB = b.title.toLowerCase();
                    return direction === 'asc' 
                        ? nameA.localeCompare(nameB)
                        : nameB.localeCompare(nameA);
                
                case 'incorporated':
                    const dateA = a.date_of_creation ? new Date(a.date_of_creation).getTime() : 0;
                    const dateB = b.date_of_creation ? new Date(b.date_of_creation).getTime() : 0;
                    return direction === 'newest' 
                        ? dateB - dateA
                        : dateA - dateB;
                    
                default: // relevance is the default from API
                    return 0;
            }
        });
    }

    async displayCompanies(companies) {
        const resultsDiv = document.getElementById('results');
        const statsContainer = document.getElementById('stats-container');
        const controlsBar = document.getElementById('controlsBar');
        const pagination = document.getElementById('pagination');

        if (companies.length === 0) {
            statsContainer.style.display = 'none';
            controlsBar.style.display = 'none';
            pagination.style.display = 'none';
            resultsDiv.innerHTML = '<div class="info">No companies found. Try a different search term or adjust your filters.</div>';
            return;
        }

        // Generate stats
        const stats = this.generateStats(companies);
        
        // Display stats above the filters in company-results-outer
        statsContainer.style.display = 'block';
        statsContainer.innerHTML = `
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
        `;

        // Show controls and pagination
        controlsBar.style.display = 'flex';
        pagination.style.display = 'flex';

        // Update pagination info
        document.getElementById('pageInfo').textContent = `Page ${this.currentPage} of ${this.totalPages}`;
        document.getElementById('prevPage').disabled = this.currentPage <= 1;
        document.getElementById('nextPage').disabled = this.currentPage >= this.totalPages;

        // Display company results in the white section
        let html = '';
        if (this.currentView === 'grid') {
            html = this.renderGridView(companies);
        } else {
            html = this.renderTableView(companies);
        }

        resultsDiv.innerHTML = html;
    }

    renderGridView(companies) {
        let html = '<div class="company-grid">';
        
        for (const company of companies) {
            html += this.createCompanyCard(company);
        }
        
        html += '</div>';
        return html;
    }

    renderTableView(companies) {
        let html = `
            <div class="table-container">
                <table class="company-table">
                    <thead>
                        <tr>
                            <th>Company Name</th>
                            <th>Company Number</th>
                            <th>Status</th>
                            <th>Type</th>
                            <th>Incorporated</th>
                            <th>Address</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        for (const company of companies) {
            const statusClass = company.company_status === 'active' ? 'status-active' : 'status-dissolved';
            const incorporationDate = company.date_of_creation ? new Date(company.date_of_creation).toLocaleDateString() : 'N/A';
            
            html += `
                <tr>
                    <td><strong>${this.escapeHtml(company.title)}</strong></td>
                    <td>${company.company_number}</td>
                    <td class="${statusClass}">${this.capitalizeFirst(company.company_status || 'Unknown')}</td>
                    <td>${this.capitalizeFirst(company.company_type || 'N/A')}</td>
                    <td>${incorporationDate}</td>
                    <td>${company.address ? this.formatAddress(company.address) : 'N/A'}</td>
                </tr>
            `;
        }
        
        html += `
                    </tbody>
                </table>
            </div>
        `;
        
        return html;
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
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    capitalizeFirst(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).replace(/-/g, ' ');
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new CambridgeStartups();
});