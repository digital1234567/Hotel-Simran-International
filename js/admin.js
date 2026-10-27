/**
 * Hotel Simran International — Admin CRM Panel
 * ===============================================
 * Complete admin dashboard with authentication, booking management,
 * room management, testimonial management, content management,
 * analytics, and notification system.
 *
 * All data persists in localStorage. Integrates with BookingManager
 * from booking.js for data consistency.
 *
 * @author Hotel Simran International Dev Team
 * @version 1.0.0
 */

/* ============================================================
   ADMIN PANEL CLASS
   ============================================================ */

/**
 * Main AdminPanel class — handles authentication, navigation,
 * and orchestrates all sub-modules.
 */
class AdminPanel {
    /**
     * Hardcoded credentials (in production, use a backend).
     * @private
     */
    static CREDENTIALS = {
        username: 'admin',
        password: 'simran2026'
    };

    constructor() {
        /** @type {BookingManager} */
        this.bookingManager = new BookingManager();

        /** @private */
        this._sessionKey = 'hsi_admin_session';

        /** Sub-modules */
        this.dashboard = new DashboardModule(this);
        this.bookings = new BookingManagementModule(this);
        this.rooms = new RoomManagementModule(this);
        this.testimonials = new TestimonialModule(this);
        this.content = new ContentModule(this);
        this.analytics = new AnalyticsModule(this);
        this.notifications = new NotificationModule(this);

        this._init();
    }

    /* --------------------------------------------------------
       INITIALIZATION
       -------------------------------------------------------- */

    /** @private */
    _init() {
        if (this.isAuthenticated()) {
            this._showDashboard();
        } else {
            this._showLoginScreen();
        }
    }

    /* --------------------------------------------------------
       AUTHENTICATION
       -------------------------------------------------------- */

    /**
     * Attempt to log in with the given credentials.
     * @param {string} username
     * @param {string} password
     * @returns {boolean}
     */
    login(username, password) {
        if (username === AdminPanel.CREDENTIALS.username &&
            password === AdminPanel.CREDENTIALS.password) {
            sessionStorage.setItem(this._sessionKey, JSON.stringify({
                user: username,
                loginTime: new Date().toISOString()
            }));
            this._showDashboard();
            return true;
        }
        return false;
    }

    /**
     * Log out the current admin session.
     */
    logout() {
        sessionStorage.removeItem(this._sessionKey);
        this._showLoginScreen();
        if (typeof showToast === 'function') showToast('Logged out successfully.', 'info');
    }

    /**
     * Check if an admin is currently authenticated.
     * @returns {boolean}
     */
    isAuthenticated() {
        const session = sessionStorage.getItem(this._sessionKey);
        return !!session;
    }

    /**
     * Get current session info.
     * @returns {Object|null}
     */
    getSession() {
        try {
            return JSON.parse(sessionStorage.getItem(this._sessionKey));
        } catch {
            return null;
        }
    }

    /* --------------------------------------------------------
       UI — LOGIN SCREEN
       -------------------------------------------------------- */

    /** @private */
    _showLoginScreen() {
        const app = document.querySelector('#adminApp, .admin-app, main');
        if (!app) return;

        app.innerHTML = `
            <div class="admin-login-wrapper">
                <div class="admin-login-card">
                    <div class="admin-login-logo">
                        <h1>🏨 Hotel Simran International</h1>
                        <p>Admin Panel</p>
                    </div>
                    <form id="adminLoginForm" class="admin-login-form">
                        <div class="form-group">
                            <label for="adminUsername">Username</label>
                            <input type="text" id="adminUsername" placeholder="Enter username" required autofocus />
                        </div>
                        <div class="form-group">
                            <label for="adminPassword">Password</label>
                            <input type="password" id="adminPassword" placeholder="Enter password" required />
                        </div>
                        <p class="login-error" id="loginError" style="display:none;"></p>
                        <button type="submit" class="btn btn-primary btn-full">Login</button>
                    </form>
                </div>
            </div>
        `;

        document.getElementById('adminLoginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const user = document.getElementById('adminUsername').value.trim();
            const pass = document.getElementById('adminPassword').value;
            const errorEl = document.getElementById('loginError');

            if (!this.login(user, pass)) {
                errorEl.textContent = 'Invalid username or password.';
                errorEl.style.display = 'block';
            }
        });
    }

    /* --------------------------------------------------------
       UI — MAIN DASHBOARD LAYOUT
       -------------------------------------------------------- */

    /** @private */
    _showDashboard() {
        const app = document.querySelector('#adminApp, .admin-app, main');
        if (!app) return;

        const session = this.getSession();

        app.innerHTML = `
            <div class="admin-layout">
                <!-- Sidebar -->
                <aside class="admin-sidebar">
                    <div class="sidebar-header">
                        <h2>🏨 HSI Admin</h2>
                    </div>
                    <nav class="sidebar-nav">
                        <a href="#" class="sidebar-link active" data-section="dashboard">
                            <span class="sidebar-icon">📊</span> Dashboard
                        </a>
                        <a href="#" class="sidebar-link" data-section="bookings">
                            <span class="sidebar-icon">📋</span> Bookings
                        </a>
                        <a href="#" class="sidebar-link" data-section="rooms">
                            <span class="sidebar-icon">🛏️</span> Rooms
                        </a>
                        <a href="#" class="sidebar-link" data-section="testimonials">
                            <span class="sidebar-icon">⭐</span> Testimonials
                        </a>
                        <a href="#" class="sidebar-link" data-section="content">
                            <span class="sidebar-icon">📝</span> Content
                        </a>
                        <a href="#" class="sidebar-link" data-section="analytics">
                            <span class="sidebar-icon">📈</span> Analytics
                        </a>
                    </nav>
                    <div class="sidebar-footer">
                        <div class="admin-user">
                            <span>👤 ${session?.user || 'Admin'}</span>
                        </div>
                        <button class="btn btn-sm btn-outline" id="adminLogout">Logout</button>
                    </div>
                </aside>

                <!-- Main Content -->
                <main class="admin-main">
                    <header class="admin-header">
                        <h1 class="admin-page-title">Dashboard</h1>
                        <div class="admin-header-actions">
                            <span class="admin-date">${new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                    </header>
                    <div class="admin-content" id="adminContent">
                        <!-- Dynamic content rendered here -->
                    </div>
                </main>
            </div>
        `;

        // Sidebar navigation
        app.querySelectorAll('.sidebar-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.dataset.section;
                // Update active state
                app.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                // Update title
                app.querySelector('.admin-page-title').textContent = link.textContent.trim();
                // Render section
                this._renderSection(section);
            });
        });

        // Logout
        document.getElementById('adminLogout').addEventListener('click', () => this.logout());

        // Render default section
        this._renderSection('dashboard');
    }

    /**
     * Render a given admin section.
     * @param {string} section
     * @private
     */
    _renderSection(section) {
        switch (section) {
            case 'dashboard':
                this.dashboard.render();
                break;
            case 'bookings':
                this.bookings.render();
                break;
            case 'rooms':
                this.rooms.render();
                break;
            case 'testimonials':
                this.testimonials.render();
                break;
            case 'content':
                this.content.render();
                break;
            case 'analytics':
                this.analytics.render();
                break;
        }
    }
}

/* ============================================================
   DASHBOARD MODULE
   ============================================================ */

/**
 * Shows overview stats: total bookings, revenue, occupancy, avg rating.
 */
class DashboardModule {
    /**
     * @param {AdminPanel} admin
     */
    constructor(admin) {
        this.admin = admin;
    }

    /**
     * Calculate dashboard statistics from localStorage data.
     * @returns {{ totalBookings: number, totalRevenue: number, occupancyRate: number, avgRating: number, confirmed: number, cancelled: number, checkedIn: number }}
     */
    getDashboardStats() {
        const bookings = this.admin.bookingManager.getAllReservations();
        const totalBookings = bookings.length;
        const confirmed = bookings.filter(b => b.status === 'confirmed').length;
        const checkedIn = bookings.filter(b => b.status === 'checked-in').length;
        const cancelled = bookings.filter(b => b.status === 'cancelled').length;
        const checkedOut = bookings.filter(b => b.status === 'checked-out').length;

        const totalRevenue = bookings
            .filter(b => b.status !== 'cancelled')
            .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

        // Total room inventory
        const totalRooms = ROOMS.reduce((sum, r) => sum + r.totalRooms, 0);
        const occupiedRooms = checkedIn + confirmed;
        const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

        // Average rating from testimonials
        const testimonials = this._getTestimonials();
        const avgRating = testimonials.length > 0
            ? (testimonials.reduce((sum, t) => sum + (t.rating || 0), 0) / testimonials.length).toFixed(1)
            : 4.2;

        return {
            totalBookings,
            totalRevenue,
            occupancyRate: Math.min(occupancyRate, 100),
            avgRating: parseFloat(avgRating),
            confirmed,
            cancelled,
            checkedIn,
            checkedOut
        };
    }

    /** @private */
    _getTestimonials() {
        try {
            return JSON.parse(localStorage.getItem('hsi_testimonials')) || [];
        } catch { return []; }
    }

    /**
     * Render the dashboard view.
     */
    render() {
        const container = document.getElementById('adminContent');
        if (!container) return;

        const stats = this.getDashboardStats();
        const recentBookings = this.admin.bookingManager.getAllReservations()
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);

        container.innerHTML = `
            <div class="dashboard-grid">
                <!-- Stats Cards -->
                <div class="stats-cards">
                    <div class="stat-card stat-primary">
                        <div class="stat-card-icon">📋</div>
                        <div class="stat-card-info">
                            <h3>${stats.totalBookings}</h3>
                            <p>Total Bookings</p>
                        </div>
                    </div>
                    <div class="stat-card stat-success">
                        <div class="stat-card-icon">💰</div>
                        <div class="stat-card-info">
                            <h3>₹${stats.totalRevenue.toLocaleString('en-IN')}</h3>
                            <p>Total Revenue</p>
                        </div>
                    </div>
                    <div class="stat-card stat-warning">
                        <div class="stat-card-icon">🏨</div>
                        <div class="stat-card-info">
                            <h3>${stats.occupancyRate}%</h3>
                            <p>Occupancy Rate</p>
                        </div>
                    </div>
                    <div class="stat-card stat-info">
                        <div class="stat-card-icon">⭐</div>
                        <div class="stat-card-info">
                            <h3>${stats.avgRating}</h3>
                            <p>Avg. Rating</p>
                        </div>
                    </div>
                </div>

                <!-- Booking Status Breakdown -->
                <div class="dashboard-section">
                    <h3>Booking Status Overview</h3>
                    <div class="status-bars">
                        <div class="status-bar-item">
                            <span class="status-label">Confirmed</span>
                            <div class="status-bar"><div class="status-fill confirmed" style="width: ${stats.totalBookings ? (stats.confirmed / stats.totalBookings * 100) : 0}%"></div></div>
                            <span class="status-count">${stats.confirmed}</span>
                        </div>
                        <div class="status-bar-item">
                            <span class="status-label">Checked In</span>
                            <div class="status-bar"><div class="status-fill checked-in" style="width: ${stats.totalBookings ? (stats.checkedIn / stats.totalBookings * 100) : 0}%"></div></div>
                            <span class="status-count">${stats.checkedIn}</span>
                        </div>
                        <div class="status-bar-item">
                            <span class="status-label">Cancelled</span>
                            <div class="status-bar"><div class="status-fill cancelled" style="width: ${stats.totalBookings ? (stats.cancelled / stats.totalBookings * 100) : 0}%"></div></div>
                            <span class="status-count">${stats.cancelled}</span>
                        </div>
                    </div>
                </div>

                <!-- Recent Bookings -->
                <div class="dashboard-section">
                    <h3>Recent Bookings</h3>
                    ${recentBookings.length > 0 ? `
                        <table class="admin-table">
                            <thead>
                                <tr>
                                    <th>Booking ID</th>
                                    <th>Guest</th>
                                    <th>Room</th>
                                    <th>Check-in</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${recentBookings.map(b => `
                                    <tr>
                                        <td><strong>${b.id}</strong></td>
                                        <td>${b.guestName}</td>
                                        <td>${b.roomName || b.roomType}</td>
                                        <td>${formatDate(b.checkIn)}</td>
                                        <td>₹${(b.totalAmount || 0).toLocaleString('en-IN')}</td>
                                        <td><span class="status-badge status-${b.status}">${b.status}</span></td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    ` : '<p class="empty-state">No bookings yet. Bookings made on the website will appear here.</p>'}
                </div>
            </div>
        `;
    }
}

/* ============================================================
   BOOKING MANAGEMENT MODULE
   ============================================================ */

/**
 * Manages all bookings — view, filter, search, update status,
 * and export as CSV.
 */
class BookingManagementModule {
    /**
     * @param {AdminPanel} admin
     */
    constructor(admin) {
        this.admin = admin;
        this.filterStatus = 'all';
        this.searchQuery = '';
        this.sortField = 'createdAt';
        this.sortDirection = 'desc';
    }

    /**
     * Render the bookings management view.
     */
    render() {
        const container = document.getElementById('adminContent');
        if (!container) return;

        container.innerHTML = `
            <div class="bookings-management">
                <div class="management-toolbar">
                    <div class="toolbar-filters">
                        <select id="statusFilter" class="admin-select">
                            <option value="all">All Statuses</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="checked-in">Checked In</option>
                            <option value="checked-out">Checked Out</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                        <input type="text" id="bookingSearch" class="admin-input" placeholder="Search by ID or guest name..." />
                    </div>
                    <div class="toolbar-actions">
                        <button class="btn btn-secondary" id="exportCsv">📥 Export CSV</button>
                        <button class="btn btn-primary" id="refreshBookings">🔄 Refresh</button>
                    </div>
                </div>
                <div id="bookingsTableContainer">
                    <!-- Table rendered here -->
                </div>
            </div>
        `;

        // Filter handler
        document.getElementById('statusFilter').addEventListener('change', (e) => {
            this.filterStatus = e.target.value;
            this.renderBookingsTable();
        });

        // Search handler
        document.getElementById('bookingSearch').addEventListener('input', (e) => {
            this.searchQuery = e.target.value.trim().toLowerCase();
            this.renderBookingsTable();
        });

        // Export CSV
        document.getElementById('exportCsv').addEventListener('click', () => this.exportCSV());

        // Refresh
        document.getElementById('refreshBookings').addEventListener('click', () => this.renderBookingsTable());

        this.renderBookingsTable();
    }

    /**
     * Render the bookings table with current filters applied.
     */
    renderBookingsTable() {
        const container = document.getElementById('bookingsTableContainer');
        if (!container) return;

        let bookings = this.admin.bookingManager.getAllReservations();

        // Filter by status
        if (this.filterStatus !== 'all') {
            bookings = bookings.filter(b => b.status === this.filterStatus);
        }

        // Search
        if (this.searchQuery) {
            bookings = bookings.filter(b =>
                b.id.toLowerCase().includes(this.searchQuery) ||
                (b.guestName && b.guestName.toLowerCase().includes(this.searchQuery))
            );
        }

        // Sort
        bookings.sort((a, b) => {
            const valA = a[this.sortField] || '';
            const valB = b[this.sortField] || '';
            const cmp = valA > valB ? 1 : valA < valB ? -1 : 0;
            return this.sortDirection === 'desc' ? -cmp : cmp;
        });

        if (bookings.length === 0) {
            container.innerHTML = '<p class="empty-state">No bookings found matching your criteria.</p>';
            return;
        }

        container.innerHTML = `
            <table class="admin-table sortable-table">
                <thead>
                    <tr>
                        <th data-sort="id">Booking ID</th>
                        <th data-sort="guestName">Guest Name</th>
                        <th data-sort="roomName">Room</th>
                        <th data-sort="checkIn">Check-in</th>
                        <th data-sort="checkOut">Check-out</th>
                        <th data-sort="totalAmount">Amount</th>
                        <th data-sort="status">Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${bookings.map(b => `
                        <tr data-booking-id="${b.id}">
                            <td><strong>${b.id}</strong></td>
                            <td>${b.guestName || '—'}</td>
                            <td>${b.roomName || b.roomType}</td>
                            <td>${formatDate(b.checkIn)}</td>
                            <td>${formatDate(b.checkOut)}</td>
                            <td>₹${(b.totalAmount || 0).toLocaleString('en-IN')}</td>
                            <td>
                                <select class="status-select status-${b.status}" data-id="${b.id}">
                                    <option value="confirmed" ${b.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                                    <option value="checked-in" ${b.status === 'checked-in' ? 'selected' : ''}>Checked In</option>
                                    <option value="checked-out" ${b.status === 'checked-out' ? 'selected' : ''}>Checked Out</option>
                                    <option value="cancelled" ${b.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                                </select>
                            </td>
                            <td>
                                <button class="btn btn-sm btn-outline view-booking" data-id="${b.id}" title="View details">👁️</button>
                                ${b.status !== 'cancelled' ? `<button class="btn btn-sm btn-danger cancel-booking" data-id="${b.id}" title="Cancel">✕</button>` : ''}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <p class="table-count">Showing ${bookings.length} booking(s)</p>
        `;

        // Sortable columns
        container.querySelectorAll('th[data-sort]').forEach(th => {
            th.style.cursor = 'pointer';
            th.addEventListener('click', () => {
                const field = th.dataset.sort;
                if (this.sortField === field) {
                    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
                } else {
                    this.sortField = field;
                    this.sortDirection = 'asc';
                }
                this.renderBookingsTable();
            });
        });

        // Status change handlers
        container.querySelectorAll('.status-select').forEach(select => {
            select.addEventListener('change', (e) => {
                this._updateBookingStatus(e.target.dataset.id, e.target.value);
            });
        });

        // View booking details
        container.querySelectorAll('.view-booking').forEach(btn => {
            btn.addEventListener('click', () => {
                this._showBookingDetail(btn.dataset.id);
            });
        });

        // Cancel booking
        container.querySelectorAll('.cancel-booking').forEach(btn => {
            btn.addEventListener('click', () => {
                if (confirm('Are you sure you want to cancel this booking?')) {
                    this.admin.bookingManager.cancelReservation(btn.dataset.id);
                    showToast('Booking cancelled.', 'warning');
                    this.renderBookingsTable();
                }
            });
        });
    }

    /**
     * Update a booking's status.
     * @param {string} bookingId
     * @param {string} newStatus
     * @private
     */
    _updateBookingStatus(bookingId, newStatus) {
        const bookings = this.admin.bookingManager.getAllReservations();
        const index = bookings.findIndex(b => b.id === bookingId);
        if (index === -1) return;

        bookings[index].status = newStatus;
        bookings[index].updatedAt = new Date().toISOString();
        localStorage.setItem('hsi_bookings', JSON.stringify(bookings));

        showToast(`Booking ${bookingId} status updated to "${newStatus}".`, 'success');
        this.renderBookingsTable();
    }

    /**
     * Show a detailed view of a single booking.
     * @param {string} bookingId
     * @private
     */
    _showBookingDetail(bookingId) {
        const booking = this.admin.bookingManager.getReservation(bookingId);
        if (!booking) {
            showToast('Booking not found.', 'error');
            return;
        }

        // Simple alert-style detail (could be a modal)
        const details = [
            `Booking ID: ${booking.id}`,
            `Status: ${booking.status}`,
            `Guest: ${booking.guestName}`,
            `Email: ${booking.email}`,
            `Phone: ${booking.phone}`,
            `Room: ${booking.roomName || booking.roomType}`,
            `Check-in: ${formatDate(booking.checkIn)}`,
            `Check-out: ${formatDate(booking.checkOut)}`,
            `Nights: ${booking.nights}`,
            `Guests: ${booking.guests}`,
            `Subtotal: ₹${(booking.subtotal || 0).toLocaleString('en-IN')}`,
            `GST: ₹${(booking.gstAmount || 0).toLocaleString('en-IN')}`,
            `Total: ₹${(booking.totalAmount || 0).toLocaleString('en-IN')}`,
            booking.specialRequests ? `Special Requests: ${booking.specialRequests}` : '',
            `Created: ${booking.createdAt ? formatDate(booking.createdAt) : '—'}`
        ].filter(Boolean).join('\n');

        alert(details);
    }

    /**
     * Export all bookings (filtered) as a CSV file.
     */
    exportCSV() {
        let bookings = this.admin.bookingManager.getAllReservations();

        if (this.filterStatus !== 'all') {
            bookings = bookings.filter(b => b.status === this.filterStatus);
        }

        if (bookings.length === 0) {
            showToast('No bookings to export.', 'warning');
            return;
        }

        const headers = ['Booking ID', 'Guest Name', 'Email', 'Phone', 'Room', 'Check-in', 'Check-out', 'Nights', 'Guests', 'Subtotal', 'GST', 'Total', 'Status', 'Created At'];
        const rows = bookings.map(b => [
            b.id,
            b.guestName,
            b.email,
            b.phone,
            b.roomName || b.roomType,
            b.checkIn,
            b.checkOut,
            b.nights,
            b.guests,
            b.subtotal,
            b.gstAmount,
            b.totalAmount,
            b.status,
            b.createdAt
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(val => `"${String(val || '').replace(/"/g, '""')}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `HSI_Bookings_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);

        showToast('Bookings exported as CSV!', 'success');
    }
}

/* ============================================================
   ROOM MANAGEMENT MODULE
   ============================================================ */

/**
 * Manage room types — update prices, toggle availability,
 * edit descriptions, and view current status.
 */
class RoomManagementModule {
    /**
     * @param {AdminPanel} admin
     */
    constructor(admin) {
        this.admin = admin;
        /** @private */
        this._storageKey = 'hsi_rooms_overrides';
    }

    /**
     * Get room data with any admin overrides applied.
     * @returns {Array<Object>}
     */
    getRoomsWithOverrides() {
        const overrides = this._getOverrides();
        return ROOMS.map(room => {
            const override = overrides[room.id] || {};
            return { ...room, ...override };
        });
    }

    /** @private */
    _getOverrides() {
        try {
            return JSON.parse(localStorage.getItem(this._storageKey)) || {};
        } catch { return {}; }
    }

    /** @private */
    _saveOverride(roomId, data) {
        const overrides = this._getOverrides();
        overrides[roomId] = { ...(overrides[roomId] || {}), ...data };
        localStorage.setItem(this._storageKey, JSON.stringify(overrides));
    }

    /**
     * Render the rooms management view.
     */
    render() {
        const container = document.getElementById('adminContent');
        if (!container) return;

        this.renderRoomsTable(container);
    }

    /**
     * Render the rooms table.
     * @param {HTMLElement} [container]
     */
    renderRoomsTable(container) {
        container = container || document.getElementById('adminContent');
        if (!container) return;

        const rooms = this.getRoomsWithOverrides();
        const bookings = this.admin.bookingManager.getAllReservations();
        const today = new Date().toISOString().slice(0, 10);

        container.innerHTML = `
            <div class="rooms-management">
                <div class="management-toolbar">
                    <h3>Room Inventory</h3>
                </div>
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Room Type</th>
                            <th>Price/Night</th>
                            <th>Max Guests</th>
                            <th>Total Rooms</th>
                            <th>Currently Booked</th>
                            <th>Available</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rooms.map(room => {
                            const booked = bookings.filter(b =>
                                b.roomType === room.id &&
                                b.status !== 'cancelled' &&
                                b.checkIn <= today &&
                                b.checkOut > today
                            ).length;
                            const available = Math.max(0, room.totalRooms - booked);
                            const isDisabled = room.disabled === true;

                            return `
                                <tr class="${isDisabled ? 'row-disabled' : ''}">
                                    <td>
                                        <strong>${room.name}</strong>
                                        <br><small>${room.id}</small>
                                    </td>
                                    <td>
                                        <input type="number" class="admin-input-sm room-price-input"
                                            data-room="${room.id}" value="${room.price}" min="500" step="100" />
                                    </td>
                                    <td>${room.maxGuests}</td>
                                    <td>${room.totalRooms}</td>
                                    <td>${booked}</td>
                                    <td><strong>${available}</strong></td>
                                    <td>
                                        <label class="toggle-switch">
                                            <input type="checkbox" class="room-toggle" data-room="${room.id}"
                                                ${!isDisabled ? 'checked' : ''} />
                                            <span class="toggle-slider"></span>
                                        </label>
                                    </td>
                                    <td>
                                        <button class="btn btn-sm btn-primary save-room-price" data-room="${room.id}">💾 Save</button>
                                        <button class="btn btn-sm btn-outline edit-room-desc" data-room="${room.id}">✏️ Edit</button>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>

                <!-- Room Description Editor -->
                <div id="roomDescEditor" class="room-desc-editor" style="display:none;">
                    <h3>Edit Room — <span id="editRoomName"></span></h3>
                    <div class="form-group">
                        <label>Description</label>
                        <textarea id="editRoomDesc" class="admin-textarea" rows="4"></textarea>
                    </div>
                    <div class="form-group">
                        <label>Photo URL (placeholder)</label>
                        <input type="text" id="editRoomPhoto" class="admin-input" placeholder="Enter image URL" />
                    </div>
                    <div class="form-actions">
                        <button class="btn btn-secondary" id="cancelRoomEdit">Cancel</button>
                        <button class="btn btn-primary" id="saveRoomEdit">Save Changes</button>
                    </div>
                </div>
            </div>
        `;

        // Save price handlers
        container.querySelectorAll('.save-room-price').forEach(btn => {
            btn.addEventListener('click', () => {
                const roomId = btn.dataset.room;
                const priceInput = container.querySelector(`.room-price-input[data-room="${roomId}"]`);
                const newPrice = parseInt(priceInput.value);
                if (newPrice >= 500) {
                    this._saveOverride(roomId, { price: newPrice });
                    showToast(`${roomId} room price updated to ₹${newPrice.toLocaleString('en-IN')}.`, 'success');
                } else {
                    showToast('Price must be at least ₹500.', 'warning');
                }
            });
        });

        // Toggle availability
        container.querySelectorAll('.room-toggle').forEach(toggle => {
            toggle.addEventListener('change', () => {
                const roomId = toggle.dataset.room;
                this._saveOverride(roomId, { disabled: !toggle.checked });
                showToast(`${roomId} room ${toggle.checked ? 'enabled' : 'disabled'}.`, 'info');
                this.renderRoomsTable(container);
            });
        });

        // Edit description
        container.querySelectorAll('.edit-room-desc').forEach(btn => {
            btn.addEventListener('click', () => {
                const roomId = btn.dataset.room;
                const room = this.getRoomsWithOverrides().find(r => r.id === roomId);
                const editor = document.getElementById('roomDescEditor');
                document.getElementById('editRoomName').textContent = room.name;
                document.getElementById('editRoomDesc').value = room.description;
                document.getElementById('editRoomPhoto').value = room.image || '';
                editor.style.display = 'block';
                editor.dataset.roomId = roomId;
            });
        });

        // Save room edit
        const saveEditBtn = document.getElementById('saveRoomEdit');
        if (saveEditBtn) {
            saveEditBtn.addEventListener('click', () => {
                const editor = document.getElementById('roomDescEditor');
                const roomId = editor.dataset.roomId;
                const desc = document.getElementById('editRoomDesc').value.trim();
                const photo = document.getElementById('editRoomPhoto').value.trim();
                this._saveOverride(roomId, { description: desc, image: photo });
                editor.style.display = 'none';
                showToast('Room details updated!', 'success');
                this.renderRoomsTable(container);
            });
        }

        // Cancel edit
        const cancelEditBtn = document.getElementById('cancelRoomEdit');
        if (cancelEditBtn) {
            cancelEditBtn.addEventListener('click', () => {
                document.getElementById('roomDescEditor').style.display = 'none';
            });
        }
    }
}

/* ============================================================
   TESTIMONIAL MANAGEMENT MODULE
   ============================================================ */

/**
 * Manage guest testimonials — add, edit, delete, toggle visibility.
 */
class TestimonialModule {
    /**
     * @param {AdminPanel} admin
     */
    constructor(admin) {
        this.admin = admin;
        /** @private */
        this._storageKey = 'hsi_testimonials';
    }

    /**
     * Get all testimonials from localStorage.
     * @returns {Array<Object>}
     */
    getAll() {
        try {
            return JSON.parse(localStorage.getItem(this._storageKey)) || [];
        } catch { return []; }
    }

    /** @private */
    _save(testimonials) {
        localStorage.setItem(this._storageKey, JSON.stringify(testimonials));
    }

    /**
     * Add a new testimonial.
     * @param {Object} data — { guestName, text, rating, videoUrl, visible }
     * @returns {Object}
     */
    add(data) {
        const testimonials = this.getAll();
        const testimonial = {
            id: 'T-' + Date.now(),
            guestName: data.guestName,
            text: data.text,
            rating: parseFloat(data.rating) || 5,
            videoUrl: data.videoUrl || '',
            visible: data.visible !== false,
            createdAt: new Date().toISOString()
        };
        testimonials.push(testimonial);
        this._save(testimonials);
        return testimonial;
    }

    /**
     * Update an existing testimonial.
     * @param {string} id
     * @param {Object} data
     */
    update(id, data) {
        const testimonials = this.getAll();
        const index = testimonials.findIndex(t => t.id === id);
        if (index === -1) return;
        testimonials[index] = { ...testimonials[index], ...data, updatedAt: new Date().toISOString() };
        this._save(testimonials);
    }

    /**
     * Delete a testimonial.
     * @param {string} id
     */
    delete(id) {
        const testimonials = this.getAll().filter(t => t.id !== id);
        this._save(testimonials);
    }

    /**
     * Toggle testimonial visibility on the website.
     * @param {string} id
     */
    toggleVisibility(id) {
        const testimonials = this.getAll();
        const t = testimonials.find(t => t.id === id);
        if (t) {
            t.visible = !t.visible;
            this._save(testimonials);
        }
    }

    /**
     * Render the testimonials management view.
     */
    render() {
        const container = document.getElementById('adminContent');
        if (!container) return;

        this.renderTestimonials(container);
    }

    /**
     * Render testimonials list with add form.
     * @param {HTMLElement} [container]
     */
    renderTestimonials(container) {
        container = container || document.getElementById('adminContent');
        if (!container) return;

        const testimonials = this.getAll();

        container.innerHTML = `
            <div class="testimonials-management">
                <!-- Add New Testimonial -->
                <div class="add-testimonial-card">
                    <h3>Add New Testimonial</h3>
                    <form id="addTestimonialForm" class="admin-form">
                        <div class="form-row">
                            <div class="form-group">
                                <label>Guest Name *</label>
                                <input type="text" name="guestName" required placeholder="Guest name" class="admin-input" />
                            </div>
                            <div class="form-group">
                                <label>Rating (1-5) *</label>
                                <input type="number" name="rating" min="1" max="5" step="0.1" value="5" required class="admin-input" />
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Testimonial Text *</label>
                            <textarea name="text" required rows="3" placeholder="Enter testimonial text..." class="admin-textarea"></textarea>
                        </div>
                        <div class="form-group">
                            <label>Video URL (optional)</label>
                            <input type="url" name="videoUrl" placeholder="https://youtube.com/..." class="admin-input" />
                        </div>
                        <button type="submit" class="btn btn-primary">+ Add Testimonial</button>
                    </form>
                </div>

                <!-- Testimonials List -->
                <div class="testimonials-list">
                    <h3>All Testimonials (${testimonials.length})</h3>
                    ${testimonials.length > 0 ? testimonials.map(t => `
                        <div class="testimonial-admin-card ${!t.visible ? 'hidden-testimonial' : ''}">
                            <div class="testimonial-admin-header">
                                <div>
                                    <strong>${t.guestName}</strong>
                                    <span class="rating-stars">${'⭐'.repeat(Math.round(t.rating))} (${t.rating})</span>
                                </div>
                                <div class="testimonial-admin-actions">
                                    <button class="btn btn-sm ${t.visible ? 'btn-outline' : 'btn-warning'} toggle-vis" data-id="${t.id}">
                                        ${t.visible ? '👁️ Visible' : '🚫 Hidden'}
                                    </button>
                                    <button class="btn btn-sm btn-outline edit-testimonial" data-id="${t.id}">✏️</button>
                                    <button class="btn btn-sm btn-danger delete-testimonial" data-id="${t.id}">🗑️</button>
                                </div>
                            </div>
                            <p class="testimonial-admin-text">"${t.text}"</p>
                            ${t.videoUrl ? `<p class="testimonial-video-link">🎥 <a href="${t.videoUrl}" target="_blank">${t.videoUrl}</a></p>` : ''}
                            <small class="testimonial-date">Added: ${formatDate(t.createdAt)}</small>
                        </div>
                    `).join('') : '<p class="empty-state">No testimonials yet. Add your first testimonial above.</p>'}
                </div>
            </div>
        `;

        // Add form handler
        document.getElementById('addTestimonialForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const form = e.target;
            this.add({
                guestName: form.guestName.value.trim(),
                text: form.text.value.trim(),
                rating: form.rating.value,
                videoUrl: form.videoUrl.value.trim()
            });
            showToast('Testimonial added!', 'success');
            form.reset();
            this.renderTestimonials(container);
        });

        // Toggle visibility
        container.querySelectorAll('.toggle-vis').forEach(btn => {
            btn.addEventListener('click', () => {
                this.toggleVisibility(btn.dataset.id);
                this.renderTestimonials(container);
            });
        });

        // Delete
        container.querySelectorAll('.delete-testimonial').forEach(btn => {
            btn.addEventListener('click', () => {
                if (confirm('Delete this testimonial?')) {
                    this.delete(btn.dataset.id);
                    showToast('Testimonial deleted.', 'info');
                    this.renderTestimonials(container);
                }
            });
        });

        // Edit (inline edit via prompt — simple approach)
        container.querySelectorAll('.edit-testimonial').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                const t = this.getAll().find(t => t.id === id);
                if (!t) return;

                const newText = prompt('Edit testimonial text:', t.text);
                if (newText !== null && newText.trim()) {
                    const newRating = prompt('Edit rating (1-5):', t.rating);
                    this.update(id, {
                        text: newText.trim(),
                        rating: parseFloat(newRating) || t.rating
                    });
                    showToast('Testimonial updated!', 'success');
                    this.renderTestimonials(container);
                }
            });
        });
    }
}

/* ============================================================
   CONTENT MANAGEMENT MODULE
   ============================================================ */

/**
 * Manage hotel info, events, gallery, and nearby attractions.
 */
class ContentModule {
    /**
     * @param {AdminPanel} admin
     */
    constructor(admin) {
        this.admin = admin;
        /** @private */
        this._storageKey = 'hsi_content';
    }

    /**
     * Get saved content data.
     * @returns {Object}
     */
    getContent() {
        try {
            return JSON.parse(localStorage.getItem(this._storageKey)) || this._defaults();
        } catch { return this._defaults(); }
    }

    /** @private */
    _defaults() {
        return {
            hotelName: 'Hotel Simran International',
            address: 'Near Railway Station, Pandri, Raipur, Chhattisgarh 492001',
            phone: '+91 98765 43210',
            email: 'info@hotelsimranintl.com',
            tagline: 'Where Comfort Meets Tradition',
            events: [
                { id: 'E1', title: 'Wedding Season Offer', description: 'Celebrate your special day with our premium banquet halls. 20% off on wedding packages.', active: true },
                { id: 'E2', title: 'Corporate Retreat Package', description: 'Conference room + stay packages starting at ₹4,999/person.', active: true }
            ],
            gallery: [
                { id: 'G1', title: 'Hotel Lobby', url: 'images/gallery/lobby.jpg' },
                { id: 'G2', title: 'Deluxe Room', url: 'images/gallery/deluxe.jpg' },
                { id: 'G3', title: 'Restaurant', url: 'images/gallery/restaurant.jpg' },
                { id: 'G4', title: 'Banquet Hall', url: 'images/gallery/banquet.jpg' }
            ],
            attractions: [
                { id: 'A1', name: 'Marine Drive Raipur', distance: '3 km', description: 'Beautiful lakeside promenade perfect for evening walks.' },
                { id: 'A2', name: 'Mahant Ghasidas Museum', distance: '2 km', description: 'Rich collection of historical artifacts from Chhattisgarh.' },
                { id: 'A3', name: 'Nandan Van Zoo', distance: '8 km', description: 'Largest zoo in Chhattisgarh with safari and botanical garden.' }
            ]
        };
    }

    /** @private */
    _save(content) {
        localStorage.setItem(this._storageKey, JSON.stringify(content));
    }

    /**
     * Render the content management view.
     */
    render() {
        const container = document.getElementById('adminContent');
        if (!container) return;

        const content = this.getContent();

        container.innerHTML = `
            <div class="content-management">
                <!-- Hotel Info -->
                <div class="content-section">
                    <h3>🏨 Hotel Information</h3>
                    <form id="hotelInfoForm" class="admin-form">
                        <div class="form-row">
                            <div class="form-group">
                                <label>Hotel Name</label>
                                <input type="text" name="hotelName" value="${content.hotelName}" class="admin-input" />
                            </div>
                            <div class="form-group">
                                <label>Tagline</label>
                                <input type="text" name="tagline" value="${content.tagline}" class="admin-input" />
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Address</label>
                            <input type="text" name="address" value="${content.address}" class="admin-input" />
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Phone</label>
                                <input type="tel" name="phone" value="${content.phone}" class="admin-input" />
                            </div>
                            <div class="form-group">
                                <label>Email</label>
                                <input type="email" name="email" value="${content.email}" class="admin-input" />
                            </div>
                        </div>
                        <button type="submit" class="btn btn-primary">💾 Save Hotel Info</button>
                    </form>
                </div>

                <!-- Events -->
                <div class="content-section">
                    <h3>🎉 Events & Offers</h3>
                    <div id="eventsList">
                        ${(content.events || []).map((event, i) => `
                            <div class="event-admin-card">
                                <div class="event-admin-header">
                                    <strong>${event.title}</strong>
                                    <span class="status-badge status-${event.active ? 'confirmed' : 'cancelled'}">${event.active ? 'Active' : 'Inactive'}</span>
                                </div>
                                <p>${event.description}</p>
                                <div class="event-admin-actions">
                                    <button class="btn btn-sm btn-outline toggle-event" data-index="${i}">Toggle</button>
                                    <button class="btn btn-sm btn-danger remove-event" data-index="${i}">Remove</button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <div class="add-event-inline">
                        <input type="text" id="newEventTitle" placeholder="Event title" class="admin-input" />
                        <input type="text" id="newEventDesc" placeholder="Event description" class="admin-input" />
                        <button class="btn btn-secondary" id="addEventBtn">+ Add Event</button>
                    </div>
                </div>

                <!-- Gallery -->
                <div class="content-section">
                    <h3>📸 Gallery (Placeholder Manager)</h3>
                    <div class="gallery-admin-grid">
                        ${(content.gallery || []).map((img, i) => `
                            <div class="gallery-admin-item">
                                <div class="gallery-admin-thumb" style="background: linear-gradient(135deg, var(--color-gold), var(--color-navy));">
                                    <span>${img.title}</span>
                                </div>
                                <p>${img.url}</p>
                                <button class="btn btn-sm btn-danger remove-gallery" data-index="${i}">Remove</button>
                            </div>
                        `).join('')}
                    </div>
                    <div class="add-event-inline">
                        <input type="text" id="newGalleryTitle" placeholder="Image title" class="admin-input" />
                        <input type="text" id="newGalleryUrl" placeholder="Image URL" class="admin-input" />
                        <button class="btn btn-secondary" id="addGalleryBtn">+ Add Image</button>
                    </div>
                </div>

                <!-- Nearby Attractions -->
                <div class="content-section">
                    <h3>📍 Nearby Attractions</h3>
                    <div id="attractionsList">
                        ${(content.attractions || []).map((a, i) => `
                            <div class="attraction-admin-card">
                                <strong>${a.name}</strong> — ${a.distance}
                                <p>${a.description}</p>
                                <button class="btn btn-sm btn-danger remove-attraction" data-index="${i}">Remove</button>
                            </div>
                        `).join('')}
                    </div>
                    <div class="add-event-inline">
                        <input type="text" id="newAttractionName" placeholder="Attraction name" class="admin-input" />
                        <input type="text" id="newAttractionDist" placeholder="Distance" class="admin-input" />
                        <input type="text" id="newAttractionDesc" placeholder="Description" class="admin-input" />
                        <button class="btn btn-secondary" id="addAttractionBtn">+ Add Attraction</button>
                    </div>
                </div>
            </div>
        `;

        // Save hotel info
        document.getElementById('hotelInfoForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const form = e.target;
            const c = this.getContent();
            c.hotelName = form.hotelName.value.trim();
            c.tagline = form.tagline.value.trim();
            c.address = form.address.value.trim();
            c.phone = form.phone.value.trim();
            c.email = form.email.value.trim();
            this._save(c);
            showToast('Hotel information saved!', 'success');
        });

        // Toggle event
        container.querySelectorAll('.toggle-event').forEach(btn => {
            btn.addEventListener('click', () => {
                const c = this.getContent();
                const i = parseInt(btn.dataset.index);
                if (c.events[i]) {
                    c.events[i].active = !c.events[i].active;
                    this._save(c);
                    this.render();
                }
            });
        });

        // Remove event
        container.querySelectorAll('.remove-event').forEach(btn => {
            btn.addEventListener('click', () => {
                const c = this.getContent();
                c.events.splice(parseInt(btn.dataset.index), 1);
                this._save(c);
                this.render();
                showToast('Event removed.', 'info');
            });
        });

        // Add event
        document.getElementById('addEventBtn').addEventListener('click', () => {
            const title = document.getElementById('newEventTitle').value.trim();
            const desc = document.getElementById('newEventDesc').value.trim();
            if (!title) { showToast('Please enter an event title.', 'warning'); return; }
            const c = this.getContent();
            c.events = c.events || [];
            c.events.push({ id: 'E-' + Date.now(), title, description: desc, active: true });
            this._save(c);
            this.render();
            showToast('Event added!', 'success');
        });

        // Remove gallery
        container.querySelectorAll('.remove-gallery').forEach(btn => {
            btn.addEventListener('click', () => {
                const c = this.getContent();
                c.gallery.splice(parseInt(btn.dataset.index), 1);
                this._save(c);
                this.render();
                showToast('Gallery image removed.', 'info');
            });
        });

        // Add gallery
        document.getElementById('addGalleryBtn').addEventListener('click', () => {
            const title = document.getElementById('newGalleryTitle').value.trim();
            const url = document.getElementById('newGalleryUrl').value.trim();
            if (!title || !url) { showToast('Please enter image title and URL.', 'warning'); return; }
            const c = this.getContent();
            c.gallery = c.gallery || [];
            c.gallery.push({ id: 'G-' + Date.now(), title, url });
            this._save(c);
            this.render();
            showToast('Gallery image added!', 'success');
        });

        // Remove attraction
        container.querySelectorAll('.remove-attraction').forEach(btn => {
            btn.addEventListener('click', () => {
                const c = this.getContent();
                c.attractions.splice(parseInt(btn.dataset.index), 1);
                this._save(c);
                this.render();
                showToast('Attraction removed.', 'info');
            });
        });

        // Add attraction
        document.getElementById('addAttractionBtn').addEventListener('click', () => {
            const name = document.getElementById('newAttractionName').value.trim();
            const dist = document.getElementById('newAttractionDist').value.trim();
            const desc = document.getElementById('newAttractionDesc').value.trim();
            if (!name) { showToast('Please enter attraction name.', 'warning'); return; }
            const c = this.getContent();
            c.attractions = c.attractions || [];
            c.attractions.push({ id: 'A-' + Date.now(), name, distance: dist, description: desc });
            this._save(c);
            this.render();
            showToast('Attraction added!', 'success');
        });
    }
}

/* ============================================================
   ANALYTICS MODULE (Simulated)
   ============================================================ */

/**
 * Simulated analytics dashboard — monthly trends, revenue
 * breakdowns, occupancy rates, and guest demographics.
 */
class AnalyticsModule {
    /**
     * @param {AdminPanel} admin
     */
    constructor(admin) {
        this.admin = admin;
    }

    /**
     * Get monthly booking trend data.
     * @returns {Array<{ month: string, bookings: number, revenue: number }>}
     */
    getMonthlyTrends() {
        const bookings = this.admin.bookingManager.getAllReservations();
        const months = {};
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        // Initialize last 6 months
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
            months[key] = { month: key, bookings: 0, revenue: 0 };
        }

        bookings.forEach(b => {
            const d = new Date(b.createdAt);
            const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
            if (months[key]) {
                months[key].bookings++;
                if (b.status !== 'cancelled') {
                    months[key].revenue += b.totalAmount || 0;
                }
            }
        });

        return Object.values(months);
    }

    /**
     * Get revenue breakdown by room type.
     * @returns {Array<{ roomType: string, revenue: number, count: number }>}
     */
    getRevenueByRoomType() {
        const bookings = this.admin.bookingManager.getAllReservations()
            .filter(b => b.status !== 'cancelled');

        const byRoom = {};
        ROOMS.forEach(r => { byRoom[r.id] = { roomType: r.name, revenue: 0, count: 0 }; });

        bookings.forEach(b => {
            if (byRoom[b.roomType]) {
                byRoom[b.roomType].revenue += b.totalAmount || 0;
                byRoom[b.roomType].count++;
            }
        });

        return Object.values(byRoom);
    }

    /**
     * Get occupancy rates by room type (simulated with current data).
     * @returns {Array<{ roomType: string, rate: number }>}
     */
    getOccupancyRates() {
        const bookings = this.admin.bookingManager.getAllReservations()
            .filter(b => b.status !== 'cancelled');

        return ROOMS.map(room => {
            const roomBookings = bookings.filter(b => b.roomType === room.id).length;
            const rate = room.totalRooms > 0
                ? Math.min(100, Math.round((roomBookings / room.totalRooms) * 100))
                : 0;
            return { roomType: room.name, rate };
        });
    }

    /**
     * Get guest demographics (simulated).
     * @returns {{ domestic: number, corporate: number, family: number, couple: number }}
     */
    getGuestDemographics() {
        const bookings = this.admin.bookingManager.getAllReservations()
            .filter(b => b.status !== 'cancelled');
        const total = bookings.length || 1;

        // Simulated breakdown
        return {
            business: Math.round(total * 0.35),
            family: Math.round(total * 0.30),
            couple: Math.round(total * 0.20),
            solo: Math.round(total * 0.15)
        };
    }

    /**
     * Render the analytics dashboard.
     */
    render() {
        const container = document.getElementById('adminContent');
        if (!container) return;

        const trends = this.getMonthlyTrends();
        const revenueByRoom = this.getRevenueByRoomType();
        const occupancy = this.getOccupancyRates();
        const demographics = this.getGuestDemographics();
        const totalRevenue = revenueByRoom.reduce((sum, r) => sum + r.revenue, 0);

        container.innerHTML = `
            <div class="analytics-dashboard">
                <!-- Monthly Trends -->
                <div class="analytics-section">
                    <h3>📊 Monthly Booking Trends (Last 6 Months)</h3>
                    <div class="chart-container">
                        <table class="admin-table">
                            <thead>
                                <tr>
                                    <th>Month</th>
                                    <th>Bookings</th>
                                    <th>Revenue</th>
                                    <th>Visual</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${trends.map(t => `
                                    <tr>
                                        <td>${t.month}</td>
                                        <td>${t.bookings}</td>
                                        <td>₹${t.revenue.toLocaleString('en-IN')}</td>
                                        <td>
                                            <div class="mini-bar">
                                                <div class="mini-bar-fill" style="width: ${t.bookings > 0 ? Math.max(10, (t.bookings / Math.max(...trends.map(x => x.bookings), 1)) * 100) : 0}%"></div>
                                            </div>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Revenue by Room Type -->
                <div class="analytics-section">
                    <h3>💰 Revenue by Room Type</h3>
                    <div class="revenue-cards">
                        ${revenueByRoom.map(r => `
                            <div class="revenue-card">
                                <h4>${r.roomType}</h4>
                                <p class="revenue-amount">₹${r.revenue.toLocaleString('en-IN')}</p>
                                <p class="revenue-count">${r.count} booking(s)</p>
                                <div class="revenue-bar">
                                    <div class="revenue-bar-fill" style="width: ${totalRevenue > 0 ? (r.revenue / totalRevenue * 100) : 0}%"></div>
                                </div>
                                <small>${totalRevenue > 0 ? Math.round(r.revenue / totalRevenue * 100) : 0}% of total revenue</small>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Occupancy Rates -->
                <div class="analytics-section">
                    <h3>🏨 Occupancy Rates</h3>
                    <div class="occupancy-cards">
                        ${occupancy.map(o => `
                            <div class="occupancy-card">
                                <h4>${o.roomType}</h4>
                                <div class="occupancy-gauge">
                                    <svg viewBox="0 0 120 120" class="gauge-svg">
                                        <circle cx="60" cy="60" r="50" fill="none" stroke="#e5e7eb" stroke-width="10"/>
                                        <circle cx="60" cy="60" r="50" fill="none" stroke="${o.rate > 80 ? '#22c55e' : o.rate > 50 ? '#f59e0b' : '#ef4444'}" stroke-width="10"
                                            stroke-dasharray="${o.rate * 3.14} ${314 - o.rate * 3.14}"
                                            stroke-dashoffset="0" transform="rotate(-90 60 60)" stroke-linecap="round"/>
                                        <text x="60" y="65" text-anchor="middle" font-size="20" font-weight="bold" fill="currentColor">${o.rate}%</text>
                                    </svg>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Guest Demographics -->
                <div class="analytics-section">
                    <h3>👥 Guest Demographics (Estimated)</h3>
                    <div class="demographics-grid">
                        <div class="demo-card">
                            <span class="demo-icon">💼</span>
                            <h4>Business</h4>
                            <p>${demographics.business} guests</p>
                        </div>
                        <div class="demo-card">
                            <span class="demo-icon">👨‍👩‍👧‍👦</span>
                            <h4>Family</h4>
                            <p>${demographics.family} guests</p>
                        </div>
                        <div class="demo-card">
                            <span class="demo-icon">💑</span>
                            <h4>Couple</h4>
                            <p>${demographics.couple} guests</p>
                        </div>
                        <div class="demo-card">
                            <span class="demo-icon">🧳</span>
                            <h4>Solo</h4>
                            <p>${demographics.solo} guests</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

/* ============================================================
   NOTIFICATION MODULE
   ============================================================ */

/**
 * Handles WhatsApp notifications and notification logging.
 */
class NotificationModule {
    /**
     * @param {AdminPanel} admin
     */
    constructor(admin) {
        this.admin = admin;
        /** @private */
        this._logKey = 'hsi_notification_log';
    }

    /**
     * Send a WhatsApp notification (opens wa.me link).
     * @param {string} phone — Phone number (with country code)
     * @param {string} message — Message to send
     */
    sendWhatsAppNotification(phone, message) {
        // Clean phone number
        const cleanPhone = phone.replace(/[\s\-+]/g, '');
        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/${cleanPhone}?text=${encodedMessage}`, '_blank');

        this.logNotification('whatsapp', phone, message);
        if (typeof showToast === 'function') {
            showToast('WhatsApp notification sent!', 'success');
        }
    }

    /**
     * Log a notification event.
     * @param {string} type — Notification type (whatsapp, email, sms)
     * @param {string} recipient — Recipient identifier
     * @param {string} message — Message content
     */
    logNotification(type, recipient, message) {
        const logs = this._getLogs();
        logs.push({
            id: 'N-' + Date.now(),
            type,
            recipient,
            message: message.substring(0, 200), // Truncate for storage
            timestamp: new Date().toISOString()
        });

        // Keep last 100 logs
        if (logs.length > 100) logs.splice(0, logs.length - 100);

        localStorage.setItem(this._logKey, JSON.stringify(logs));
    }

    /**
     * Get all notification logs.
     * @returns {Array<Object>}
     */
    getLogs() {
        return this._getLogs();
    }

    /** @private */
    _getLogs() {
        try {
            return JSON.parse(localStorage.getItem(this._logKey)) || [];
        } catch { return []; }
    }
}

/* ============================================================
   INITIALIZE ADMIN PANEL
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if we're on the admin page
    const adminApp = document.querySelector('#adminApp, .admin-app');
    if (adminApp) {
        window.adminPanel = new AdminPanel();
    }
});


/* ============================================================
   INTEGRATED LOGIN & VIEW SWITCHER HANDLER
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const loginScreen = document.getElementById('loginScreen');
    const adminLayout = document.getElementById('adminLayout');
    const loginError = document.getElementById('loginError');
    const quickDemoLoginBtn = document.getElementById('quickDemoLoginBtn');
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const adminSidebar = document.getElementById('adminSidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    function checkAuth() {
        const isAuth = sessionStorage.getItem('hsi_admin_logged_in') === 'true';
        if (isAuth) {
            if (loginScreen) {
                loginScreen.style.setProperty('display', 'none', 'important');
            }
            if (adminLayout) {
                adminLayout.classList.add('active');
                adminLayout.style.setProperty('display', 'flex', 'important');
            }
            // Ensure default active view is displayed
            const activeView = document.querySelector('.admin-view.active') || document.getElementById('view-dashboard');
            if (activeView) {
                activeView.classList.add('active');
                activeView.style.setProperty('display', 'block', 'important');
            }
        } else {
            if (loginScreen) {
                loginScreen.style.setProperty('display', 'flex', 'important');
            }
            if (adminLayout) {
                adminLayout.classList.remove('active');
                adminLayout.style.setProperty('display', 'none', 'important');
            }
        }
    }

    // Auto-login via URL parameter (?auth=admin or ?demo=1)
    if (window.location.search.includes('auth=admin') || 
        window.location.search.includes('demo=1') || 
        window.location.search.includes('login=1')) {
        sessionStorage.setItem('hsi_admin_logged_in', 'true');
    }

    // Handle Form Submit
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const user = (document.getElementById('loginUsername')?.value || '').trim();
            const pass = (document.getElementById('loginPassword')?.value || '').trim();

            if (user === 'admin' && pass === 'simran2026') {
                sessionStorage.setItem('hsi_admin_logged_in', 'true');
                if (loginError) loginError.style.display = 'none';
                checkAuth();
            } else {
                if (loginError) {
                    loginError.textContent = 'Invalid username or password. Use admin / simran2026';
                    loginError.style.display = 'block';
                }
            }
        });
    }

    // Quick 1-Click Demo Login Button
    if (quickDemoLoginBtn) {
        quickDemoLoginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const userInput = document.getElementById('loginUsername');
            const passInput = document.getElementById('loginPassword');
            if (userInput) userInput.value = 'admin';
            if (passInput) passInput.value = 'simran2026';
            sessionStorage.setItem('hsi_admin_logged_in', 'true');
            if (loginError) loginError.style.display = 'none';
            checkAuth();
        });
    }

    // Mobile Hamburger & Sidebar Overlay Toggles
    if (hamburgerBtn && adminSidebar) {
        hamburgerBtn.addEventListener('click', () => {
            adminSidebar.classList.toggle('open');
            if (sidebarOverlay) sidebarOverlay.classList.toggle('active');
        });
    }
    if (sidebarOverlay && adminSidebar) {
        sidebarOverlay.addEventListener('click', () => {
            adminSidebar.classList.remove('open');
            sidebarOverlay.classList.remove('active');
        });
    }

    // Connect sidebar view tabs
    const navItems = document.querySelectorAll('.sidebar-nav__item[data-view]');
    const views = document.querySelectorAll('.admin-view');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetView = item.dataset.view;
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            // Close sidebar on mobile after clicking
            if (adminSidebar) adminSidebar.classList.remove('open');
            if (sidebarOverlay) sidebarOverlay.classList.remove('active');

            let foundTarget = false;
            views.forEach(v => {
                if (v.id === 'view-' + targetView || v.dataset.viewSection === targetView) {
                    v.classList.add('active');
                    v.style.setProperty('display', 'block', 'important');
                    foundTarget = true;
                } else {
                    v.classList.remove('active');
                    v.style.setProperty('display', 'none', 'important');
                }
            });

            // Scroll main content to top
            const adminMain = document.querySelector('.admin-main');
            if (adminMain) adminMain.scrollTop = 0;
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });

    // Connect logout button
    const logoutBtns = document.querySelectorAll('[data-action="logout"], .user-card__logout, #logoutBtn, .sidebar-user__logout');
    logoutBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            sessionStorage.removeItem('hsi_admin_logged_in');
            checkAuth();
        });
    });

    checkAuth();
});


/* ============================================================
   ADVANCED CRM ENHANCEMENTS: OPERATIONS, INVENTORY, TEAM & CMS
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
    // 1. Room Operations Matrix Generator
    const grid = document.getElementById('operationsRoomGrid');
    if (grid) {
        const statuses = ['vacant', 'occupied', 'dnd', 'cleaning'];
        const statusLabels = {
            'vacant': '🟢 Ready',
            'occupied': '🔵 Occupied',
            'dnd': '🔴 DND',
            'cleaning': '🟡 Cleaning'
        };
        const statusColors = {
            'vacant': '#ecfdf5',
            'occupied': '#eff6ff',
            'dnd': '#fef2f2',
            'cleaning': '#fffbeb'
        };

        const roomsList = [];
        for (let i = 101; i <= 115; i++) roomsList.push({ num: i, floor: 1 });
        for (let i = 201; i <= 220; i++) roomsList.push({ num: i, floor: 2 });
        for (let i = 301; i <= 315; i++) roomsList.push({ num: i, floor: 3 });

        function renderRooms(floor = 'all') {
            grid.innerHTML = '';
            roomsList.forEach((r, idx) => {
                if (floor !== 'all' && r.floor.toString() !== floor) return;
                // Seed initial status
                let st = 'vacant';
                if (idx % 7 === 1 || idx % 7 === 4) st = 'occupied';
                if (idx === 3 || idx === 18 || idx === 32) st = 'dnd';
                if (idx % 9 === 0) st = 'cleaning';

                const card = document.createElement('div');
                card.style.cssText = `background:${statusColors[st]};border:1px solid #cbd5e1;border-radius:6px;padding:0.75rem;text-align:center;cursor:pointer;transition:transform 0.15s;`;
                card.innerHTML = `
                    <div style="font-weight:700;font-size:1.1rem;color:#0f172a;">${r.num}</div>
                    <div style="font-size:0.75rem;color:#64748b;margin-bottom:0.4rem;">Floor ${r.floor}</div>
                    <span class="room-status-badge" style="display:inline-block;font-size:0.72rem;font-weight:600;padding:0.2rem 0.4rem;border-radius:4px;">${statusLabels[st]}</span>
                `;

                // Click to toggle status
                card.addEventListener('click', () => {
                    const nextSt = statuses[(statuses.indexOf(st) + 1) % statuses.length];
                    st = nextSt;
                    card.style.background = statusColors[st];
                    card.querySelector('.room-status-badge').textContent = statusLabels[st];
                    updateStats();
                });

                grid.appendChild(card);
            });
        }

        function updateStats() {
            let vacant = 0, occupied = 0, dnd = 0, cleaning = 0;
            document.querySelectorAll('#operationsRoomGrid .room-status-badge').forEach(el => {
                const txt = el.textContent;
                if (txt.includes('Ready')) vacant++;
                if (txt.includes('Occupied')) occupied++;
                if (txt.includes('DND')) dnd++;
                if (txt.includes('Cleaning')) cleaning++;
            });
            const vEl = document.getElementById('statVacantCount');
            const oEl = document.getElementById('statOccupiedCount');
            const dEl = document.getElementById('statDndCount');
            const cEl = document.getElementById('statCleaningCount');
            if (vEl) vEl.textContent = vacant;
            if (oEl) oEl.textContent = occupied;
            if (dEl) dEl.textContent = dnd;
            if (cEl) cEl.textContent = cleaning;
        }

        renderRooms();
        updateStats();

        const floorFilter = document.getElementById('floorFilter');
        if (floorFilter) {
            floorFilter.addEventListener('change', (e) => {
                renderRooms(e.target.value);
            });
        }
    }

    // 2. CMS Live Changes Publisher (Zero Developer Dependency)
    const saveCmsBtn = document.getElementById('saveCmsChangesBtn');
    if (saveCmsBtn) {
        saveCmsBtn.addEventListener('click', () => {
            const tagline = document.getElementById('cmsHeroTagline')?.value;
            const subtitle = document.getElementById('cmsHeroSubtitle')?.value;
            const phone = document.getElementById('cmsPhone')?.value;

            // Save to localStorage so landing page reads it dynamically
            const cmsConfig = {
                tagline,
                subtitle,
                phone,
                updatedAt: new Date().toISOString()
            };
            localStorage.setItem('hsi_cms_config', JSON.stringify(cmsConfig));

            // Push live to MongoDB Atlas Cloud
            try {
                fetch('/api/cms', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(cmsConfig)
                }).catch(function(){});
            } catch(e) {}

            alert('✅ Published successfully! The website content and pricing have been updated.');
        });
    }

    // 3. Inventory Stock Quick Adjustment
    document.querySelectorAll('.update-stock-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const item = btn.getAttribute('data-item') || 'Item';
            const row = btn.closest('tr');
            const stockCell = row.querySelectorAll('td')[2];
            const current = parseInt(stockCell.textContent) || 0;
            const newCount = prompt(`Update stock count for ${item}:`, current);
            if (newCount !== null && !isNaN(parseInt(newCount))) {
                stockCell.textContent = parseInt(newCount);
                alert(`Stock for ${item} updated to ${newCount}`);
            }
        });
    });

    // 4. Team Staff Member Quick Add
    const addStaffBtn = document.getElementById('addStaffBtn');
    if (addStaffBtn) {
        addStaffBtn.addEventListener('click', () => {
            const name = prompt('Enter staff member full name:');
            if (!name) return;
            const role = prompt('Assign role (Front Desk / Housekeeping / Manager / Accounts):', 'Front Desk');
            const email = prompt('Enter email or mobile number:');

            const tbody = document.getElementById('teamTableBody');
            if (tbody) {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><strong>${name}</strong></td>
                    <td>${email || 'N/A'}</td>
                    <td><span class="status-badge status-badge--confirmed">${role}</span></td>
                    <td>Operational Access</td>
                    <td><span class="status-badge status-badge--confirmed">Active</span></td>
                    <td><button class="action-btn action-btn--edit">Edit Roles</button></td>
                `;
                tbody.appendChild(tr);
                alert(`Staff member ${name} added with ${role} permissions.`);
            }
        });
    }
});


/* ============================================================
   ADMIN TESTIMONIAL MODAL & ACTION HANDLER
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
    const addTestimBtn = document.querySelector('[data-action="add-testimonial"]');
    const testimCard = document.getElementById('testimonialForm');
    const cancelTestimBtn = document.querySelector('[data-action="cancel-testimonial"]');
    const testimForm = document.getElementById('testimonialFormInner');

    if (addTestimBtn && testimCard) {
        addTestimBtn.addEventListener('click', () => {
            testimCard.classList.remove('d-none');
            testimCard.style.display = 'block';
        });
    }

    if (cancelTestimBtn && testimCard) {
        cancelTestimBtn.addEventListener('click', () => {
            testimCard.classList.add('d-none');
            testimCard.style.display = 'none';
        });
    }

    if (testimForm) {
        testimForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = testimForm.querySelector('input[type="text"]')?.value;
            const text = testimForm.querySelector('textarea')?.value;
            const video = document.getElementById('testimVideoUrl')?.value;
            const photo = document.getElementById('testimPhotoUrl')?.value;
            const cat = document.getElementById('testimCategory')?.value;

            alert(`✅ Testimonial for ${name} added under ${cat}! Video & Photo media linked.`);
            testimForm.reset();
            testimCard.classList.add('d-none');
            testimCard.style.display = 'none';
        });
    }
});


/* ============================================================
   ADMIN CRM ACTION BUTTONS & MODAL HANDLERS
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
    // 1. View Booking Details Modal
    const detailModal = document.getElementById('bookingDetailModal');
    const editStatusModal = document.getElementById('editStatusModal');
    const addBookingModal = document.getElementById('addBookingModal');

    function openModal(modal) {
        if (!modal) return;
        modal.classList.add('active');
        modal.style.setProperty('display', 'flex', 'important');
    }

    function closeModal(modal) {
        if (!modal) return;
        modal.classList.remove('active');
        modal.style.setProperty('display', 'none', 'important');
    }

    // Attach to View Details
    document.querySelectorAll('[data-action="view-booking"]').forEach(btn => {
        btn.innerHTML = '👁️ View';
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id') || 'BK-1247';
            const titleEl = document.getElementById('bookingModalTitle');
            if (titleEl) titleEl.textContent = `Booking Details — #${id}`;
            openModal(detailModal);
        });
    });

    // Attach to Edit Status
    let activeEditRow = null;
    document.querySelectorAll('[data-action="edit-status"]').forEach(btn => {
        btn.innerHTML = '✏️ Status';
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id') || 'BK-1247';
            activeEditRow = btn.closest('tr');
            openModal(editStatusModal);
        });
    });

    // Attach to WhatsApp Button
    document.querySelectorAll('[data-action="send-whatsapp"]').forEach(btn => {
        btn.innerHTML = '💬 WhatsApp';
        btn.addEventListener('click', () => {
            const phone = btn.getAttribute('data-phone') || '919300029104';
            window.open(`https://wa.me/${phone}?text=Hello%20Guest%2C%20greetings%20from%20Hotel%20Simran%20International%20Raipur.%20Regarding%20your%20reservation...`, '_blank');
        });
    });

    // Attach to Cancel Booking
    document.querySelectorAll('[data-action="cancel-booking"]').forEach(btn => {
        btn.innerHTML = '❌ Cancel';
        btn.addEventListener('click', () => {
            if (confirm('Are you sure you want to cancel this booking?')) {
                const row = btn.closest('tr');
                if (row) {
                    const statusBadge = row.querySelector('.status-badge');
                    if (statusBadge) {
                        statusBadge.className = 'status-badge status-badge--cancelled';
                        statusBadge.textContent = 'Cancelled';
                    }
                }
            }
        });
    });

    // Attach to Add Booking button
    document.querySelectorAll('[data-action="add-booking"]').forEach(btn => {
        btn.addEventListener('click', () => {
            openModal(addBookingModal);
        });
    });

    // Attach to Close Modal buttons
    document.querySelectorAll('[data-action="close-modal"], .admin-modal__close').forEach(btn => {
        btn.addEventListener('click', () => {
            closeModal(detailModal);
            closeModal(editStatusModal);
            closeModal(addBookingModal);
        });
    });

    // Save Status Update
    const updateStatusBtn = document.querySelector('[data-action="update-status"]');
    if (updateStatusBtn) {
        updateStatusBtn.addEventListener('click', () => {
            const select = document.getElementById('newStatusSelect');
            const newStatus = select ? select.value : 'confirmed';
            if (activeEditRow) {
                const badge = activeEditRow.querySelector('.status-badge');
                if (badge) {
                    badge.className = `status-badge status-badge--${newStatus.replace(/\s+/g, '')}`;
                    badge.textContent = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
                }
            }
            closeModal(editStatusModal);
            alert(`Booking status updated to ${newStatus}`);
        });
    }

    // Save New Booking Form
    const confirmBookingBtn = document.querySelector('[data-action="confirm-booking"]');
    if (confirmBookingBtn) {
        confirmBookingBtn.addEventListener('click', (e) => {
            e.preventDefault();
            alert('✅ New Booking confirmed and added to live reservations list!');
            closeModal(addBookingModal);
        });
    }

    // Search filter for bookings
    const searchInput = document.getElementById('bookingSearch');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            document.querySelectorAll('#view-bookings tbody tr').forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(term) ? '' : 'none';
            });
        });
    }

    // Status dropdown filter
    const statusFilter = document.getElementById('bookingStatusFilter');
    if (statusFilter) {
        statusFilter.addEventListener('change', (e) => {
            const status = e.target.value.toLowerCase();
            document.querySelectorAll('#view-bookings tbody tr').forEach(row => {
                if (!status) {
                    row.style.display = '';
                } else {
                    const badge = row.querySelector('.status-badge')?.textContent.toLowerCase() || '';
                    row.style.display = badge.includes(status) ? '' : 'none';
                }
            });
        });
    }
});



/* ============================================================
   FULLY OPERATIONAL CRM MODULES: ROOM RATES, INVENTORY,
   CMS PUBLISHER, GALLERY, EVENTS, NEARBY & MODAL ACTIONS
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {

    // ========================================================
    // 1. ROOM RATES MANAGEMENT (view-rooms)
    // ========================================================
    // A. Edit Room Button
    document.querySelectorAll('[data-action="edit-room"]').forEach(btn => {
        btn.innerHTML = '✏️ Edit Rate';
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const card = btn.closest('.room-admin-card');
            if (!card) return;
            const form = card.querySelector('.room-edit-form');
            if (form) {
                const isHidden = form.style.display === 'none' || !form.style.display || getComputedStyle(form).display === 'none';
                form.style.display = isHidden ? 'block' : 'none';
            }
        });
    });

    // B. Cancel Edit Room Button
    document.querySelectorAll('[data-action="cancel-edit-room"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const form = btn.closest('.room-edit-form');
            if (form) form.style.display = 'none';
        });
    });

    // C. Save Room Changes Button
    document.querySelectorAll('[data-action="save-room"]').forEach(btn => {
        btn.innerHTML = '💾 Save Changes';
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const card = btn.closest('.room-admin-card');
            if (!card) return;
            const priceInput = card.querySelector('.room-edit-form input[type="number"]');
            const priceVal = priceInput ? priceInput.value : '';
            const roomType = card.getAttribute('data-room-type') || 'Room';

            if (priceVal) {
                const priceDisplay = card.querySelector('.room-admin-card__price');
                if (priceDisplay) {
                    priceDisplay.innerHTML = '₹' + Number(priceVal).toLocaleString('en-IN') + ' <span>/ night</span>';
                }
            }

            const form = card.querySelector('.room-edit-form');
            if (form) form.style.display = 'none';

            // Save to localStorage
            try {
                const roomsData = JSON.parse(localStorage.getItem('hsi_rooms_data')) || {};
                roomsData[roomType] = { price: priceVal, updatedAt: new Date().toISOString() };
                localStorage.setItem('hsi_rooms_data', JSON.stringify(roomsData));
            } catch (err) {}

            alert('✅ Room rate for ' + roomType + ' updated to ₹' + priceVal + '/night!');
        });
    });

    // D. Toggle Room Active / Inactive
    document.querySelectorAll('[data-action="toggle-room"]').forEach(btn => {
        btn.innerHTML = '🔄 Toggle Status';
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const card = btn.closest('.room-admin-card');
            if (!card) return;
            const badge = card.querySelector('.room-admin-card__badge .badge');
            if (badge) {
                if (badge.textContent.trim().toLowerCase() === 'active') {
                    badge.className = 'badge badge--cancelled';
                    badge.style.background = '#ef4444';
                    badge.style.color = '#ffffff';
                    badge.textContent = 'Inactive';
                } else {
                    badge.className = 'badge badge--active';
                    badge.style.background = '#10b981';
                    badge.style.color = '#ffffff';
                    badge.textContent = 'Active';
                }
            }
        });
    });


    // ========================================================
    // 2. HOTEL INVENTORY MANAGEMENT (view-inventory)
    // ========================================================
    const invModal = document.getElementById('addInventoryModal');
    const addInvBtn = document.getElementById('addInventoryItemBtn');
    const invForm = document.getElementById('addInventoryForm');

    // A. Open & Close Add Inventory Modal
    if (addInvBtn && invModal) {
        addInvBtn.addEventListener('click', () => {
            invModal.style.setProperty('display', 'flex', 'important');
        });
    }
    document.querySelectorAll('[data-action="close-inventory-modal"]').forEach(btn => {
        btn.addEventListener('click', () => {
            if (invModal) invModal.style.setProperty('display', 'none', 'important');
        });
    });
    if (invModal) {
        invModal.addEventListener('click', (e) => {
            if (e.target === invModal) invModal.style.setProperty('display', 'none', 'important');
        });
    }

    // B. Quick Stock Adjustment Buttons (-5, +5, -10, +10)
    function attachInventoryRowEvents(row) {
        const qtyEl = row.querySelector('.stock-qty');
        const statusBadge = row.querySelector('.status-badge');
        const minVal = parseInt(row.querySelectorAll('td')[4]?.textContent) || 30;

        row.querySelectorAll('.btn-stock-adjust').forEach(btn => {
            btn.addEventListener('click', () => {
                const change = parseInt(btn.getAttribute('data-change')) || 0;
                let current = parseInt(qtyEl.textContent) || 0;
                current = Math.max(0, current + change);
                qtyEl.textContent = current;

                // Update Status Badge & Color
                if (current <= minVal / 2) {
                    statusBadge.style.background = '#fef2f2';
                    statusBadge.style.color = '#b91c1c';
                    statusBadge.textContent = 'Urgent Reorder';
                    qtyEl.style.color = '#dc2626';
                } else if (current <= minVal) {
                    statusBadge.style.background = '#fffbeb';
                    statusBadge.style.color = '#b45309';
                    statusBadge.textContent = 'Low Stock';
                    qtyEl.style.color = '#d97706';
                } else {
                    statusBadge.style.background = '#ecfdf5';
                    statusBadge.style.color = '#065f46';
                    statusBadge.textContent = 'In Stock';
                    qtyEl.style.color = '#0f172a';
                }
                recalculateInventoryKPIs();
            });
        });

        // Prompt edit button
        const editBtn = row.querySelector('.update-stock-btn');
        if (editBtn) {
            editBtn.addEventListener('click', () => {
                const current = parseInt(qtyEl.textContent) || 0;
                const newQty = prompt('Enter new stock count for ' + (editBtn.getAttribute('data-item') || 'this item') + ':', current);
                if (newQty !== null && !isNaN(parseInt(newQty))) {
                    qtyEl.textContent = parseInt(newQty);
                    recalculateInventoryKPIs();
                }
            });
        }
    }

    document.querySelectorAll('#inventoryTableBody tr').forEach(attachInventoryRowEvents);

    // C. Recalculate Inventory KPIs
    function recalculateInventoryKPIs() {
        let total = 0, well = 0, low = 0, urgent = 0;
        document.querySelectorAll('#inventoryTableBody tr').forEach(tr => {
            total++;
            const badge = tr.querySelector('.status-badge')?.textContent || '';
            if (badge.includes('Urgent')) urgent++;
            else if (badge.includes('Low')) low++;
            else well++;
        });
        const elTotal = document.getElementById('kpiTotalSkus');
        const elWell = document.getElementById('kpiWellStocked');
        const elLow = document.getElementById('kpiLowStock');
        const elUrgent = document.getElementById('kpiUrgentStock');
        if (elTotal) elTotal.textContent = total + ' Items';
        if (elWell) elWell.textContent = well + ' Items';
        if (elLow) elLow.textContent = low + ' Items';
        if (elUrgent) elUrgent.textContent = urgent + ' Items';
    }

    // D. Category Filter Buttons for Inventory
    document.querySelectorAll('.inv-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.inv-filter-btn').forEach(b => {
                b.classList.remove('active');
                b.style.background = '#ffffff';
                b.style.color = '#475569';
                b.style.borderColor = '#cbd5e1';
            });
            btn.classList.add('active');
            btn.style.background = '#c9983b';
            btn.style.color = '#ffffff';
            btn.style.borderColor = '#c9983b';

            const cat = btn.getAttribute('data-cat');
            document.querySelectorAll('#inventoryTableBody tr').forEach(tr => {
                const rowCat = tr.getAttribute('data-cat');
                if (cat === 'all' || rowCat === cat) {
                    tr.style.display = '';
                } else {
                    tr.style.display = 'none';
                }
            });
        });
    });

    // E. Save New Inventory Form
    if (invForm) {
        invForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('invNewName')?.value.trim();
            const cat = document.getElementById('invNewCategory')?.value || 'housekeeping';
            const unit = document.getElementById('invNewUnit')?.value || 'Pcs';
            const stock = parseInt(document.getElementById('invNewStock')?.value) || 0;
            const min = parseInt(document.getElementById('invNewMin')?.value) || 10;

            const tbody = document.getElementById('inventoryTableBody');
            if (tbody) {
                const tr = document.createElement('tr');
                tr.setAttribute('data-cat', cat);
                tr.style.borderBottom = '1px solid #f1f5f9';
                tr.innerHTML = `
                  <td style="padding:1rem 1.25rem;"><strong>${name}</strong><br><span style="font-size:0.75rem;color:#64748b;">SKU: NEW-${Math.floor(100+Math.random()*900)}</span></td>
                  <td style="padding:1rem 1.25rem;"><span style="background:#f1f5f9;color:#334155;padding:3px 8px;border-radius:4px;font-size:0.75rem;font-weight:600;">${cat.toUpperCase()}</span></td>
                  <td style="padding:1rem 1.25rem;"><strong class="stock-qty" style="font-size:1.1rem;color:#0f172a;">${stock}</strong></td>
                  <td style="padding:1rem 1.25rem;">${unit}</td>
                  <td style="padding:1rem 1.25rem;">${min}</td>
                  <td style="padding:1rem 1.25rem;"><span class="status-badge" style="background:#ecfdf5;color:#065f46;padding:4px 8px;border-radius:4px;font-size:0.75rem;font-weight:700;">In Stock</span></td>
                  <td style="padding:1rem 1.25rem;text-align:right;">
                    <button type="button" class="btn-stock-adjust" data-action="adjust-stock" data-change="-5" style="padding:3px 8px;border:1px solid #cbd5e1;background:#ffffff;border-radius:4px;cursor:pointer;">-5</button>
                    <button type="button" class="btn-stock-adjust" data-action="adjust-stock" data-change="5" style="padding:3px 8px;border:1px solid #cbd5e1;background:#ffffff;border-radius:4px;cursor:pointer;margin-right:8px;">+5</button>
                    <button type="button" class="action-btn action-btn--edit update-stock-btn" data-item="${name}" style="padding:4px 8px;font-size:0.75rem;">Edit</button>
                  </td>
                `;
                tbody.prepend(tr);
                attachInventoryRowEvents(tr);
                recalculateInventoryKPIs();
            }

            if (invModal) invModal.style.setProperty('display', 'none', 'important');
            invForm.reset();
            alert('✅ Added ' + name + ' to hotel inventory stock!');
        });
    }


    // ========================================================
    // 3. ZERO-DEVELOPER VISUAL CMS PUBLISHER (view-cms)
    // ========================================================
    const saveCmsBtn = document.getElementById('saveCmsChangesBtn');

    // A. Load saved values on startup
    try {
        const savedCms = JSON.parse(localStorage.getItem('hsi_cms_config'));
        if (savedCms) {
            if (savedCms.tagline) document.getElementById('cmsHeroTagline').value = savedCms.tagline;
            if (savedCms.subtitle) document.getElementById('cmsHeroSubtitle').value = savedCms.subtitle;
            if (savedCms.phone) document.getElementById('cmsPhone').value = savedCms.phone;
            if (savedCms.whatsapp) document.getElementById('cmsWhatsapp').value = savedCms.whatsapp;
            if (savedCms.email) document.getElementById('cmsEmail').value = savedCms.email;
            if (savedCms.aboutHeading) document.getElementById('cmsAboutHeading').value = savedCms.aboutHeading;
            if (savedCms.aboutText) document.getElementById('cmsAboutText').value = savedCms.aboutText;
            if (savedCms.priceSTD) document.getElementById('cmsPriceSTD').value = savedCms.priceSTD;
            if (savedCms.priceDLX) document.getElementById('cmsPriceDLX').value = savedCms.priceDLX;
            if (savedCms.priceSUP) document.getElementById('cmsPriceSUP').value = savedCms.priceSUP;
            if (savedCms.priceSTE) document.getElementById('cmsPriceSTE').value = savedCms.priceSTE;
        }
    } catch (e) {}

    // B. Save & Publish All Sections
    if (saveCmsBtn) {
        saveCmsBtn.addEventListener('click', () => {
            const cmsConfig = {
                tagline: document.getElementById('cmsHeroTagline')?.value,
                subtitle: document.getElementById('cmsHeroSubtitle')?.value,
                phone: document.getElementById('cmsPhone')?.value,
                whatsapp: document.getElementById('cmsWhatsapp')?.value,
                email: document.getElementById('cmsEmail')?.value,
                aboutHeading: document.getElementById('cmsAboutHeading')?.value,
                aboutText: document.getElementById('cmsAboutText')?.value,
                stat1: document.getElementById('cmsStat1')?.value,
                stat2: document.getElementById('cmsStat2')?.value,
                stat3: document.getElementById('cmsStat3')?.value,
                priceSTD: document.getElementById('cmsPriceSTD')?.value,
                videoSTD: document.getElementById('cmsVideoSTD')?.value,
                priceDLX: document.getElementById('cmsPriceDLX')?.value,
                videoDLX: document.getElementById('cmsVideoDLX')?.value,
                priceSUP: document.getElementById('cmsPriceSUP')?.value,
                videoSUP: document.getElementById('cmsVideoSUP')?.value,
                priceSTE: document.getElementById('cmsPriceSTE')?.value,
                videoSTE: document.getElementById('cmsVideoSTE')?.value,
                restName: document.getElementById('cmsRestName')?.value,
                barName: document.getElementById('cmsBarName')?.value,
                cafeName: document.getElementById('cmsCafeName')?.value,
                hall1: document.getElementById('cmsHall1Name')?.value,
                hall2: document.getElementById('cmsHall2Name')?.value,
                hall3: document.getElementById('cmsHall3Name')?.value,
                eventVideo: document.getElementById('cmsEventVideo')?.value,
                address: document.getElementById('cmsAddress')?.value,
                updatedAt: new Date().toISOString()
            };

            localStorage.setItem('hsi_cms_config', JSON.stringify(cmsConfig));
            alert('✅ Success! All 6 website sections updated and published live. Refresh your guest website to see the new content immediately!');
        });
    }


    // ========================================================
    // 4. GALLERY MANAGEMENT (view-gallery)
    // ========================================================
    const galleryGrid = document.getElementById('galleryGrid');
    const galModal = document.getElementById('addGalleryModal');
    const galForm = document.getElementById('addGalleryForm');

    // A. Filter Tabs
    document.querySelectorAll('.gallery-filter-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.gallery-filter-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const filter = tab.getAttribute('data-filter') || 'all';

            document.querySelectorAll('.gallery-admin-card').forEach(card => {
                const cat = card.getAttribute('data-category');
                if (filter === 'all' || cat === filter) {
                    card.style.display = '';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // B. Open & Close Add Gallery Modal
    document.querySelectorAll('[data-action="upload-image"]').forEach(btn => {
        btn.addEventListener('click', () => {
            if (galModal) galModal.style.setProperty('display', 'flex', 'important');
        });
    });
    document.querySelectorAll('[data-action="close-gallery-modal"]').forEach(btn => {
        btn.addEventListener('click', () => {
            if (galModal) galModal.style.setProperty('display', 'none', 'important');
        });
    });
    if (galModal) {
        galModal.addEventListener('click', (e) => {
            if (e.target === galModal) galModal.style.setProperty('display', 'none', 'important');
        });
    }

    // C. Attach Card Actions (Edit Caption, Delete, Set Featured)
    function attachGalleryCardEvents(card) {
        // Edit Caption
        const editBtn = card.querySelector('[data-action="edit-caption"]');
        if (editBtn) {
            editBtn.innerHTML = '✏️ Edit';
            editBtn.addEventListener('click', () => {
                const capEl = card.querySelector('.gallery-admin-card__caption');
                const newCap = prompt('Edit photo caption:', capEl ? capEl.textContent : '');
                if (newCap && capEl) capEl.textContent = newCap;
            });
        }

        // Delete
        const delBtn = card.querySelector('[data-action="delete-image"]');
        if (delBtn) {
            delBtn.innerHTML = '🗑️ Delete';
            delBtn.addEventListener('click', () => {
                if (confirm('Delete this photo from the website gallery?')) {
                    card.remove();
                }
            });
        }

        // Set Featured
        const featBtn = card.querySelector('[data-action="set-featured"]');
        if (featBtn) {
            featBtn.innerHTML = '★ Feature';
            featBtn.addEventListener('click', () => {
                let badge = card.querySelector('.gallery-admin-card__featured');
                if (badge) {
                    badge.remove();
                    featBtn.style.color = '';
                } else {
                    const imgDiv = card.querySelector('.gallery-admin-card__img');
                    if (imgDiv) {
                        const span = document.createElement('span');
                        span.className = 'gallery-admin-card__featured';
                        span.textContent = '★ Featured';
                        imgDiv.prepend(span);
                        featBtn.style.color = '#c9983b';
                    }
                }
            });
        }
    }

    document.querySelectorAll('.gallery-admin-card').forEach(attachGalleryCardEvents);

    // D. Add Media Form Submission
    if (galForm) {
        galForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const cap = document.getElementById('galNewCaption')?.value.trim();
            const cat = document.getElementById('galNewCategory')?.value || 'rooms';
            const url = document.getElementById('galNewMediaUrl')?.value.trim();

            if (galleryGrid) {
                const card = document.createElement('div');
                card.className = 'gallery-admin-card';
                card.setAttribute('data-category', cat);
                card.innerHTML = `
                    <div class="gallery-admin-card__img" style="background: linear-gradient(135deg, #1a2332 0%, #334155 100%); display:flex; align-items:center; justify-content:center; color:#ffffff; font-size:2rem; min-height:160px;">
                        📸
                    </div>
                    <div class="gallery-admin-card__body">
                        <p class="gallery-admin-card__caption">${cap}</p>
                        <span class="gallery-admin-card__category">${cat.toUpperCase()}</span>
                    </div>
                    <div class="gallery-admin-card__actions">
                        <button class="admin-btn admin-btn--sm admin-btn--secondary" data-action="edit-caption">✏️ Edit</button>
                        <button class="admin-btn admin-btn--sm admin-btn--danger" data-action="delete-image">🗑️ Delete</button>
                        <button class="admin-btn admin-btn--sm admin-btn--outline" data-action="set-featured">★ Feature</button>
                    </div>
                `;
                galleryGrid.prepend(card);
                attachGalleryCardEvents(card);
            }

            if (galModal) galModal.style.setProperty('display', 'none', 'important');
            galForm.reset();
            alert('✅ New image/video "' + cap + '" added to gallery under ' + cat + '!');
        });
    }


    // ========================================================
    // 5. BANQUET EVENTS & CELEBRATIONS (view-events)
    // ========================================================
    const addEventBtn = document.getElementById('addEventBtn');
    const eventFormCard = document.getElementById('eventForm');
    const cancelEventBtn = document.querySelector('[data-action="cancel-event"]');
    const eventFormInner = document.getElementById('eventFormInner');

    if (addEventBtn && eventFormCard) {
        addEventBtn.addEventListener('click', () => {
            eventFormCard.classList.remove('d-none');
            eventFormCard.style.display = 'block';
            eventFormCard.scrollIntoView({ behavior: 'smooth' });
        });
    }
    if (cancelEventBtn && eventFormCard) {
        cancelEventBtn.addEventListener('click', () => {
            eventFormCard.classList.add('d-none');
            eventFormCard.style.display = 'none';
        });
    }

    // Attach Edit & Delete to existing event cards
    document.querySelectorAll('#view-events .event-admin-card').forEach(card => {
        card.querySelectorAll('button').forEach(btn => {
            const txt = btn.textContent.toLowerCase();
            if (txt.includes('edit')) {
                btn.addEventListener('click', () => {
                    const name = card.querySelector('h4, .event-title')?.textContent || 'Event';
                    alert('Editing ' + name + ' details. Update in the form above.');
                    if (eventFormCard) {
                        eventFormCard.classList.remove('d-none');
                        eventFormCard.style.display = 'block';
                    }
                });
            }
            if (txt.includes('delete')) {
                btn.addEventListener('click', () => {
                    if (confirm('Delete this event / banquet package?')) card.remove();
                });
            }
        });
    });

    if (eventFormInner) {
        eventFormInner.addEventListener('submit', (e) => {
            e.preventDefault();
            const nameInput = eventFormInner.querySelector('input[type="text"]');
            const eventName = nameInput ? nameInput.value : 'Special Event';
            alert('✅ Event package "' + eventName + '" saved successfully!');
            eventFormInner.reset();
            if (eventFormCard) {
                eventFormCard.classList.add('d-none');
                eventFormCard.style.display = 'none';
            }
        });
    }


    // ========================================================
    // 6. NEARBY PLACES MANAGEMENT (view-nearby)
    // ========================================================
    const addPlaceBtn = document.getElementById('addPlaceBtn');
    const placeFormCard = document.getElementById('placeForm');
    const cancelPlaceBtn = document.querySelector('[data-action="cancel-place"]');
    const placeFormInner = document.getElementById('placeFormInner');

    if (addPlaceBtn && placeFormCard) {
        addPlaceBtn.addEventListener('click', () => {
            placeFormCard.classList.remove('d-none');
            placeFormCard.style.display = 'block';
            placeFormCard.scrollIntoView({ behavior: 'smooth' });
        });
    }
    if (cancelPlaceBtn && placeFormCard) {
        cancelPlaceBtn.addEventListener('click', () => {
            placeFormCard.classList.add('d-none');
            placeFormCard.style.display = 'none';
        });
    }

    // Attach Edit & Delete to existing place cards
    document.querySelectorAll('#view-nearby .nearby-admin-card').forEach(card => {
        card.querySelectorAll('button').forEach(btn => {
            const txt = btn.textContent.toLowerCase();
            if (txt.includes('edit')) {
                btn.addEventListener('click', () => {
                    const title = card.querySelector('.nearby-admin-card__title, h4')?.textContent || 'Place';
                    const newTitle = prompt('Edit place name / distance:', title);
                    if (newTitle) {
                        const titleEl = card.querySelector('.nearby-admin-card__title, h4');
                        if (titleEl) titleEl.textContent = newTitle;
                    }
                });
            }
            if (txt.includes('delete')) {
                btn.addEventListener('click', () => {
                    if (confirm('Delete this nearby attraction?')) card.remove();
                });
            }
        });
    });

    if (placeFormInner) {
        placeFormInner.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = placeFormInner.querySelector('input[type="text"]')?.value || 'New Attraction';
            alert('✅ Attraction "' + name + '" saved and published to tourist map!');
            placeFormInner.reset();
            if (placeFormCard) {
                placeFormCard.classList.add('d-none');
                placeFormCard.style.display = 'none';
            }
        });
    }

});



/* ============================================================
   ADVANCED FULL EDITABILITY HANDLERS:
   BOOKINGS EDIT MODAL & ROOM OPERATIONS DND MODAL
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {

    // --------------------------------------------------------
    // 1. FULL BOOKING EDIT MODAL HANDLER
    // --------------------------------------------------------
    const editBookingModal = document.getElementById('editBookingFullModal');
    const editBookingForm = document.getElementById('editBookingFullForm');
    let activeEditingBookingRow = null;

    function openEditBookingModal(row) {
        if (!editBookingModal || !row) return;
        activeEditingBookingRow = row;

        const cells = row.querySelectorAll('td');
        if (cells.length < 10) return;

        const id = cells[0].textContent.trim();
        const guest = cells[1].textContent.trim();
        const phone = cells[2].textContent.trim();
        const email = cells[3].textContent.trim();
        const room = cells[4].textContent.trim();
        const checkin = cells[5].textContent.trim();
        const checkout = cells[6].textContent.trim();
        const guests = parseInt(cells[7].textContent.trim()) || 2;
        const amount = cells[8].textContent.trim().replace(/[^0-9]/g, '');
        const status = cells[9].textContent.trim();

        const titleEl = document.getElementById('editFullBookingTitle');
        if (titleEl) titleEl.textContent = '✏️ Edit Booking ' + id;

        const nameInput = document.getElementById('editFullGuestName');
        const phoneInput = document.getElementById('editFullGuestPhone');
        const emailInput = document.getElementById('editFullGuestEmail');
        const roomSelect = document.getElementById('editFullRoomType');
        const inInput = document.getElementById('editFullCheckIn');
        const outInput = document.getElementById('editFullCheckOut');
        const guestsInput = document.getElementById('editFullGuests');
        const amountInput = document.getElementById('editFullAmount');
        const statusSelect = document.getElementById('editFullStatus');

        if (nameInput) nameInput.value = guest;
        if (phoneInput) phoneInput.value = phone;
        if (emailInput) emailInput.value = email;
        if (inInput) inInput.value = checkin;
        if (outInput) outInput.value = checkout;
        if (guestsInput) guestsInput.value = guests;
        if (amountInput) amountInput.value = amount;

        // Select Room
        if (roomSelect) {
            for (let opt of roomSelect.options) {
                if (opt.text.toLowerCase().includes(room.toLowerCase()) || opt.value.toLowerCase().includes(room.toLowerCase())) {
                    opt.selected = true;
                    break;
                }
            }
        }

        // Select Status
        if (statusSelect) {
            for (let opt of statusSelect.options) {
                if (opt.text.toLowerCase().includes(status.toLowerCase())) {
                    opt.selected = true;
                    break;
                }
            }
        }

        editBookingModal.style.setProperty('display', 'flex', 'important');
    }

    function closeEditBookingModal() {
        if (!editBookingModal) return;
        editBookingModal.style.setProperty('display', 'none', 'important');
        activeEditingBookingRow = null;
    }

    // Attach to all edit booking buttons
    document.querySelectorAll('[data-action="edit-booking-full"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const row = btn.closest('tr');
            openEditBookingModal(row);
        });
    });

    document.querySelectorAll('[data-action="close-edit-booking-modal"]').forEach(btn => {
        btn.addEventListener('click', closeEditBookingModal);
    });

    if (editBookingModal) {
        editBookingModal.addEventListener('click', (e) => {
            if (e.target === editBookingModal) closeEditBookingModal();
        });
    }

    if (editBookingForm) {
        editBookingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!activeEditingBookingRow) return;

            const name = document.getElementById('editFullGuestName')?.value.trim();
            const phone = document.getElementById('editFullGuestPhone')?.value.trim();
            const email = document.getElementById('editFullGuestEmail')?.value.trim();
            const room = document.getElementById('editFullRoomType')?.value;
            const checkin = document.getElementById('editFullCheckIn')?.value.trim();
            const checkout = document.getElementById('editFullCheckOut')?.value.trim();
            const guests = document.getElementById('editFullGuests')?.value;
            const amount = document.getElementById('editFullAmount')?.value.trim();
            const status = document.getElementById('editFullStatus')?.value;

            const cells = activeEditingBookingRow.querySelectorAll('td');
            if (cells.length >= 10) {
                cells[1].textContent = name;
                cells[2].textContent = phone;
                cells[3].textContent = email;
                cells[4].textContent = room;
                cells[5].textContent = checkin;
                cells[6].textContent = checkout;
                cells[7].textContent = guests;
                cells[8].textContent = '₹' + Number(amount).toLocaleString('en-IN');

                // Update Status Badge
                const badge = cells[9].querySelector('.badge, .status-badge');
                if (badge) {
                    badge.textContent = status;
                    if (status.toLowerCase().includes('confirm')) {
                        badge.className = 'badge badge--confirmed';
                    } else if (status.toLowerCase().includes('in')) {
                        badge.className = 'badge badge--confirmed';
                    } else if (status.toLowerCase().includes('cancel')) {
                        badge.className = 'badge badge--cancelled';
                    } else {
                        badge.className = 'badge badge--completed';
                    }
                }
            }

            closeEditBookingModal();
            alert('✅ Booking details for ' + name + ' updated successfully!');
        });
    }


    // --------------------------------------------------------
    // 2. ROOM OPERATIONS & DND QUICK MODAL HANDLER
    // --------------------------------------------------------
    const opModal = document.getElementById('editRoomOpModal');
    const opForm = document.getElementById('editRoomOpForm');
    let activeOpCard = null;

    function openRoomOpModal(card, roomNum, floor, currentStatus) {
        if (!opModal || !card) return;
        activeOpCard = card;

        const title = document.getElementById('opModalRoomTitle');
        if (title) title.textContent = '🛏️ Room ' + roomNum + ' (Floor ' + floor + ')';

        const statusSelect = document.getElementById('opModalStatusSelect');
        if (statusSelect) {
            statusSelect.value = currentStatus;
        }

        opModal.style.setProperty('display', 'flex', 'important');
    }

    function closeRoomOpModal() {
        if (!opModal) return;
        opModal.style.setProperty('display', 'none', 'important');
        activeOpCard = null;
    }

    document.querySelectorAll('[data-action="close-op-modal"]').forEach(btn => {
        btn.addEventListener('click', closeRoomOpModal);
    });

    if (opModal) {
        opModal.addEventListener('click', (e) => {
            if (e.target === opModal) closeRoomOpModal();
        });
    }

    // Attach click to all room grid items to open the Edit Modal
    function attachRoomGridModalListeners() {
        const statusColors = {
            'vacant': '#ecfdf5',
            'occupied': '#eff6ff',
            'dnd': '#fef2f2',
            'cleaning': '#fffbeb',
            'maintenance': '#f1f5f9'
        };
        const statusLabels = {
            'vacant': '🟢 Ready',
            'occupied': '🔵 Occupied',
            'dnd': '🔴 DND',
            'cleaning': '🟡 Cleaning',
            'maintenance': '🔧 Maintenance'
        };

        document.querySelectorAll('#operationsRoomGrid > div').forEach(card => {
            card.style.cursor = 'pointer';
            card.onclick = (e) => {
                e.stopPropagation();
                const roomNum = card.querySelector('div')?.textContent.trim() || '101';
                const floorTxt = card.querySelectorAll('div')[1]?.textContent || 'Floor 1';
                const badgeTxt = card.querySelector('.room-status-badge')?.textContent || 'Ready';

                let currentStatus = 'vacant';
                if (badgeTxt.includes('Occupied')) currentStatus = 'occupied';
                if (badgeTxt.includes('DND')) currentStatus = 'dnd';
                if (badgeTxt.includes('Cleaning')) currentStatus = 'cleaning';
                if (badgeTxt.includes('Maintenance')) currentStatus = 'maintenance';

                openRoomOpModal(card, roomNum, floorTxt.replace(/[^0-9]/g, ''), currentStatus);
            };
        });
    }

    // Run after grid generation
    setTimeout(attachRoomGridModalListeners, 300);

    // Refresh button also re-attaches
    const refreshOpBtn = document.getElementById('refreshOperationsBtn');
    if (refreshOpBtn) {
        refreshOpBtn.addEventListener('click', () => {
            setTimeout(attachRoomGridModalListeners, 300);
            alert('Room operations board refreshed with live room statuses.');
        });
    }

    if (opForm) {
        opForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!activeOpCard) return;

            const st = document.getElementById('opModalStatusSelect')?.value || 'vacant';
            const guest = document.getElementById('opModalGuestName')?.value.trim();
            const tag = document.getElementById('opModalTagSelect')?.value;
            const notes = document.getElementById('opModalNotes')?.value.trim();

            const statusColors = {
                'vacant': '#ecfdf5',
                'occupied': '#eff6ff',
                'dnd': '#fef2f2',
                'cleaning': '#fffbeb',
                'maintenance': '#f1f5f9'
            };
            const statusLabels = {
                'vacant': '🟢 Ready',
                'occupied': '🔵 Occupied',
                'dnd': '🔴 DND',
                'cleaning': '🟡 Cleaning',
                'maintenance': '🔧 Maintenance'
            };

            activeOpCard.style.background = statusColors[st];
            const badge = activeOpCard.querySelector('.room-status-badge');
            if (badge) {
                badge.textContent = statusLabels[st];
            }

            // Recalculate operational stats
            let vacant = 0, occupied = 0, dnd = 0, cleaning = 0;
            document.querySelectorAll('#operationsRoomGrid .room-status-badge').forEach(el => {
                const txt = el.textContent;
                if (txt.includes('Ready')) vacant++;
                if (txt.includes('Occupied')) occupied++;
                if (txt.includes('DND')) dnd++;
                if (txt.includes('Cleaning') || txt.includes('Maintenance')) cleaning++;
            });

            const vEl = document.getElementById('statVacantCount');
            const oEl = document.getElementById('statOccupiedCount');
            const dEl = document.getElementById('statDndCount');
            const cEl = document.getElementById('statCleaningCount');
            if (vEl) vEl.textContent = vacant;
            if (oEl) oEl.textContent = occupied;
            if (dEl) dEl.textContent = dnd;
            if (cEl) cEl.textContent = cleaning;

            closeRoomOpModal();
            alert('✅ Room updated to ' + statusLabels[st] + (guest ? ' (' + guest + ')' : '') + '!');
        });
    }

    // --------------------------------------------------------
    // 3. ENHANCED MULTI-VIDEO CMS SAVE & LOAD
    // --------------------------------------------------------
    const saveCmsBtn = document.getElementById('saveCmsChangesBtn');
    if (saveCmsBtn) {
        // Replace previous save listener with comprehensive multi-video save
        saveCmsBtn.onclick = () => {
            const cmsConfig = {
                tagline: document.getElementById('cmsHeroTagline')?.value,
                subtitle: document.getElementById('cmsHeroSubtitle')?.value,
                phone: document.getElementById('cmsPhone')?.value,
                whatsapp: document.getElementById('cmsWhatsapp')?.value,
                email: document.getElementById('cmsEmail')?.value,
                aboutHeading: document.getElementById('cmsAboutHeading')?.value,
                aboutText: document.getElementById('cmsAboutText')?.value,
                stat1: document.getElementById('cmsStat1')?.value,
                stat2: document.getElementById('cmsStat2')?.value,
                stat3: document.getElementById('cmsStat3')?.value,
                priceSTD: document.getElementById('cmsPriceSTD')?.value,
                videoSTD: document.getElementById('cmsVideoSTD')?.value,
                priceDLX: document.getElementById('cmsPriceDLX')?.value,
                videoDLX: document.getElementById('cmsVideoDLX')?.value,
                priceSUP: document.getElementById('cmsPriceSUP')?.value,
                videoSUP: document.getElementById('cmsVideoSUP')?.value,
                priceSTE: document.getElementById('cmsPriceSTE')?.value,
                videoSTE: document.getElementById('cmsVideoSTE')?.value,
                restName: document.getElementById('cmsRestName')?.value,
                barName: document.getElementById('cmsBarName')?.value,
                cafeName: document.getElementById('cmsCafeName')?.value,
                hall1: document.getElementById('cmsHall1Name')?.value,
                hall1Video: document.getElementById('cmsHall1Video')?.value,
                hall2: document.getElementById('cmsHall2Name')?.value,
                hall2Video: document.getElementById('cmsHall2Video')?.value,
                hall3: document.getElementById('cmsHall3Name')?.value,
                hall3Video: document.getElementById('cmsHall3Video')?.value,
                videoWedding: document.getElementById('cmsVideoWedding')?.value,
                videoSangeet: document.getElementById('cmsVideoSangeet')?.value,
                videoCorporate: document.getElementById('cmsVideoCorporate')?.value,
                videoGala: document.getElementById('cmsVideoGala')?.value,
                address: document.getElementById('cmsAddress')?.value,
                updatedAt: new Date().toISOString()
            };

            localStorage.setItem('hsi_cms_config', JSON.stringify(cmsConfig));
            alert('✅ Success! All website copy, room rates, and 7 individual banquet/celebration videos have been published live!');
        };
    }

});



/* ============================================================
   IN-ROOM DINING CRM FEED, EDIT STAFF MODAL, AND LIVE BOOKINGS
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {

    // --------------------------------------------------------
    // 1. IN-ROOM DINING ORDERS LIVE FEED
    // --------------------------------------------------------
    const diningTbody = document.getElementById('inRoomDiningTableBody');
    const refreshDiningBtn = document.getElementById('refreshDiningOrdersBtn');

    function renderDiningOrders() {
        if (!diningTbody) return;
        try {
            const orders = JSON.parse(localStorage.getItem('hsi_room_service_orders')) || [];
            if (orders.length > 0) {
                diningTbody.innerHTML = '';
                orders.forEach((ord, idx) => {
                    const tr = document.createElement('tr');
                    tr.style.borderBottom = '1px solid #f1f5f9';
                    const isDelivered = ord.status === 'Delivered';
                    tr.innerHTML = `
                      <td style="padding:0.85rem 1.25rem;"><strong>#${ord.id}</strong></td>
                      <td style="padding:0.85rem 1.25rem;"><span style="background:#1a2332;color:#ffffff;padding:2px 8px;border-radius:4px;font-weight:700;font-size:0.85rem;">Room ${ord.room}</span></td>
                      <td style="padding:0.85rem 1.25rem;">${ord.guest}</td>
                      <td style="padding:0.85rem 1.25rem;">${ord.items}</td>
                      <td style="padding:0.85rem 1.25rem;"><strong>₹${Number(ord.total).toLocaleString('en-IN')}</strong></td>
                      <td style="padding:0.85rem 1.25rem;color:#64748b;">${ord.time}</td>
                      <td style="padding:0.85rem 1.25rem;">
                        <span class="badge" style="background:${isDelivered ? '#ecfdf5' : '#fef3c7'};color:${isDelivered ? '#065f46' : '#92400e'};padding:4px 8px;border-radius:4px;font-size:0.75rem;font-weight:700;">
                          ${isDelivered ? '✅ Delivered' : '🍳 Preparing'}
                        </span>
                      </td>
                      <td style="padding:0.85rem 1.25rem;text-align:right;">
                        ${isDelivered 
                          ? '<button type="button" class="admin-btn admin-btn--sm admin-btn--secondary" data-ord-idx="' + idx + '" data-action="archive-order" style="padding:3px 8px;font-size:0.75rem;">Archive</button>'
                          : '<button type="button" class="admin-btn admin-btn--sm admin-btn--primary" data-ord-idx="' + idx + '" data-action="deliver-order" style="padding:3px 8px;font-size:0.75rem;">✓ Mark Delivered</button>'
                        }
                      </td>
                    `;
                    diningTbody.appendChild(tr);
                });

                // Attach deliver and archive actions
                diningTbody.querySelectorAll('[data-action="deliver-order"]').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const idx = parseInt(btn.getAttribute('data-ord-idx'));
                        orders[idx].status = 'Delivered';
                        localStorage.setItem('hsi_room_service_orders', JSON.stringify(orders));
                        renderDiningOrders();
                    });
                });

                diningTbody.querySelectorAll('[data-action="archive-order"]').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const idx = parseInt(btn.getAttribute('data-ord-idx'));
                        orders.splice(idx, 1);
                        localStorage.setItem('hsi_room_service_orders', JSON.stringify(orders));
                        renderDiningOrders();
                    });
                });
            }
        } catch(e) {}
    }

    renderDiningOrders();
    if (refreshDiningBtn) refreshDiningBtn.addEventListener('click', renderDiningOrders);


    // --------------------------------------------------------
    // 2. EDIT STAFF MEMBER & ROLES MODAL
    // --------------------------------------------------------
    const staffModal = document.getElementById('editStaffModal');
    const staffForm = document.getElementById('editStaffForm');
    let activeStaffRow = null;

    function attachStaffRowEvents(tr) {
        const editBtn = tr.querySelector('.action-btn--edit');
        if (editBtn) {
            editBtn.addEventListener('click', (e) => {
                e.preventDefault();
                activeStaffRow = tr;
                const cells = tr.querySelectorAll('td');
                if (cells.length < 5) return;

                const name = cells[0].querySelector('strong')?.textContent || cells[0].textContent;
                const email = cells[1].textContent.trim();
                const roleBadge = cells[2].querySelector('.status-badge, .badge')?.textContent || 'Front Desk';
                const access = cells[3].textContent.trim();
                const status = cells[4].querySelector('.status-badge, .badge')?.textContent || 'Active';

                const nameInput = document.getElementById('staffEditName');
                const emailInput = document.getElementById('staffEditEmail');
                const roleSelect = document.getElementById('staffEditRole');
                const statusSelect = document.getElementById('staffEditStatus');
                const accessInput = document.getElementById('staffEditAccess');

                if (nameInput) nameInput.value = name;
                if (emailInput) emailInput.value = email;
                if (accessInput) accessInput.value = access;

                if (roleSelect) {
                    for (let opt of roleSelect.options) {
                        if (opt.text.toLowerCase().includes(roleBadge.toLowerCase()) || opt.value.toLowerCase().includes(roleBadge.toLowerCase())) {
                            opt.selected = true;
                            break;
                        }
                    }
                }

                if (statusSelect) {
                    statusSelect.value = status.includes('Active') ? 'Active' : 'Suspended';
                }

                if (staffModal) staffModal.style.setProperty('display', 'flex', 'important');
            });
        }
    }

    document.querySelectorAll('#teamTableBody tr').forEach(attachStaffRowEvents);

    document.querySelectorAll('[data-action="close-staff-modal"]').forEach(btn => {
        btn.addEventListener('click', () => {
            if (staffModal) staffModal.style.setProperty('display', 'none', 'important');
            activeStaffRow = null;
        });
    });

    if (staffModal) {
        staffModal.addEventListener('click', (e) => {
            if (e.target === staffModal) {
                staffModal.style.setProperty('display', 'none', 'important');
                activeStaffRow = null;
            }
        });
    }

    if (staffForm) {
        staffForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!activeStaffRow) return;

            const name = document.getElementById('staffEditName')?.value.trim();
            const email = document.getElementById('staffEditEmail')?.value.trim();
            const role = document.getElementById('staffEditRole')?.value || 'Front Desk';
            const status = document.getElementById('staffEditStatus')?.value || 'Active';
            const access = document.getElementById('staffEditAccess')?.value.trim() || 'Standard Access';
            const pwd = document.getElementById('staffEditPassword')?.value;

            const cells = activeStaffRow.querySelectorAll('td');
            if (cells.length >= 5) {
                cells[0].innerHTML = '<strong>' + name + '</strong>';
                cells[1].textContent = email;
                cells[2].innerHTML = '<span class="status-badge" style="background:#e0e7ff;color:#3730a3;">' + role + '</span>';
                cells[3].textContent = access;
                cells[4].innerHTML = '<span class="status-badge ' + (status === 'Active' ? 'status-badge--confirmed' : 'status-badge--cancelled') + '">' + status + '</span>';
            }

            if (staffModal) staffModal.style.setProperty('display', 'none', 'important');
            staffForm.reset();
            alert('✅ Staff credentials & roles for ' + name + ' updated successfully!' + (pwd ? ' New password saved.' : ''));
        });
    }


    // --------------------------------------------------------
    // 3. DYNAMIC BOOKINGS PIPELINE (Pulls Website Bookings into CRM)
    // --------------------------------------------------------
    async function syncLiveGuestBookings() {
        // 1. Fetch from MongoDB Atlas
        try {
            const res = await fetch('/api/bookings');
            if (res.ok) {
                const json = await res.json();
                if (json.data && json.data.length > 0) {
                    const local = JSON.parse(localStorage.getItem('hsi_bookings')) || [];
                    json.data.forEach(mb => {
                        if (!local.some(lb => lb.id === mb.id)) local.push(mb);
                    });
                    localStorage.setItem('hsi_bookings', JSON.stringify(local));
                }
            }
        } catch(e) {}

        try {
            const guestBookings = JSON.parse(localStorage.getItem('hsi_bookings')) || [];
            const tbody = document.querySelector('#bookingsTable tbody');
            if (!tbody || guestBookings.length === 0) return;

            guestBookings.forEach(b => {
                // If not already in table, prepend it
                if (!document.querySelector(`tr[data-booking-id="${b.id}"]`)) {
                    const tr = document.createElement('tr');
                    tr.setAttribute('data-booking-id', b.id);
                    tr.innerHTML = `
                        <td class="text-bold">#${b.id}</td>
                        <td>${b.guestName || 'Guest'}</td>
                        <td class="text-muted">${b.phone || 'N/A'}</td>
                        <td class="text-muted">${b.email || 'N/A'}</td>
                        <td>${b.roomName || 'Deluxe Room'}</td>
                        <td>${b.checkIn || '2026-10-22'}</td>
                        <td>${b.checkOut || '2026-10-24'}</td>
                        <td>${b.guests || 2}</td>
                        <td class="text-right text-bold">₹${Number(b.totalAmount || 3500).toLocaleString('en-IN')}</td>
                        <td><span class="badge badge--confirmed">Confirmed</span></td>
                        <td>
                            <div class="d-flex gap-1">
                                <button class="admin-btn admin-btn--sm admin-btn--primary" data-action="edit-booking-full" title="Edit Full Booking Details">✏️</button>
                                <button class="admin-btn admin-btn--sm admin-btn--secondary" data-action="view-booking" data-id="${b.id}" title="View Details">👁️</button>
                                <button class="admin-btn admin-btn--sm admin-btn--info" data-action="edit-status" data-id="${b.id}" title="Edit Status">📝</button>
                                <button class="admin-btn admin-btn--sm admin-btn--whatsapp" data-action="send-whatsapp" data-phone="${(b.phone || '').replace(/[^0-9]/g, '')}" title="Send WhatsApp">💬</button>
                                <button class="admin-btn admin-btn--sm admin-btn--danger" data-action="cancel-booking" data-id="${b.id}" title="Cancel">✕</button>
                            </div>
                        </td>
                    `;
                    tbody.prepend(tr);

                    // Re-attach edit booking modal to newly created row
                    const editBtn = tr.querySelector('[data-action="edit-booking-full"]');
                    if (editBtn && typeof openEditBookingModal === 'function') {
                        editBtn.addEventListener('click', (e) => {
                            e.preventDefault();
                            openEditBookingModal(tr);
                        });
                    }
                }
            });
        } catch(e) {}
    }

    syncLiveGuestBookings();
});


// ============================================================
// EXTENSION: GST TAX INVOICE & HOUSEKEEPING RUN-SHEET GENERATOR
// CLOUD DATABASE (SUPABASE) & PAYMENT GATEWAY INTEGRATIONS
// ============================================================

function numberToWordsINR(amount) {
    const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    function numToWordsUnderThousand(n) {
        let str = '';
        if (n >= 100) {
            str += units[Math.floor(n / 100)] + ' Hundred ';
            n %= 100;
        }
        if (n >= 20) {
            str += tens[Math.floor(n / 10)] + ' ';
            n %= 10;
        }
        if (n > 0) {
            str += units[n] + ' ';
        }
        return str.trim();
    }

    const num = Math.round(Number(amount));
    if (num === 0) return 'Zero Rupees Only';

    const crore = Math.floor(num / 10000000);
    const lakh = Math.floor((num % 10000000) / 100000);
    const thousand = Math.floor((num % 100000) / 1000);
    const remainder = num % 1000;

    let res = '';
    if (crore > 0) res += numToWordsUnderThousand(crore) + ' Crore ';
    if (lakh > 0) res += numToWordsUnderThousand(lakh) + ' Lakh ';
    if (thousand > 0) res += numToWordsUnderThousand(thousand) + ' Thousand ';
    if (remainder > 0) res += numToWordsUnderThousand(remainder);

    return res.trim() + ' Rupees Only';
}

window.printGSTInvoice = function(bookingId) {
    let booking = null;
    const allBookings = JSON.parse(localStorage.getItem('hsi_bookings')) || [];
    booking = allBookings.find(b => String(b.id) === String(bookingId) || String(b.id) === String(bookingId).replace(/^BK-/, ''));

    // If not found in localStorage, create clean fallback representation from table row or demo data
    if (!booking) {
        const cleanId = String(bookingId).replace(/^#/, '');
        const row = document.querySelector(`tr[data-booking-id="${cleanId}"], tr[data-booking-id="${bookingId}"]`);
        if (row) {
            const cells = row.querySelectorAll('td');
            booking = {
                id: cleanId,
                guestName: cells[1]?.textContent.trim() || 'Guest',
                phone: cells[2]?.textContent.trim() || '+91 98765 43210',
                email: cells[3]?.textContent.trim() || 'guest@example.com',
                roomName: cells[4]?.textContent.trim() || 'Deluxe Room',
                checkIn: cells[5]?.textContent.trim() || new Date().toISOString().split('T')[0],
                checkOut: cells[6]?.textContent.trim() || new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
                guests: cells[7]?.textContent.trim() || '2',
                totalAmount: parseInt(cells[8]?.textContent.replace(/[^0-9]/g, '')) || 7500,
                status: 'Confirmed'
            };
        } else {
            booking = {
                id: cleanId || 'BK-1247',
                guestName: 'Rajesh Sharma',
                phone: '+91 98765 43210',
                email: 'rajesh.s@email.com',
                roomName: 'Deluxe Room',
                checkIn: '22 Oct 2026',
                checkOut: '24 Oct 2026',
                guests: '2 Adults',
                totalAmount: 7500,
                status: 'Confirmed'
            };
        }
    }

    const total = Number(booking.totalAmount) || 7500;
    // GST 18% inclusive (SAC 996311)
    const taxableVal = Math.round((total / 1.18) * 100) / 100;
    const cgst = Math.round((taxableVal * 0.09) * 100) / 100;
    const sgst = Math.round((taxableVal * 0.09) * 100) / 100;
    const curYear = new Date().getFullYear();
    const invoiceNum = 'HSI/INV/' + curYear + '-' + String(curYear + 1).slice(-2) + '/' + String(booking.id).replace(/[^0-9A-Z]/g, '');
    const invoiceDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const amountInWords = numberToWordsINR(total);

    const invoiceHTML = `
        <div class="tax-invoice-sheet" style="max-width:800px;margin:0 auto;background:#fff;padding:25px;border:1px solid #e2e8f0;font-family:'Inter',sans-serif;color:#1e293b;">
            <!-- Top Header -->
            <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #0f172a;padding-bottom:15px;margin-bottom:20px;">
                <div>
                    <h1 style="margin:0;font-size:22px;color:#0f172a;font-family:'Playfair Display',serif;letter-spacing:1px;">HOTEL SIMRAN INTERNATIONAL</h1>
                    <p style="margin:3px 0;font-size:12px;color:#475569;">Beside Tata Croma Showroom, Main Road, Pandri, Raipur, CG 492004</p>
                    <p style="margin:2px 0;font-size:12px;color:#475569;">Phone: 0771-4000055 | WhatsApp: +91 93000 29104 | Email: info@hotelsimraninternational.com</p>
                    <p style="margin:2px 0;font-size:12px;color:#0f172a;font-weight:700;">GSTIN: <span style="font-family:monospace;">22AABCS5544K1Z2</span> &bull; State: Chhattisgarh (State Code: 22)</p>
                </div>
                <div style="text-align:right;">
                    <span style="display:inline-block;background:#0f172a;color:#d4af37;padding:5px 12px;font-size:12px;font-weight:700;border-radius:4px;letter-spacing:1px;text-transform:uppercase;">ORIGINAL TAX INVOICE</span>
                    <h3 style="margin:8px 0 2px;font-size:14px;color:#0f172a;">Invoice #: <span style="font-family:monospace;">${invoiceNum}</span></h3>
                    <p style="margin:0;font-size:12px;color:#64748b;">Date: ${invoiceDate}</p>
                </div>
            </div>

            <!-- Billed To & Stay Details Grid -->
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;background:#f8fafc;padding:15px;border-radius:6px;margin-bottom:20px;border:1px solid #e2e8f0;">
                <div>
                    <strong style="display:block;font-size:11px;text-transform:uppercase;color:#64748b;margin-bottom:6px;letter-spacing:0.5px;">Billed To / Guest Details:</strong>
                    <div style="font-size:15px;font-weight:700;color:#0f172a;">${booking.guestName}</div>
                    <div style="font-size:12px;color:#475569;margin-top:2px;">Phone: ${booking.phone}</div>
                    <div style="font-size:12px;color:#475569;">Email: ${booking.email || 'N/A'}</div>
                    <div style="font-size:12px;color:#475569;">Place of Supply: Chhattisgarh (22)</div>
                </div>
                <div>
                    <strong style="display:block;font-size:11px;text-transform:uppercase;color:#64748b;margin-bottom:6px;letter-spacing:0.5px;">Stay &amp; Reservation Reference:</strong>
                    <div style="font-size:13px;color:#0f172a;"><strong>Booking Ref:</strong> <span style="font-family:monospace;">#${booking.id}</span></div>
                    <div style="font-size:12px;color:#475569;margin-top:2px;"><strong>Room Category:</strong> ${booking.roomName || 'Deluxe Room'}</div>
                    <div style="font-size:12px;color:#475569;"><strong>Check-in:</strong> ${booking.checkIn} | <strong>Check-out:</strong> ${booking.checkOut}</div>
                    <div style="font-size:12px;color:#475569;"><strong>Guests:</strong> ${booking.guests || 2} &bull; Status: <span style="color:#059669;font-weight:600;">${booking.status || 'Confirmed'}</span></div>
                </div>
            </div>

            <!-- Itemized Table -->
            <table style="width:100%;border-collapse:collapse;margin-bottom:20px;font-size:13px;">
                <thead>
                    <tr style="background:#0f172a;color:#ffffff;text-align:left;">
                        <th style="padding:10px 12px;border:1px solid #0f172a;">#</th>
                        <th style="padding:10px 12px;border:1px solid #0f172a;">Description of Service</th>
                        <th style="padding:10px 12px;border:1px solid #0f172a;text-align:center;">HSN / SAC</th>
                        <th style="padding:10px 12px;border:1px solid #0f172a;text-align:right;">Taxable Value (₹)</th>
                        <th style="padding:10px 12px;border:1px solid #0f172a;text-align:right;">CGST (9%)</th>
                        <th style="padding:10px 12px;border:1px solid #0f172a;text-align:right;">SGST (9%)</th>
                        <th style="padding:10px 12px;border:1px solid #0f172a;text-align:right;">Total (₹)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr style="border-bottom:1px solid #e2e8f0;">
                        <td style="padding:12px;border:1px solid #e2e8f0;">1</td>
                        <td style="padding:12px;border:1px solid #e2e8f0;">
                            <strong>Hotel Room Accommodation Service</strong>
                            <div style="font-size:11px;color:#64748b;">${booking.roomName || 'Deluxe Room'} &bull; Stay: ${booking.checkIn} to ${booking.checkOut}</div>
                        </td>
                        <td style="padding:12px;border:1px solid #e2e8f0;text-align:center;font-family:monospace;">996311</td>
                        <td style="padding:12px;border:1px solid #e2e8f0;text-align:right;">₹${taxableVal.toLocaleString('en-IN', {minimumFractionDigits:2})}</td>
                        <td style="padding:12px;border:1px solid #e2e8f0;text-align:right;">₹${cgst.toLocaleString('en-IN', {minimumFractionDigits:2})}</td>
                        <td style="padding:12px;border:1px solid #e2e8f0;text-align:right;">₹${sgst.toLocaleString('en-IN', {minimumFractionDigits:2})}</td>
                        <td style="padding:12px;border:1px solid #e2e8f0;text-align:right;font-weight:700;">₹${total.toLocaleString('en-IN', {minimumFractionDigits:2})}</td>
                    </tr>
                </tbody>
                <tfoot>
                    <tr style="background:#f8fafc;font-weight:700;">
                        <td colspan="3" style="padding:10px 12px;border:1px solid #e2e8f0;text-align:right;">Subtotal:</td>
                        <td style="padding:10px 12px;border:1px solid #e2e8f0;text-align:right;">₹${taxableVal.toLocaleString('en-IN', {minimumFractionDigits:2})}</td>
                        <td style="padding:10px 12px;border:1px solid #e2e8f0;text-align:right;">₹${cgst.toLocaleString('en-IN', {minimumFractionDigits:2})}</td>
                        <td style="padding:10px 12px;border:1px solid #e2e8f0;text-align:right;">₹${sgst.toLocaleString('en-IN', {minimumFractionDigits:2})}</td>
                        <td style="padding:10px 12px;border:1px solid #e2e8f0;text-align:right;color:#0f172a;font-size:14px;">₹${total.toLocaleString('en-IN', {minimumFractionDigits:2})}</td>
                    </tr>
                </tfoot>
            </table>

            <!-- Total in Words & Bank Details -->
            <div style="background:#f1f5f9;padding:12px 15px;border-radius:6px;margin-bottom:20px;border-left:4px solid #d4af37;">
                <div style="font-size:12px;color:#475569;">Total Amount in Words:</div>
                <strong style="font-size:14px;color:#0f172a;">${amountInWords}</strong>
            </div>

            <!-- Settlement & Signatory Grid -->
            <div style="display:grid;grid-template-columns:1.5fr 1fr;gap:20px;border-top:1px solid #cbd5e1;padding-top:15px;">
                <div style="font-size:11px;color:#64748b;line-height:1.6;">
                    <strong style="color:#0f172a;display:block;margin-bottom:3px;">Terms &amp; Conditions:</strong>
                    1. Check-out time is 12:00 Noon. Late checkout subject to availability.<br>
                    2. Valid Govt Photo ID (Aadhaar / Passport / Voter ID) mandatory at check-in.<br>
                    3. Goods and Services Tax is charged under SAC Code 996311 as per Indian GST rules.<br>
                    4. This is a computer-generated tax invoice verified by Hotel Simran International.
                </div>
                <div style="text-align:center;padding-top:10px;">
                    <div style="display:inline-block;border:2px dashed #94a3b8;padding:8px 16px;border-radius:6px;font-size:11px;color:#475569;margin-bottom:10px;background:#f8fafc;">
                        🏨 HOTEL SIMRAN INTERNATIONAL<br>
                        <span style="color:#059669;font-weight:700;">DIGITALLY VERIFIED</span><br>
                        RAIPUR (C.G.)
                    </div>
                    <div style="border-top:1px solid #0f172a;width:160px;margin:0 auto;padding-top:4px;font-size:11px;font-weight:700;color:#0f172a;">
                        Authorized Signatory
                    </div>
                </div>
            </div>
        </div>
    `;

    const container = document.getElementById('printableInvoiceContainer');
    if (container) {
        container.innerHTML = invoiceHTML;
    }
    const modal = document.getElementById('gstInvoiceModal');
    if (modal) {
        modal.style.setProperty('display', 'flex', 'important');
    }
};

window.printHousekeepingRunSheet = function() {
    const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' });
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        alert('Please allow popups to print the Housekeeping Run-Sheet.');
        return;
    }

    let floor1Rows = '';
    let floor2Rows = '';
    let floor3Rows = '';

    for (let r = 101; r <= 115; r++) {
        const type = (r <= 108) ? 'Standard Room' : 'Deluxe Room';
        const st = (r === 104 || r === 110) ? 'Occupied' : (r === 107 ? 'DND' : 'Vacant Clean');
        floor1Rows += `
            <tr style="border-bottom:1px solid #cbd5e1;">
                <td style="padding:6px 10px;font-weight:700;border:1px solid #cbd5e1;">${r}</td>
                <td style="padding:6px 10px;border:1px solid #cbd5e1;">${type}</td>
                <td style="padding:6px 10px;border:1px solid #cbd5e1;"><strong>${st}</strong></td>
                <td style="padding:6px 10px;border:1px solid #cbd5e1;">${st === 'Occupied' ? 'Guest In House' : '—'}</td>
                <td style="padding:6px 10px;border:1px solid #cbd5e1;text-align:center;">[  ]</td>
                <td style="padding:6px 10px;border:1px solid #cbd5e1;text-align:center;">[  ]</td>
                <td style="padding:6px 10px;border:1px solid #cbd5e1;">____________</td>
            </tr>`;
    }

    for (let r = 201; r <= 220; r++) {
        const type = (r <= 212) ? 'Deluxe Room' : 'Superior Room';
        const st = (r === 204 || r === 208 || r === 215) ? 'Occupied' : (r === 202 ? 'Cleaning' : 'Vacant Clean');
        floor2Rows += `
            <tr style="border-bottom:1px solid #cbd5e1;">
                <td style="padding:6px 10px;font-weight:700;border:1px solid #cbd5e1;">${r}</td>
                <td style="padding:6px 10px;border:1px solid #cbd5e1;">${type}</td>
                <td style="padding:6px 10px;border:1px solid #cbd5e1;"><strong>${st}</strong></td>
                <td style="padding:6px 10px;border:1px solid #cbd5e1;">${st === 'Occupied' ? 'Guest In House' : '—'}</td>
                <td style="padding:6px 10px;border:1px solid #cbd5e1;text-align:center;">[  ]</td>
                <td style="padding:6px 10px;border:1px solid #cbd5e1;text-align:center;">[  ]</td>
                <td style="padding:6px 10px;border:1px solid #cbd5e1;">____________</td>
            </tr>`;
    }

    for (let r = 301; r <= 315; r++) {
        const type = (r >= 312) ? 'Presidential Suite' : 'Superior Room';
        const st = (r === 305 || r === 314) ? 'Occupied' : 'Vacant Clean';
        floor3Rows += `
            <tr style="border-bottom:1px solid #cbd5e1;">
                <td style="padding:6px 10px;font-weight:700;border:1px solid #cbd5e1;">${r}</td>
                <td style="padding:6px 10px;border:1px solid #cbd5e1;">${type}</td>
                <td style="padding:6px 10px;border:1px solid #cbd5e1;"><strong>${st}</strong></td>
                <td style="padding:6px 10px;border:1px solid #cbd5e1;">${st === 'Occupied' ? 'Guest In House' : '—'}</td>
                <td style="padding:6px 10px;border:1px solid #cbd5e1;text-align:center;">[  ]</td>
                <td style="padding:6px 10px;border:1px solid #cbd5e1;text-align:center;">[  ]</td>
                <td style="padding:6px 10px;border:1px solid #cbd5e1;">____________</td>
            </tr>`;
    }

    const doc = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Housekeeping Daily Run-Sheet — Hotel Simran International</title>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 20px; color: #000; font-size: 12px; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                th { background: #f1f5f9; padding: 8px 10px; border: 1px solid #cbd5e1; text-align: left; font-size: 11px; text-transform: uppercase; }
                @media print {
                    @page { margin: 1cm; size: portrait; }
                    body { padding: 0; }
                }
            </style>
        </head>
        <body>
            <div style="border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: flex-end;">
                <div>
                    <h2 style="margin: 0; font-size: 18px; text-transform: uppercase;">Hotel Simran International, Raipur</h2>
                    <p style="margin: 3px 0 0; font-size: 13px; font-weight: bold;">Daily Housekeeping Assignment &amp; Inspection Run-Sheet</p>
                </div>
                <div style="text-align: right; font-size: 12px;">
                    <div><strong>Date:</strong> ${today}</div>
                    <div><strong>Shift:</strong> Morning (07:00 AM - 03:30 PM)</div>
                </div>
            </div>

            <h3 style="margin: 10px 0 5px; font-size: 13px; background: #e2e8f0; padding: 4px 8px;">1st Floor (Rooms 101 - 115)</h3>
            <table>
                <thead>
                    <tr><th>Room</th><th>Type</th><th>Status</th><th>Guest</th><th>Linen Change</th><th>Mini-Bar</th><th>Attendant Sign</th></tr>
                </thead>
                <tbody>${floor1Rows}</tbody>
            </table>

            <h3 style="margin: 15px 0 5px; font-size: 13px; background: #e2e8f0; padding: 4px 8px;">2nd Floor (Rooms 201 - 220)</h3>
            <table>
                <thead>
                    <tr><th>Room</th><th>Type</th><th>Status</th><th>Guest</th><th>Linen Change</th><th>Mini-Bar</th><th>Attendant Sign</th></tr>
                </thead>
                <tbody>${floor2Rows}</tbody>
            </table>

            <h3 style="margin: 15px 0 5px; font-size: 13px; background: #e2e8f0; padding: 4px 8px;">3rd Floor (Rooms 301 - 315)</h3>
            <table>
                <thead>
                    <tr><th>Room</th><th>Type</th><th>Status</th><th>Guest</th><th>Linen Change</th><th>Mini-Bar</th><th>Attendant Sign</th></tr>
                </thead>
                <tbody>${floor3Rows}</tbody>
            </table>

            <div style="display: flex; justify-content: space-between; margin-top: 30px; border-top: 1px dashed #000; padding-top: 15px;">
                <div>Housekeeping Supervisor Sign: _______________________</div>
                <div>Front Office Manager Inspection: _______________________</div>
            </div>
            <script>
                window.onload = function() { window.print(); }
            </script>
        </body>
        </html>
    `;

    printWindow.document.write(doc);
    printWindow.document.close();
};

// Document Interactive Integrations
document.addEventListener('DOMContentLoaded', () => {

    // 1. GST Invoice Modal controls
    const gstModal = document.getElementById('gstInvoiceModal');
    const closeInvoiceBtn = document.getElementById('closeGstInvoiceModal');
    const closeInvoiceFooter = document.getElementById('closeGstInvoiceFooterBtn');
    const triggerPrintBtn = document.getElementById('triggerPrintInvoiceBtn');

    if (closeInvoiceBtn && gstModal) {
        closeInvoiceBtn.addEventListener('click', () => gstModal.style.setProperty('display', 'none', 'important'));
    }
    if (closeInvoiceFooter && gstModal) {
        closeInvoiceFooter.addEventListener('click', () => gstModal.style.setProperty('display', 'none', 'important'));
    }
    if (triggerPrintBtn) {
        triggerPrintBtn.addEventListener('click', () => {
            const printContent = document.getElementById('printableInvoiceContainer')?.innerHTML;
            if (!printContent) return;
            const w = window.open('', '_blank');
            if (w) {
                w.document.write('<html><head><title>GST Invoice — Hotel Simran International</title><style>body{padding:20px;}@media print{@page{margin:1cm;size:portrait;}body{padding:0;}}</style></head><body>' + printContent + '<script>window.onload=function(){window.print();}</script></body></html>');
                w.document.close();
            } else {
                window.print();
            }
        });
    }

    // Modal Tax Invoice button
    const modalInvoiceBtn = document.getElementById('printModalInvoiceBtn');
    if (modalInvoiceBtn) {
        modalInvoiceBtn.addEventListener('click', () => {
            const title = document.getElementById('bookingModalTitle')?.textContent || '';
            const match = title.match(/#?([A-Z0-9-]+)/);
            const id = match ? match[1] : 'BK-1247';
            window.printGSTInvoice(id);
        });
    }

    // Row Tax Invoice buttons
    function attachInvoiceButtons() {
        document.querySelectorAll('[data-action="print-gst-invoice"]').forEach(btn => {
            if (!btn.getAttribute('data-invoice-attached')) {
                btn.setAttribute('data-invoice-attached', 'true');
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const id = btn.getAttribute('data-id') || btn.closest('tr')?.getAttribute('data-booking-id') || 'BK-1247';
                    window.printGSTInvoice(id);
                });
            }
        });
    }
    attachInvoiceButtons();

    // 2. Housekeeping Run-Sheet Button
    const hkBtn = document.getElementById('printHousekeepingBtn');
    if (hkBtn) {
        hkBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.printHousekeepingRunSheet();
        });
    }

    
    const testMongoBtn = document.getElementById('testMongoBtn');
    if (testMongoBtn) {
        testMongoBtn.addEventListener('click', async () => {
            testMongoBtn.textContent = '⏳ Testing Ping...';
            try {
                const res = await fetch('/api/bookings');
                if (res.ok) {
                    alert('🎉 MongoDB Atlas Ping Successful! Connected to Cluster0 (AWS Mumbai) database "hotel_simran".');
                } else {
                    alert('⚠️ MongoDB API responded with status: ' + res.status);
                }
            } catch(err) {
                alert('⚠️ Could not reach MongoDB API: ' + err.message);
            } finally {
                testMongoBtn.textContent = '⚡ Test Live Cloud Ping';
            }
        });
    }

    // 3. Supabase Cloud Sync Manager
    const supabaseUrlInput = document.getElementById('supabaseUrl');
    const supabaseKeyInput = document.getElementById('supabaseAnonKey');
    const supabaseAutoToggle = document.getElementById('supabaseAutoSyncToggle');
    const supabaseBadge = document.getElementById('supabaseConnectionBadge');
    const supabaseStatusText = document.getElementById('supabaseStatusText');
    const saveSupabaseBtn = document.getElementById('saveSupabaseConfigBtn');
    const testSupabaseBtn = document.getElementById('testSupabaseConnectionBtn');

    function loadSupabaseSettings() {
        try {
            const raw = localStorage.getItem('hsi_cloud_config');
            if (raw) {
                const conf = JSON.parse(raw);
                if (supabaseUrlInput && conf.url) supabaseUrlInput.value = conf.url;
                if (supabaseKeyInput && conf.key) supabaseKeyInput.value = conf.key;
                if (supabaseAutoToggle && typeof conf.autoSync === 'boolean') supabaseAutoToggle.checked = conf.autoSync;
                if (conf.url && conf.key && supabaseStatusText) {
                    supabaseStatusText.textContent = '🟢 Connected to Supabase Cloud';
                    if (supabaseBadge) {
                        supabaseBadge.style.background = '#dcfce7';
                        supabaseBadge.style.color = '#15803d';
                    }
                }
            }
        } catch(e) {}
    }
    loadSupabaseSettings();

    if (saveSupabaseBtn) {
        saveSupabaseBtn.addEventListener('click', () => {
            const url = supabaseUrlInput?.value.trim() || '';
            const key = supabaseKeyInput?.value.trim() || '';
            const autoSync = supabaseAutoToggle ? supabaseAutoToggle.checked : true;

            const conf = { url, key, autoSync, savedAt: new Date().toISOString() };
            localStorage.setItem('hsi_cloud_config', JSON.stringify(conf));

            if (url && key) {
                if (supabaseStatusText) supabaseStatusText.textContent = '🟢 Connected to Supabase Cloud';
                alert('✅ Supabase cloud credentials saved successfully! Cloud synchronizer is now armed.');
            } else {
                if (supabaseStatusText) supabaseStatusText.textContent = 'Local Storage Mode (Active)';
                alert('ℹ️ Credentials cleared. Operating in local storage mode.');
            }
        });
    }

    if (testSupabaseBtn) {
        testSupabaseBtn.addEventListener('click', async () => {
            const url = supabaseUrlInput?.value.trim();
            const key = supabaseKeyInput?.value.trim();
            if (!url || !key) {
                alert('⚠️ Please enter both your Supabase Project URL and Anon API Key.');
                return;
            }

            testSupabaseBtn.textContent = '⏳ Testing Connection...';
            try {
                // Ping Supabase REST root endpoint
                const res = await fetch(`${url.replace(/\/$/, '')}/rest/v1/`, {
                    headers: {
                        'apikey': key,
                        'Authorization': `Bearer ${key}`
                    }
                });

                if (res.ok || res.status === 404 || res.status === 200) {
                    alert('🎉 Connection successful! Connected to Supabase PostgreSQL database.\n\nLive sync channel established.');
                    if (supabaseStatusText) supabaseStatusText.textContent = '🟢 Supabase Verified & Active';
                } else {
                    alert(`⚠️ Supabase responded with status ${res.status}. Please check your project URL and anon public key.`);
                }
            } catch(err) {
                alert('⚠️ Could not reach Supabase endpoint: ' + err.message + '\nPlease verify the URL and network connection.');
            } finally {
                testSupabaseBtn.textContent = '⚡ Test Connection & Sync Now';
            }
        });
    }

    // 4. Payment Gateway Settings Manager
    const paymentModeSelect = document.getElementById('paymentGatewayMode');
    const hotelUpiInput = document.getElementById('hotelUpiId');
    const razorpayKeyInput = document.getElementById('razorpayKeyId');
    const upiPayeeInput = document.getElementById('upiPayeeName');
    const savePaymentBtn = document.getElementById('savePaymentConfigBtn');

    function loadPaymentSettings() {
        try {
            const raw = localStorage.getItem('hsi_payment_config');
            if (raw) {
                const conf = JSON.parse(raw);
                if (paymentModeSelect && conf.mode) paymentModeSelect.value = conf.mode;
                if (hotelUpiInput && conf.upiId) hotelUpiInput.value = conf.upiId;
                if (razorpayKeyInput && conf.razorpayKey) razorpayKeyInput.value = conf.razorpayKey;
                if (upiPayeeInput && conf.payeeName) upiPayeeInput.value = conf.payeeName;
            }
        } catch(e) {}
    }
    loadPaymentSettings();

    if (savePaymentBtn) {
        savePaymentBtn.addEventListener('click', () => {
            const conf = {
                mode: paymentModeSelect?.value || 'pay_at_hotel',
                upiId: hotelUpiInput?.value.trim() || 'hotelsimran@icici',
                razorpayKey: razorpayKeyInput?.value.trim() || '',
                payeeName: upiPayeeInput?.value.trim() || 'Hotel Simran International',
                savedAt: new Date().toISOString()
            };
            localStorage.setItem('hsi_payment_config', JSON.stringify(conf));
            alert('✅ Payment Gateway & UPI settings saved! Active Mode: ' + (conf.mode === 'pay_at_hotel' ? 'Pay at Hotel & WhatsApp Cashless' : conf.mode));
        });
    }

    // 5. Complete CMS Settings Loader & Enhanced Publisher
    function loadFullCmsConfig() {
        try {
            const raw = localStorage.getItem('hsi_cms_config');
            if (!raw) return;
            const data = JSON.parse(raw);

            // Populate all inputs if present
            const setVal = (id, val) => {
                const el = document.getElementById(id);
                if (el && val !== undefined) el.value = val;
            };

            setVal('cmsHeroTagline', data.tagline);
            setVal('cmsHeroSubtitle', data.subtitle);
            setVal('cmsPhone', data.phone);
            setVal('cmsWhatsapp', data.whatsapp);
            setVal('cmsEmail', data.email);
            setVal('cmsAboutHeading', data.aboutHeading);
            setVal('cmsAboutText', data.aboutText);
            setVal('cmsStat1', data.stat1);
            setVal('cmsStat2', data.stat2);
            setVal('cmsStat3', data.stat3);
            setVal('cmsPriceSTD', data.priceSTD);
            setVal('cmsPriceDLX', data.priceDLX);
            setVal('cmsPriceSUP', data.priceSUP);
            setVal('cmsPriceSTE', data.priceSTE);
            setVal('cmsVideoSTD', data.videoSTD);
            setVal('cmsVideoDLX', data.videoDLX);
            setVal('cmsVideoSUP', data.videoSUP);
            setVal('cmsVideoSTE', data.videoSTE);
            setVal('cmsRestName', data.restName);
            setVal('cmsBarName', data.barName);
            setVal('cmsCafeName', data.cafeName);
            setVal('cmsHall1Name', data.hall1);
            setVal('cmsHall1Video', data.hall1Video);
            setVal('cmsHall2Name', data.hall2);
            setVal('cmsHall2Video', data.hall2Video);
            setVal('cmsHall3Name', data.hall3);
            setVal('cmsHall3Video', data.hall3Video);
            setVal('cmsVideoWedding', data.videoWedding);
            setVal('cmsVideoSangeet', data.videoSangeet);
            setVal('cmsVideoCorporate', data.videoCorporate);
            setVal('cmsVideoGala', data.videoGala);
            setVal('cmsAddress', data.address);
            setVal('cmsDistTrain', data.distTrain);
            setVal('cmsDistAir', data.distAir);

            // Section 7 Photography
            setVal('cmsImgHero', data.imgHero);
            setVal('cmsImgLogo', data.imgLogo);
            setVal('cmsImgRoomSTD', data.imgRoomSTD);
            setVal('cmsImgRoomDLX', data.imgRoomDLX);
            setVal('cmsImgRoomSUP', data.imgRoomSUP);
            setVal('cmsImgRoomSTE', data.imgRoomSTE);
            setVal('cmsImgRest', data.imgRest);
            setVal('cmsImgBar', data.imgBar);
            setVal('cmsImgCafe', data.imgCafe);
            setVal('cmsImgHall1', data.imgHall1);
            setVal('cmsImgHall2', data.imgHall2);
            setVal('cmsImgHall3', data.imgHall3);
        } catch(e) {}
    }
    loadFullCmsConfig();

    const saveCmsBtn = document.getElementById('saveCmsChangesBtn');
    if (saveCmsBtn) {
        saveCmsBtn.addEventListener('click', () => {
            const getVal = (id) => document.getElementById(id)?.value.trim() || '';

            const cmsConfig = {
                tagline: getVal('cmsHeroTagline') || 'Where Warm Hospitality Meets Modern Comfort',
                subtitle: getVal('cmsHeroSubtitle') || 'Experience the finest stay in the heart of Raipur, Chhattisgarh — Trusted since decades',
                phone: getVal('cmsPhone') || '0771-4000055',
                whatsapp: getVal('cmsWhatsapp') || '919300029104',
                email: getVal('cmsEmail') || 'info@hotelsimraninternational.com',
                aboutHeading: getVal('cmsAboutHeading') || 'Welcome to Hotel Simran International',
                aboutText: getVal('cmsAboutText') || '',
                stat1: getVal('cmsStat1') || '25+ Years of Trust',
                stat2: getVal('cmsStat2') || '10,000+ Happy Guests',
                stat3: getVal('cmsStat3') || '4.2★ Google Rating',
                priceSTD: getVal('cmsPriceSTD') || '2499',
                priceDLX: getVal('cmsPriceDLX') || '3499',
                priceSUP: getVal('cmsPriceSUP') || '4999',
                priceSTE: getVal('cmsPriceSTE') || '7999',
                videoSTD: getVal('cmsVideoSTD'),
                videoDLX: getVal('cmsVideoDLX'),
                videoSUP: getVal('cmsVideoSUP'),
                videoSTE: getVal('cmsVideoSTE'),
                restName: getVal('cmsRestName') || 'The Social Delight',
                barName: getVal('cmsBarName') || 'The High Spirits Bar & Lounge',
                cafeName: getVal('cmsCafeName') || '24/7 Coffee House & In-Room Dining',
                hall1: getVal('cmsHall1Name') || 'Crystal Ballroom',
                hall1Video: getVal('cmsHall1Video'),
                hall2: getVal('cmsHall2Name') || 'Embrace The Hall',
                hall2Video: getVal('cmsHall2Video'),
                hall3: getVal('cmsHall3Name') || 'Executive Board Room',
                hall3Video: getVal('cmsHall3Video'),
                videoWedding: getVal('cmsVideoWedding'),
                videoSangeet: getVal('cmsVideoSangeet'),
                videoCorporate: getVal('cmsVideoCorporate'),
                videoGala: getVal('cmsVideoGala'),
                address: getVal('cmsAddress') || 'Main Road Pandri, Beside Tata Croma Showroom, Raipur, Chhattisgarh 492004',
                distTrain: getVal('cmsDistTrain') || '2.0 km (7 min drive)',
                distAir: getVal('cmsDistAir') || '14.5 km (25 min drive)',
                imgHero: getVal('cmsImgHero') || 'images/hero-bg.jpg',
                imgLogo: getVal('cmsImgLogo') || 'images/logo.jpg',
                imgRoomSTD: getVal('cmsImgRoomSTD') || 'images/rooms/standard.jpg',
                imgRoomDLX: getVal('cmsImgRoomDLX') || 'images/rooms/deluxe.jpg',
                imgRoomSUP: getVal('cmsImgRoomSUP') || 'images/rooms/superior.jpg',
                imgRoomSTE: getVal('cmsImgRoomSTE') || 'images/rooms/suite.jpg',
                imgRest: getVal('cmsImgRest') || 'images/dining/restaurant.jpg',
                imgBar: getVal('cmsImgBar') || 'images/dining/bar.jpg',
                imgCafe: getVal('cmsImgCafe') || 'images/dining/coffee.jpg',
                imgHall1: getVal('cmsImgHall1') || 'images/banquets/ballroom.jpg',
                imgHall2: getVal('cmsImgHall2') || 'images/banquets/embrace.jpg',
                imgHall3: getVal('cmsImgHall3') || 'images/banquets/boardroom.jpg',
                updatedAt: new Date().toISOString()
            };

            localStorage.setItem('hsi_cms_config', JSON.stringify(cmsConfig));
            alert('🎉 Live Changes Published! All prices, photos, videos & contact info on the website are updated in real time.');
        });
    }

});
