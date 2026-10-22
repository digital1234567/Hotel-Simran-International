/**
 * Hotel Simran International — Booking System
 * =============================================
 * Complete client-side booking engine with room management,
 * price calculation, multi-step booking flow, and localStorage
 * persistence. Integrates with WhatsApp for instant confirmation.
 *
 * @author Hotel Simran International Dev Team
 * @version 1.0.0
 */

/* ============================================================
   ROOM DATA
   ============================================================ */

/**
 * All room types offered by the hotel.
 * @type {Array<Object>}
 */
const ROOMS = [
    {
        id: 'STD',
        name: 'Standard Room',
        price: 2499,
        maxGuests: 2,
        totalRooms: 20,
        description: 'Comfortable and well-appointed room with modern amenities, ideal for business travellers and short stays. Features a cozy queen-size bed with premium linens.',
        amenities: ['Queen Bed', 'Free Wi-Fi', 'AC', 'LED TV', '24/7 Hot Water', 'Complimentary Breakfast', 'Wardrobe', 'Work Desk'],
        image: 'images/rooms/standard.jpg'
    },
    {
        id: 'DLX',
        name: 'Deluxe Room',
        price: 3499,
        maxGuests: 2,
        totalRooms: 15,
        description: 'Spacious room with city views and upgraded furnishings. Perfect for couples and discerning travellers seeking extra comfort with premium bath amenities.',
        amenities: ['King Bed', 'Free Wi-Fi', 'AC', '43" Smart TV', '24/7 Hot Water', 'Complimentary Breakfast', 'Mini Fridge', 'Wardrobe', 'Work Desk', 'Tea/Coffee Maker', 'City View'],
        image: 'images/rooms/deluxe.jpg'
    },
    {
        id: 'SUP',
        name: 'Superior Room',
        price: 4999,
        maxGuests: 3,
        totalRooms: 8,
        description: 'Premium room with extra living space, perfect for families or those seeking extra comfort. Includes a seating area with sofa and enhanced bathroom with bathtub.',
        amenities: ['King Bed + Sofa Bed', 'Free Wi-Fi', 'AC', '50" Smart TV', 'Bathtub & Shower', 'Complimentary Breakfast', 'Mini Bar', 'Wardrobe', 'Work Desk', 'Tea/Coffee Maker', 'City View', 'Seating Area', 'Premium Toiletries'],
        image: 'images/rooms/superior.jpg'
    },
    {
        id: 'STE',
        name: 'Suite',
        price: 7999,
        maxGuests: 4,
        totalRooms: 4,
        description: 'Our finest accommodation with a separate living room, bedroom, and luxury bathroom. The ultimate indulgence for VIP guests and special occasions.',
        amenities: ['King Bed + Twin Sofa Beds', 'Free Wi-Fi', 'AC', '55" Smart TV', 'Jacuzzi Bathtub', 'Complimentary Breakfast & Dinner', 'Full Mini Bar', 'Walk-in Wardrobe', 'Executive Desk', 'Espresso Machine', 'Panoramic City View', 'Living Room', 'Premium Toiletries', 'Bathrobe & Slippers', 'Complimentary Airport Transfer'],
        image: 'images/rooms/suite.jpg'
    }
];

/* ============================================================
   DATE UTILITIES
   ============================================================ */

/**
 * Format a date to "DD MMM YYYY" (e.g., "15 Oct 2026").
 * @param {Date|string} date
 * @returns {string}
 */
function formatDate(date) {
    const d = new Date(date);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                     'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

/**
 * Get the number of nights between two dates.
 * @param {Date|string} date1 — Check-in date
 * @param {Date|string} date2 — Check-out date
 * @returns {number}
 */
function getDateDiff(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2 - d1);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Validate that a date range is valid for booking.
 * @param {Date|string} checkIn
 * @param {Date|string} checkOut
 * @returns {boolean}
 */
function isValidDateRange(checkIn, checkOut) {
    if (!checkIn || !checkOut) return false;
    const ciDate = new Date(checkIn);
    const coDate = new Date(checkOut);
    ciDate.setHours(0, 0, 0, 0);
    coDate.setHours(0, 0, 0, 0);
    return coDate > ciDate;
}

/**
 * Format a date to YYYY-MM-DD for HTML input[type=date].
 * @param {Date} date
 * @returns {string}
 */
function toInputDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

/* ============================================================
   BOOKING MANAGER CLASS
   ============================================================ */

/**
 * Manages all booking operations — availability checks,
 * reservation CRUD, and price calculations.
 */
class BookingManager {
    /**
     * @param {string} [storageKey='hsi_bookings'] — localStorage key
     */
    constructor(storageKey = 'hsi_bookings') {
        /** @private */
        this.storageKey = storageKey;
        /** @type {Array<Object>} */
        this.rooms = ROOMS;
    }

    /* --------------------------------------------------------
       AVAILABILITY
       -------------------------------------------------------- */

    /**
     * Check room availability for the given dates and preferences.
     * Simulates a server call — uses random availability within
     * realistic bounds based on existing bookings.
     *
     * @param {string} checkIn  — YYYY-MM-DD
     * @param {string} checkOut — YYYY-MM-DD
     * @param {number} guests   — Number of guests
     * @param {string} [roomType] — Optional room ID filter (STD, DLX, SUP, STE)
     * @returns {Array<Object>} — Available room objects with availability count
     */
    checkAvailability(checkIn, checkOut, guests, roomType) {
        if (!isValidDateRange(checkIn, checkOut)) {
            return [];
        }

        // Count existing confirmed bookings that overlap
        const bookings = this.getAllReservations().filter(b =>
            b.status !== 'cancelled' &&
            new Date(b.checkIn) < new Date(checkOut) &&
            new Date(b.checkOut) > new Date(checkIn)
        );

        let available = this.rooms
            .filter(room => room.maxGuests >= guests)
            .map(room => {
                const bookedCount = bookings.filter(b => b.roomType === room.id).length;
                const availableCount = Math.max(0, room.totalRooms - bookedCount);
                return {
                    ...room,
                    available: availableCount,
                    nights: getDateDiff(checkIn, checkOut)
                };
            })
            .filter(room => room.available > 0);

        if (roomType) {
            available = available.filter(room => room.id === roomType);
        }

        return available;
    }

    /* --------------------------------------------------------
       RESERVATION CRUD
       -------------------------------------------------------- */

    /**
     * Create a new reservation.
     *
     * @param {Object} bookingData
     * @param {string} bookingData.roomType   — Room ID
     * @param {string} bookingData.checkIn    — YYYY-MM-DD
     * @param {string} bookingData.checkOut   — YYYY-MM-DD
     * @param {number} bookingData.guests     — Guest count
     * @param {string} bookingData.guestName  — Primary guest name
     * @param {string} bookingData.email      — Guest email
     * @param {string} bookingData.phone      — Guest phone
     * @param {string} [bookingData.idType]   — ID document type
     * @param {string} [bookingData.idNumber] — ID document number
     * @param {string} [bookingData.specialRequests] — Special requests
     * @returns {Object} — The complete booking record with ID
     */
    createReservation(bookingData) {
        const bookings = this.getAllReservations();
        const room = this.rooms.find(r => r.id === bookingData.roomType);
        if (!room) throw new Error('Invalid room type.');

        const nights = getDateDiff(bookingData.checkIn, bookingData.checkOut);
        const pricing = this.calculateTotal(bookingData.roomType, bookingData.checkIn, bookingData.checkOut, bookingData.guests);

        const booking = {
            id: this._generateBookingId(),
            ...bookingData,
            roomName: room.name,
            nights,
            roomRate: room.price,
            subtotal: pricing.subtotal,
            gstAmount: pricing.gstAmount,
            totalAmount: pricing.totalAmount,
            status: 'confirmed',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        bookings.push(booking);
        this._save(bookings);

        return booking;
    }

    /**
     * Retrieve a single reservation by ID.
     * @param {string} bookingId — e.g. "HSI-A3F9D2"
     * @returns {Object|null}
     */
    getReservation(bookingId) {
        return this.getAllReservations().find(b => b.id === bookingId) || null;
    }

    /**
     * Cancel an existing reservation.
     * @param {string} bookingId
     * @returns {Object|null} — Updated booking or null if not found
     */
    cancelReservation(bookingId) {
        const bookings = this.getAllReservations();
        const index = bookings.findIndex(b => b.id === bookingId);
        if (index === -1) return null;

        bookings[index].status = 'cancelled';
        bookings[index].updatedAt = new Date().toISOString();
        this._save(bookings);
        return bookings[index];
    }

    /**
     * Get all reservations from localStorage.
     * @returns {Array<Object>}
     */
    getAllReservations() {
        try {
            return JSON.parse(localStorage.getItem(this.storageKey)) || [];
        } catch {
            return [];
        }
    }

    /* --------------------------------------------------------
       PRICE CALCULATION
       -------------------------------------------------------- */

    /**
     * Calculate total cost including GST.
     *
     * @param {string} roomType — Room ID
     * @param {string} checkIn  — YYYY-MM-DD
     * @param {string} checkOut — YYYY-MM-DD
     * @param {number} guests   — Number of guests
     * @returns {{ subtotal: number, gstRate: number, gstAmount: number, totalAmount: number, nights: number, roomRate: number }}
     */
    calculateTotal(roomType, checkIn, checkOut, guests) {
        const room = this.rooms.find(r => r.id === roomType);
        if (!room) return { subtotal: 0, gstRate: 0.18, gstAmount: 0, totalAmount: 0, nights: 0, roomRate: 0 };

        const nights = getDateDiff(checkIn, checkOut);
        const subtotal = room.price * nights;
        const gstRate = 0.18;
        const gstAmount = Math.round(subtotal * gstRate);
        const totalAmount = subtotal + gstAmount;

        return {
            roomRate: room.price,
            nights,
            subtotal,
            gstRate,
            gstAmount,
            totalAmount
        };
    }

    /* --------------------------------------------------------
       PRIVATE HELPERS
       -------------------------------------------------------- */

    /**
     * Generate a unique booking ID in HSI-XXXXXX format.
     * @private
     * @returns {string}
     */
    _generateBookingId() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let id = 'HSI-';
        for (let i = 0; i < 6; i++) {
            id += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        // Ensure uniqueness
        const existing = this.getAllReservations();
        if (existing.some(b => b.id === id)) return this._generateBookingId();
        return id;
    }

    /**
     * Persist bookings to localStorage.
     * @private
     * @param {Array<Object>} bookings
     */
    _save(bookings) {
        localStorage.setItem(this.storageKey, JSON.stringify(bookings));
    }
}

/* ============================================================
   BOOKING FLOW UI
   ============================================================ */

/**
 * Manages the multi-step booking flow UI:
 *  Step 1 ← ’ Check Availability
 *  Step 2 ← ’ Select Room
 *  Step 3 ← ’ Guest Details
 *  Step 4 ← ’ Summary & Confirm
 *  Step 5 ← ’ Confirmation
 */
class BookingFlowUI {
    constructor() {
        /** @type {BookingManager} */
        this.manager = new BookingManager();

        /** Current booking state */
        this.state = {
            step: 1,
            checkIn: '',
            checkOut: '',
            guests: 1,
            selectedRoom: null,
            availableRooms: [],
            guestDetails: {},
            booking: null
        };

        this.modal = null;
        this._init();
    }

    /* --------------------------------------------------------
       INITIALIZATION
       -------------------------------------------------------- */

    /** @private */
    _init() {
        // Attach to the hero booking widget submit
        const bookingForm = document.querySelector('.booking-widget form, .hero-booking-form, #bookingWidgetForm');
        if (bookingForm) {
            bookingForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this._startBookingFlow(bookingForm);
            });
        }

        // Also attach to CTA buttons that trigger booking
        const bookNowBtns = document.querySelectorAll('.book-now-btn, [data-action="book"], .room-card .btn--primary, .nav-cta, .mobile-nav__cta');
        bookNowBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const roomType = btn.dataset.room || btn.closest('[data-room]')?.dataset.room || '';
                this._openQuickBook(roomType);
            });
        });
    }

    /* --------------------------------------------------------
       MODAL MANAGEMENT
       -------------------------------------------------------- */

    /** Create or get the booking modal container */
    _getModal() {
        if (this.modal) return this.modal;

        this.modal = document.createElement('div');
        this.modal.className = 'booking-modal-overlay';
        this.modal.innerHTML = `
            <div class="booking-modal">
                <button class="booking-modal-close" aria-label="Close">&times;</button>
                <div class="booking-modal-progress">
                    <div class="progress-step active" data-step="1"><span>1</span> Availability</div>
                    <div class="progress-step" data-step="2"><span>2</span> Select Room</div>
                    <div class="progress-step" data-step="3"><span>3</span> Guest Details</div>
                    <div class="progress-step" data-step="4"><span>4</span> Confirm</div>
                </div>
                <div class="booking-modal-body"></div>
            </div>
        `;
        document.body.appendChild(this.modal);

        // Close handler
        this.modal.querySelector('.booking-modal-close').addEventListener('click', () => this._closeModal());
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this._closeModal();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('active')) this._closeModal();
        });

        return this.modal;
    }

    /** Open the booking modal */
    _openModal() {
        const modal = this._getModal();
        modal.classList.add('active');
        document.body.classList.add('booking-modal-open');
    }

    /** Close the booking modal */
    _closeModal() {
        if (this.modal) {
            this.modal.classList.remove('active');
            document.body.classList.remove('booking-modal-open');
        }
    }

    /** Update the progress indicator */
    _updateProgress(step) {
        if (!this.modal) return;
        const steps = this.modal.querySelectorAll('.progress-step');
        steps.forEach(s => {
            const sNum = parseInt(s.dataset.step);
            s.classList.toggle('active', sNum === step);
            s.classList.toggle('completed', sNum < step);
        });
    }

    /* --------------------------------------------------------
       STEP 1 — CHECK AVAILABILITY
       -------------------------------------------------------- */

    /**
     * Start the booking flow from the hero widget form.
     * @param {HTMLFormElement} form
     */
    _startBookingFlow(form) {
        const checkIn = form.querySelector('#check-in, #checkIn, [name="check_in"], #checkin, [name="checkin"]')?.value;
        const checkOut = form.querySelector('#check-out, #checkOut, [name="check_out"], #checkout, [name="checkout"]')?.value;
        const guests = parseInt(form.querySelector('#guests, [name="guests"]')?.value) || 2;

        if (!checkIn || !checkOut) {
            showToast('Please select check-in and check-out dates.', 'warning');
            return;
        }

        if (!isValidDateRange(checkIn, checkOut)) {
            showToast('Please select valid dates. Check-out must be after check-in.', 'error');
            return;
        }

        this.state.checkIn = checkIn;
        this.state.checkOut = checkOut;
        this.state.guests = guests;
        this.state.availableRooms = this.manager.checkAvailability(checkIn, checkOut, guests);

        if (this.state.availableRooms.length === 0) {
            showToast('Sorry, no rooms are available for the selected dates and guests. Please try different dates.', 'error');
            return;
        }

        this._showStep2();
    }

    /** Open quick book with a pre-selected room type */
    _openQuickBook(roomType) {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        this.state.checkIn = toInputDate(today);
        this.state.checkOut = toInputDate(tomorrow);
        this.state.guests = 1;

        if (roomType) {
            const room = ROOMS.find(r => r.id === roomType);
            if (room) {
                this.state.selectedRoom = room;
                this._showStep3();
                return;
            }
        }

        this.state.availableRooms = this.manager.checkAvailability(
            this.state.checkIn, this.state.checkOut, this.state.guests
        );
        this._showStep2();
    }

    /* --------------------------------------------------------
       STEP 2 — SELECT ROOM
       -------------------------------------------------------- */

    /** Render room selection UI */
    _showStep2() {
        this.state.step = 2;
        this._openModal();
        this._updateProgress(2);

        const body = this.modal.querySelector('.booking-modal-body');
        const nights = getDateDiff(this.state.checkIn, this.state.checkOut);

        let roomsHtml = this.state.availableRooms.map(room => {
            const pricing = this.manager.calculateTotal(room.id, this.state.checkIn, this.state.checkOut, this.state.guests);
            return `
                <div class="room-select-card" data-room="${room.id}">
                    <div class="room-select-info">
                        <h3>${room.name}</h3>
                        <p class="room-select-desc">${room.description}</p>
                        <div class="room-select-amenities">
                            ${room.amenities.slice(0, 5).map(a => `<span class="amenity-tag">${a}</span>`).join('')}
                            ${room.amenities.length > 5 ? `<span class="amenity-tag more">+${room.amenities.length - 5} more</span>` : ''}
                        </div>
                        <p class="room-select-availability">${room.available} room${room.available > 1 ? 's' : ''} available</p>
                    </div>
                    <div class="room-select-pricing">
                        <div class="room-rate">₹${room.price.toLocaleString('en-IN')}<span>/night</span></div>
                        <div class="room-total">₹${pricing.totalAmount.toLocaleString('en-IN')} <span>for ${nights} night${nights > 1 ? 's' : ''} (incl. GST)</span></div>
                        <button class="btn btn-primary room-select-btn" data-room="${room.id}">Select Room</button>
                        <div class="best-rate-badge">✓ Best Rate Guarantee</div>
                    </div>
                </div>
            `;
        }).join('');

        body.innerHTML = `
            <div class="booking-step step-select-room">
                <h2>Select Your Room</h2>
                <p class="booking-dates-summary">
                    <strong>${formatDate(this.state.checkIn)}</strong> ← ’ <strong>${formatDate(this.state.checkOut)}</strong>
                     &bull;  ${nights} night${nights > 1 ? 's' : ''}  &bull;  ${this.state.guests} guest${this.state.guests > 1 ? 's' : ''}
                </p>
                <div class="room-select-list">${roomsHtml}</div>
            </div>
        `;

        // Room selection handlers
        body.querySelectorAll('.room-select-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const roomId = btn.dataset.room;
                this.state.selectedRoom = this.state.availableRooms.find(r => r.id === roomId);
                this._showStep3();
            });
        });
    }

    /* --------------------------------------------------------
       STEP 3 — GUEST DETAILS
       -------------------------------------------------------- */

    /** Render guest details form */
    _showStep3() {
        this.state.step = 3;
        this._openModal();
        this._updateProgress(3);

        const body = this.modal.querySelector('.booking-modal-body');
        const room = this.state.selectedRoom;

        body.innerHTML = `
            <div class="booking-step step-guest-details">
                <h2>Guest Details</h2>
                <p class="selected-room-badge">${room.name} — ₹${room.price.toLocaleString('en-IN')}/night</p>
                <form id="guestDetailsForm" class="guest-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="guestName">Full Name <span class="required">*</span></label>
                            <input type="text" id="guestName" name="guestName" required placeholder="Enter your full name" />
                        </div>
                        <div class="form-group">
                            <label for="guestEmail">Email <span class="required">*</span></label>
                            <input type="email" id="guestEmail" name="guestEmail" required placeholder="your@email.com" />
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="guestPhone">Phone Number <span class="required">*</span></label>
                            <input type="tel" id="guestPhone" name="guestPhone" required placeholder="+91 98765 43210" />
                        </div>
                        <div class="form-group">
                            <label for="numGuests">Number of Guests</label>
                            <select id="numGuests" name="numGuests">
                                ${Array.from({ length: room.maxGuests }, (_, i) => i + 1)
                                    .map(n => `<option value="${n}" ${n === this.state.guests ? 'selected' : ''}>${n} Guest${n > 1 ? 's' : ''}</option>`)
                                    .join('')}
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="idType">ID Type</label>
                            <select id="idType" name="idType">
                                <option value="">Select ID Type</option>
                                <option value="aadhar">Aadhaar Card</option>
                                <option value="pan">PAN Card</option>
                                <option value="passport">Passport</option>
                                <option value="driving">Driving License</option>
                                <option value="voter">Voter ID</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="idNumber">ID Number</label>
                            <input type="text" id="idNumber" name="idNumber" placeholder="Enter ID number" />
                        </div>
                    </div>
                    <div class="form-group full-width">
                        <label for="specialRequests">Special Requests</label>
                        <textarea id="specialRequests" name="specialRequests" rows="3"
                            placeholder="Any special requests? (e.g., extra pillows, early check-in, anniversary decoration)"></textarea>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" id="backToStep2">←  Back</button>
                        <button type="submit" class="btn btn-primary">Continue to Summary ← ’</button>
                    </div>
                </form>
            </div>
        `;

        // Back button
        body.querySelector('#backToStep2').addEventListener('click', () => this._showStep2());

        // Form submit
        body.querySelector('#guestDetailsForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const form = e.target;

            const guestName = form.guestName.value.trim();
            const guestEmail = form.guestEmail.value.trim();
            const guestPhone = form.guestPhone.value.trim();

            // Validation
            if (!guestName || guestName.length < 2) {
                showToast('Please enter a valid name.', 'warning');
                return;
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) {
                showToast('Please enter a valid email address.', 'warning');
                return;
            }
            if (!/^(\+91[\-\s]?)?[6-9]\d{9}$/.test(guestPhone.replace(/[\s\-]/g, ''))) {
                showToast('Please enter a valid Indian phone number.', 'warning');
                return;
            }

            this.state.guests = parseInt(form.numGuests.value) || this.state.guests;
            this.state.guestDetails = {
                guestName,
                email: guestEmail,
                phone: guestPhone,
                idType: form.idType.value,
                idNumber: form.idNumber.value.trim(),
                specialRequests: form.specialRequests.value.trim()
            };

            this._showStep4();
        });
    }

    /* --------------------------------------------------------
       STEP 4 — BOOKING SUMMARY & CONFIRM
       -------------------------------------------------------- */

    /** Render booking summary */
    _showStep4() {
        this.state.step = 4;
        this._updateProgress(4);

        const body = this.modal.querySelector('.booking-modal-body');
        const room = this.state.selectedRoom;
        const details = this.state.guestDetails;
        const pricing = this.manager.calculateTotal(room.id, this.state.checkIn, this.state.checkOut, this.state.guests);

        body.innerHTML = `
            <div class="booking-step step-summary">
                <h2>Booking Summary</h2>
                <div class="summary-card">
                    <div class="summary-section">
                        <h3>Room Details</h3>
                        <div class="summary-row"><span>Room Type</span><strong>${room.name}</strong></div>
                        <div class="summary-row"><span>Check-in</span><strong>${formatDate(this.state.checkIn)}</strong></div>
                        <div class="summary-row"><span>Check-out</span><strong>${formatDate(this.state.checkOut)}</strong></div>
                        <div class="summary-row"><span>Duration</span><strong>${pricing.nights} Night${pricing.nights > 1 ? 's' : ''}</strong></div>
                        <div class="summary-row"><span>Guests</span><strong>${this.state.guests}</strong></div>
                    </div>
                    <div class="summary-section">
                        <h3>Guest Information</h3>
                        <div class="summary-row"><span>Name</span><strong>${details.guestName}</strong></div>
                        <div class="summary-row"><span>Email</span><strong>${details.email}</strong></div>
                        <div class="summary-row"><span>Phone</span><strong>${details.phone}</strong></div>
                        ${details.idType ? `<div class="summary-row"><span>ID</span><strong>${details.idType.toUpperCase()} — ${details.idNumber}</strong></div>` : ''}
                        ${details.specialRequests ? `<div class="summary-row"><span>Special Requests</span><strong>${details.specialRequests}</strong></div>` : ''}
                    </div>
                    <div class="summary-section pricing-section">
                        <h3>Price Breakdown</h3>
                        <div class="summary-row"><span>Room Rate (₹${pricing.roomRate.toLocaleString('en-IN')} × ${pricing.nights} night${pricing.nights > 1 ? 's' : ''})</span><strong>₹${pricing.subtotal.toLocaleString('en-IN')}</strong></div>
                        <div class="summary-row"><span>GST (18%)</span><strong>₹${pricing.gstAmount.toLocaleString('en-IN')}</strong></div>
                        <div class="summary-row total-row"><span>Total Amount</span><strong>₹${pricing.totalAmount.toLocaleString('en-IN')}</strong></div>
                        <div class="best-rate-badge">✓ Best Rate Guarantee</div>
                    </div>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" id="backToStep3">←  Back</button>
                    <button type="button" class="btn btn-primary btn-confirm" id="confirmBooking">
                        ✓ Confirm Booking
                    </button>
                </div>
            </div>
        `;

        body.querySelector('#backToStep3').addEventListener('click', () => this._showStep3());
        body.querySelector('#confirmBooking').addEventListener('click', () => this._confirmBooking());
    }

    /* --------------------------------------------------------
       STEP 5 — CONFIRMATION
       -------------------------------------------------------- */

    /** Process and confirm the booking */
    _confirmBooking() {
        const room = this.state.selectedRoom;
        const details = this.state.guestDetails;

        try {
            const booking = this.manager.createReservation({
                roomType: room.id,
                checkIn: this.state.checkIn,
                checkOut: this.state.checkOut,
                guests: this.state.guests,
                guestName: details.guestName,
                email: details.email,
                phone: details.phone,
                idType: details.idType,
                idNumber: details.idNumber,
                specialRequests: details.specialRequests
            });

            this.state.booking = booking;
            this._showConfirmation(booking);

            // Send confirmation email (placeholder)
            sendConfirmationEmail(booking);

        } catch (err) {
            showToast('Something went wrong. Please try again.', 'error');
            console.error('Booking error:', err);
        }
    }

    /** Render the confirmation screen */
    _showConfirmation(booking) {
        // Hide progress bar for confirmation
        const progress = this.modal.querySelector('.booking-modal-progress');
        if (progress) progress.style.display = 'none';

        const body = this.modal.querySelector('.booking-modal-body');

        body.innerHTML = `
            <div class="booking-step step-confirmation">
                <div class="confirmation-header">
                    <div class="confirmation-icon">✅</div>
                    <h2>Booking Confirmed!</h2>
                    <p class="confirmation-subtitle">Your reservation has been successfully confirmed.</p>
                </div>
                <div class="confirmation-details">
                    <div class="booking-id-display">
                        <span>Booking ID</span>
                        <strong>${booking.id}</strong>
                    </div>
                    <div class="confirmation-info">
                        <div class="summary-row"><span>Guest Name</span><strong>${booking.guestName}</strong></div>
                        <div class="summary-row"><span>Room</span><strong>${booking.roomName}</strong></div>
                        <div class="summary-row"><span>Check-in</span><strong>${formatDate(booking.checkIn)}</strong></div>
                        <div class="summary-row"><span>Check-out</span><strong>${formatDate(booking.checkOut)}</strong></div>
                        <div class="summary-row"><span>Guests</span><strong>${booking.guests}</strong></div>
                        <div class="summary-row total-row"><span>Total Paid</span><strong>₹${booking.totalAmount.toLocaleString('en-IN')}</strong></div>
                    </div>
                    <p class="confirmation-note">
                        📱 You will receive a confirmation on <strong>WhatsApp</strong> and <strong>Email</strong> shortly.
                    </p>
                </div>
                <div class="confirmation-actions">
                    <button class="btn btn-primary" id="whatsappConfirm">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.75.75 0 00.917.918l4.458-1.495A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.326 0-4.478-.758-6.234-2.042l-.436-.327-2.646.887.887-2.646-.327-.436A9.956 9.956 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/></svg>
                        Share on WhatsApp
                    </button>
                    <button class="btn btn-secondary" id="downloadReceipt">📄 Download Receipt</button>
                    <button class="btn btn-outline" id="closeConfirmation">Close</button>
                </div>
            </div>
        `;

        // WhatsApp share
        body.querySelector('#whatsappConfirm').addEventListener('click', () => {
            this._shareOnWhatsApp(booking);
        });

        // Download receipt
        body.querySelector('#downloadReceipt').addEventListener('click', () => {
            this._downloadReceipt(booking);
        });

        // Close
        body.querySelector('#closeConfirmation').addEventListener('click', () => {
            this._closeModal();
            // Reset progress bar visibility
            if (progress) progress.style.display = '';
        });

        showToast('🎉 Booking confirmed! Your reservation ID is ' + booking.id, 'success', 6000);
    }

    /* --------------------------------------------------------
       WHATSAPP INTEGRATION
       -------------------------------------------------------- */

    /**
     * Generate and open a WhatsApp message with booking details.
     * @param {Object} booking
     */
    _shareOnWhatsApp(booking) {
        const hotelPhone = '919876543210'; // Replace with actual hotel number
        const message = encodeURIComponent(
            `*Hotel Simran International — Booking Confirmation*\n\n` +
            `Booking ID: *${booking.id}*\n` +
            `Guest: ${booking.guestName}\n` +
            `Room: ${booking.roomName}\n` +
            `Check-in: ${formatDate(booking.checkIn)}\n` +
            `Check-out: ${formatDate(booking.checkOut)}\n` +
            `Guests: ${booking.guests}\n` +
            `Total: ₹${booking.totalAmount.toLocaleString('en-IN')} (incl. GST)\n\n` +
            `Thank you for choosing Hotel Simran International!`
        );

        window.open(`https://wa.me/${hotelPhone}?text=${message}`, '_blank');
    }

    /* --------------------------------------------------------
       RECEIPT DOWNLOAD
       -------------------------------------------------------- */

    /**
     * Generate and download a simple text receipt.
     * @param {Object} booking
     */
    _downloadReceipt(booking) {
        const receipt = [
            '===============================================',
            '        HOTEL SIMRAN INTERNATIONAL',
            '          Booking Receipt',
            '===============================================',
            '',
            `  Booking ID     : ${booking.id}`,
            `  Date           : ${formatDate(booking.createdAt)}`,
            '',
            '--------------------------------------------',
            '  GUEST DETAILS',
            '--------------------------------------------',
            `  Name           : ${booking.guestName}`,
            `  Email          : ${booking.email}`,
            `  Phone          : ${booking.phone}`,
            booking.idType ? `  ID (${booking.idType.toUpperCase()})    : ${booking.idNumber}` : '',
            '',
            '--------------------------------------------',
            '  ROOM DETAILS',
            '--------------------------------------------',
            `  Room Type      : ${booking.roomName}`,
            `  Check-in       : ${formatDate(booking.checkIn)}`,
            `  Check-out      : ${formatDate(booking.checkOut)}`,
            `  Duration       : ${booking.nights} Night(s)`,
            `  Guests         : ${booking.guests}`,
            booking.specialRequests ? `  Special Req.   : ${booking.specialRequests}` : '',
            '',
            '--------------------------------------------',
            '  PRICE BREAKDOWN',
            '--------------------------------------------',
            `  Room Rate      : ₹${booking.roomRate.toLocaleString('en-IN')} × ${booking.nights} night(s)`,
            `  Subtotal       : ₹${booking.subtotal.toLocaleString('en-IN')}`,
            `  GST (18%)      : ₹${booking.gstAmount.toLocaleString('en-IN')}`,
            `  --------------------------------------------`,
            `  TOTAL          : ₹${booking.totalAmount.toLocaleString('en-IN')}`,
            '',
            '===============================================',
            '  Thank you for choosing',
            '  Hotel Simran International!',
            '',
            '  Address: Near Railway Station, Pandri,',
            '           Raipur, Chhattisgarh 492001',
            '  Phone  : +91 98765 43210',
            '  Email  : info@hotelsimranintl.com',
            '  Web    : www.hotelsimranintl.com',
            '===============================================',
        ].filter(Boolean).join('\n');

        const blob = new Blob([receipt], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `HSI_Receipt_${booking.id}.txt`;
        a.click();
        URL.revokeObjectURL(url);

        showToast('Receipt downloaded!', 'success');
    }
}

/* ============================================================
   EMAIL CONFIRMATION (Placeholder)
   ============================================================ */

/**
 * Placeholder function for sending a confirmation email.
 * In production, this would call a backend API.
 *
 * @param {Object} bookingData — The complete booking record
 */
function sendConfirmationEmail(bookingData) {
    console.log('📧 [Email] Sending confirmation email to:', bookingData.email);
    console.log('📧 [Email] Booking ID:', bookingData.id);
    console.log('📧 [Email] Full booking data:', JSON.stringify(bookingData, null, 2));

    // Simulate a short delay
    setTimeout(() => {
        showToast('Confirmation email sent to ' + bookingData.email + '!', 'success');
    }, 1500);
}

/* ============================================================
   PRICE CALCULATOR (Dynamic)
   ============================================================ */

/**
 * Dynamic price display that updates as user changes dates/room type.
 * Attaches to elements with [data-price-display] attribute.
 */
function initPriceCalculator() {
    const displays = document.querySelectorAll('[data-price-display]');
    const checkInInput = document.querySelector('#check-in, #checkIn, [name="check_in"]');
    const checkOutInput = document.querySelector('#check-out, #checkOut, [name="check_out"]');
    const roomSelect = document.querySelector('#roomType, [name="room_type"]');

    if (!displays.length || !checkInInput || !checkOutInput) return;

    const manager = new BookingManager();

    function updatePrice() {
        const checkIn = checkInInput.value;
        const checkOut = checkOutInput.value;
        const roomType = roomSelect ? roomSelect.value : 'STD';

        if (!checkIn || !checkOut || !isValidDateRange(checkIn, checkOut)) return;

        const pricing = manager.calculateTotal(roomType, checkIn, checkOut, 1);

        displays.forEach(display => {
            const field = display.dataset.priceDisplay;
            switch (field) {
                case 'rate':
                    display.textContent = `₹${pricing.roomRate.toLocaleString('en-IN')}`;
                    break;
                case 'nights':
                    display.textContent = pricing.nights;
                    break;
                case 'subtotal':
                    display.textContent = `₹${pricing.subtotal.toLocaleString('en-IN')}`;
                    break;
                case 'gst':
                    display.textContent = `₹${pricing.gstAmount.toLocaleString('en-IN')}`;
                    break;
                case 'total':
                    display.textContent = `₹${pricing.totalAmount.toLocaleString('en-IN')}`;
                    break;
            }
        });
    }

    checkInInput.addEventListener('change', updatePrice);
    checkOutInput.addEventListener('change', updatePrice);
    if (roomSelect) roomSelect.addEventListener('change', updatePrice);

    // Initial calculation
    updatePrice();
}

/* ============================================================
   INITIALIZE ON DOM READY
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    // Boot up the booking flow UI
    window.bookingFlow = new BookingFlowUI();
    initPriceCalculator();
});

// Export for admin panel integration
window.BookingManager = BookingManager;
window.ROOMS = ROOMS;
window.formatDate = formatDate;
window.getDateDiff = getDateDiff;
window.isValidDateRange = isValidDateRange;


