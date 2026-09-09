/**
 * NexusCommerce - Main Application Controller & Internationalization
 */

const translations = {
    ar: {
        app_title: 'كليك كاشير | منظومة نقاط البيع والمحاسبة التجارية الذكية',
        brand_name: 'كليك كاشير',
        live_ticker_label: 'نبض السوق المباشر',
        revenue: 'إجمالي الإيرادات',
        profit: 'صافي الأرباح',
        margin: 'هامش الربح',
        inventory_value: 'قيمة المخزون',
        total_products: 'المنتجات المسجلة',
        low_stock_alerts: 'تنبيهات انخفاض المخزون',
        stack_depth: 'عمق المكدس (Stack)',
        nav_inventory: 'المخزون والمنتجات',
        nav_pos: 'نقطة البيع (POS)',
        nav_accounting: 'الدفتر المحاسبي',
        nav_stack_inspector: 'محاكي الـ Stack',
        btn_add_product: 'إضافة منتج جديد',
        btn_undo: 'تراجع عن آخر عملية (Pop)',
        btn_peek: 'معاينة القمة (Peek)',
        search_placeholder: 'ابحث باسم المنتج، SKU أو الكود...',
        category_all: 'كافة الأصناف',
        category_laptops: 'حواسيب محمولة',
        category_smartphones: 'هواتف ذكية',
        category_audio: 'صوتيات وسماعات',
        category_monitors: 'شاشات عرض',
        category_cameras: 'كاميرات رقمية',
        category_wearables: 'أجهزة ذكية وساعات',
        view_grid: 'عرض شبكي',
        view_table: 'عرض جدولي',
        selling_price: 'سعر البيع',
        cost_price: 'التكلفة',
        edit_price: 'السعر',
        edit_stock: 'الكمية',
        sell: 'بيع',
        pos_title: 'نظام نقاط البيع والكاشير',
        customer_name: 'اسم العميل / المؤسسة',
        cart_empty_title: 'سلة الفاتورة فارغة',
        cart_empty_hint: 'انقر على "بيع" من قائمة المنتجات لإضافتها فوراً',
        subtotal: 'المجموع الفرعي',
        tax_vat: 'ضريبة القيمة المضافة (15%)',
        discount: 'الخصم',
        grand_total: 'الإجمالي النهائي',
        btn_checkout: 'إتمام البيع وإصدار الفاتورة',
        stack_inspector_title: 'محاكي ومفتش هيكل البيانات (Stack Inspector)',
        stack_inspector_sub: 'تنفيذ خوارزميات LIFO (Push / Pop / Peek) بزمن O(1) وربطها بعمليات المتجر الفعلية',
        btn_manual_push: 'دفع عنصر تجريبي (Push)',
        btn_pop_undo: 'سحب وتراجع (Pop)',
        btn_peek_inspect: 'فحص القمة (Peek)',
        btn_clear_stack: 'تفريغ المكدس',
        stack_empty_title: 'المكدس فارغ حالياً',
        stack_empty_desc: 'قم بتعديل الأسعار أو تنفيذ مبيعات لمشاهدة الـ Push مباشرة',
        product_unit: 'منتج',
        modal_add_title: 'إضافة منتج تجاري جديد',
        modal_edit_price_title: 'تعديل سعر المنتج O(1)',
        modal_edit_stock_title: 'تعديل كمية المخزون',
        btn_save: 'حفظ التعديلات',
        btn_cancel: 'إلغاء'
    },
    en: {
        app_title: 'ClickCashier Pro | Smart Retail POS & Executive Dashboard',
        brand_name: 'CLICK CASHIER',
        live_ticker_label: 'Live Market Ticker',
        revenue: 'Total Revenue',
        profit: 'Net Profit',
        margin: 'Profit Margin',
        inventory_value: 'Inventory Valuation',
        total_products: 'Total Products',
        low_stock_alerts: 'Low Stock Alerts',
        stack_depth: 'Stack Depth',
        nav_inventory: 'Inventory & Products',
        nav_pos: 'POS Terminal',
        nav_accounting: 'Accounting Ledger',
        nav_stack_inspector: 'Stack Inspector',
        btn_add_product: 'Add New Product',
        btn_undo: 'Undo Last Action (Pop)',
        btn_peek: 'Inspect Top (Peek)',
        search_placeholder: 'Search by product name, SKU or ID...',
        category_all: 'All Categories',
        category_laptops: 'Laptops',
        category_smartphones: 'Smartphones',
        category_audio: 'Audio & ANC',
        category_monitors: 'Monitors',
        category_cameras: 'Cameras',
        category_wearables: 'Wearables',
        view_grid: 'Grid View',
        view_table: 'Table View',
        selling_price: 'Selling Price',
        cost_price: 'Cost Price',
        edit_price: 'Price',
        edit_stock: 'Stock',
        sell: 'Sell',
        pos_title: 'POS Terminal & Register',
        customer_name: 'Customer / Business Name',
        cart_empty_title: 'Cart is currently empty',
        cart_empty_hint: 'Click "Sell" on any product card to add it',
        subtotal: 'Subtotal',
        tax_vat: 'VAT Tax (15%)',
        discount: 'Discount',
        grand_total: 'Grand Total',
        btn_checkout: 'Complete Sale & Print Invoice',
        stack_inspector_title: 'Data Structure Stack Visualizer',
        stack_inspector_sub: 'Visualizing O(1) LIFO operations (Push / Pop / Peek) tied to live commercial state',
        btn_manual_push: 'Push Demo Action',
        btn_pop_undo: 'Pop / Undo Action',
        btn_peek_inspect: 'Peek Top Item',
        btn_clear_stack: 'Clear Stack',
        stack_empty_title: 'Stack is currently empty',
        stack_empty_desc: 'Modify prices or make a sale to see push in action',
        product_unit: 'products',
        modal_add_title: 'Add Commercial Product',
        modal_edit_price_title: 'Update Price in O(1)',
        modal_edit_stock_title: 'Update Stock Level',
        btn_save: 'Save Changes',
        btn_cancel: 'Cancel'
    }
};

class I18nManager {
    constructor() {
        this.currentLang = 'ar';
    }

    t(key) {
        return translations[this.currentLang][key] || key;
    }

    setLanguage(lang) {
        if (!translations[lang]) return;
        this.currentLang = lang;
        document.documentElement.lang = lang;
        document.documentElement.dir = (lang === 'ar') ? 'rtl' : 'ltr';

        // Update all elements with data-i18n
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const k = el.getAttribute('data-i18n');
            if (k && translations[lang][k]) {
                el.textContent = translations[lang][k];
            }
        });

        // Update placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const k = el.getAttribute('data-i18n-placeholder');
            if (k && translations[lang][k]) {
                el.placeholder = translations[lang][k];
            }
        });

        // Re-render components
        if (window.appInventory) window.appInventory.renderProducts();
        if (window.posManager) window.posManager.renderCart();

        // Update language toggle button text
        const langBtn = document.getElementById('langToggleBtn');
        if (langBtn) {
            langBtn.innerHTML = lang === 'ar' ? '<i class="fas fa-globe"></i> English' : '<i class="fas fa-globe"></i> العربية';
        }
    }

    toggle() {
        this.setLanguage(this.currentLang === 'ar' ? 'en' : 'ar');
    }
}

// Global App Initialization
document.addEventListener('DOMContentLoaded', () => {
    window.i18n = new I18nManager();

    // Initialize systems
    window.appInventory = new InventoryManager();
    window.posManager = new POSManager();
    window.stackVisualizer = new StackVisualizer('stackVisualContainer', 'stackTerminalLog', 'stackCodeBlock');

    // Initial render
    window.appInventory.renderProducts();
    window.appInventory.updateInventoryStats();
    window.posManager.renderCart();
    window.posManager.renderTransactionsTable();
    window.stackVisualizer.renderFullStack(window.appActionStack);
    window.stackVisualizer.updateStats(window.appActionStack);

    if (window.appDB) {
        window.appDB.applySettingsToDOM();
        window.appDB.renderCustomersTable();
        window.appDB.updatePosCustomersPicker();
    }

    setupEventListeners();
    setupAddProductCalculator();
    renderFinancialChart();
});

function setupEventListeners() {
    // Language Switcher
    const langBtn = document.getElementById('langToggleBtn');
    if (langBtn) {
        langBtn.addEventListener('click', () => window.i18n.toggle());
    }

    // Tabs Navigation
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.view-section').forEach(s => s.classList.remove('active'));

            tab.classList.add('active');
            const targetId = tab.dataset.target;
            const targetSection = document.getElementById(targetId);
            if (targetSection) targetSection.classList.add('active');
        });
    });

    // View mode switch (Grid vs Table)
    const btnGrid = document.getElementById('btnViewGrid');
    const btnTable = document.getElementById('btnViewTable');
    if (btnGrid && btnTable) {
        btnGrid.addEventListener('click', () => {
            btnGrid.classList.add('active');
            btnTable.classList.remove('active');
            window.appInventory.viewMode = 'grid';
            window.appInventory.renderProducts();
        });
        btnTable.addEventListener('click', () => {
            btnTable.classList.add('active');
            btnGrid.classList.remove('active');
            window.appInventory.viewMode = 'table';
            window.appInventory.renderProducts();
        });
    }

    // Search input
    const searchInput = document.getElementById('inventorySearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            window.appInventory.currentSearchQuery = e.target.value;
            window.appInventory.renderProducts();
        });
    }

    // Category filter pills
    document.querySelectorAll('.filter-pill').forEach(pill => {
        pill.addEventListener('click', () => {
            document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            window.appInventory.currentFilterCategory = pill.dataset.category;
            window.appInventory.renderProducts();
        });
    });

    // Stock status filter
    const stockFilterSelect = document.getElementById('inventoryStockFilter');
    if (stockFilterSelect) {
        stockFilterSelect.addEventListener('change', (e) => {
            window.appInventory.currentStockFilter = e.target.value;
            window.appInventory.renderProducts();
        });
    }

    // Stack Global Buttons: Undo (Pop) and Peek
    const btnGlobalUndo = document.getElementById('btnGlobalUndo');
    if (btnGlobalUndo) {
        btnGlobalUndo.addEventListener('click', () => {
            if (window.appActionStack.isEmpty()) {
                showToast('المكدس فارغ، لا توجد عمليات للتراجع عنها!', 'info');
                return;
            }
            const undone = window.appInventory.undoLastAction();
            if (undone) {
                showToast(`تم التراجع (Pop) عن: ${undone.type}`, 'warning');
            }
        });
    }

    const btnGlobalPeek = document.getElementById('btnGlobalPeek');
    if (btnGlobalPeek) {
        btnGlobalPeek.addEventListener('click', () => {
            if (window.appActionStack.isEmpty()) {
                showToast('المكدس فارغ، لا يوجد عنصر لمعاينته!', 'info');
                return;
            }
            window.appActionStack.peek();
        });
    }

    // Stack Inspector controls
    const btnInspectPop = document.getElementById('btnInspectPop');
    if (btnInspectPop) {
        btnInspectPop.addEventListener('click', () => {
            if (window.appActionStack.isEmpty()) {
                showToast('المكدس فارغ!', 'info');
                return;
            }
            window.appInventory.undoLastAction();
        });
    }

    const btnInspectPeek = document.getElementById('btnInspectPeek');
    if (btnInspectPeek) {
        btnInspectPeek.addEventListener('click', () => {
            if (window.appActionStack.isEmpty()) {
                showToast('المكدس فارغ!', 'info');
                return;
            }
            window.appActionStack.peek();
        });
    }

    const btnInspectClear = document.getElementById('btnInspectClear');
    if (btnInspectClear) {
        btnInspectClear.addEventListener('click', () => {
            window.appActionStack.clear();
            showToast('تم تفريغ المكدس بالكامل', 'info');
        });
    }

    const btnInspectPushDemo = document.getElementById('btnInspectPushDemo');
    if (btnInspectPushDemo) {
        btnInspectPushDemo.addEventListener('click', () => {
            const demoAction = new AuditAction('PRICE_UPDATE', 'DEMO-SKU', {
                productName: 'عرض تجريبي للـ Stack Push',
                newPrice: Math.floor(100 + Math.random() * 500)
            }, { price: 99 });
            window.appActionStack.push(demoAction);
            showToast('تم تنفيذ Push لعنصر تجريبي في المكدس', 'success');
        });
    }

    // Add Product Modal Trigger
    const btnOpenAddModal = document.getElementById('btnOpenAddProductModal');
    const addProductModal = document.getElementById('addProductModal');
    if (btnOpenAddModal && addProductModal) {
        btnOpenAddModal.addEventListener('click', () => {
            addProductModal.classList.add('active');
        });
    }

    // Add Customer Modal Trigger
    const btnOpenAddCustomer = document.getElementById('btnOpenAddCustomerModal');
    const addCustomerModal = document.getElementById('addCustomerModal');
    if (btnOpenAddCustomer && addCustomerModal) {
        btnOpenAddCustomer.addEventListener('click', () => {
            addCustomerModal.classList.add('active');
        });
    }

    // Store Settings Modal Trigger
    const btnOpenSettings = document.getElementById('btnOpenStoreSettings');
    const storeSettingsModal = document.getElementById('storeSettingsModal');
    if (btnOpenSettings && storeSettingsModal) {
        btnOpenSettings.addEventListener('click', () => {
            if (window.appDB) window.appDB.applySettingsToDOM();
            storeSettingsModal.classList.add('active');
        });
    }

    // Form Submit: Add Customer
    const formAddCustomer = document.getElementById('formAddCustomer');
    if (formAddCustomer) {
        formAddCustomer.addEventListener('submit', (e) => {
            e.preventDefault();
            const data = {
                name: document.getElementById('newCustName').value,
                phone: document.getElementById('newCustPhone').value,
                email: document.getElementById('newCustEmail').value,
                notes: document.getElementById('newCustNotes').value
            };
            window.appDB.addCustomer(data);
            formAddCustomer.reset();
            if (addCustomerModal) addCustomerModal.classList.remove('active');
            showToast(`تم تسجيل العميل "${data.name}" بنجاح في قاعدة البيانات`, 'success');
        });
    }

    // Form Submit: Store Settings
    const formStoreSettings = document.getElementById('formStoreSettings');
    if (formStoreSettings) {
        formStoreSettings.addEventListener('submit', (e) => {
            e.preventDefault();
            const updated = {
                storeNameAr: document.getElementById('settingStoreName').value,
                tagline: document.getElementById('settingTagline').value,
                taxNumber: document.getElementById('settingTaxNumber').value,
                phone: document.getElementById('settingPhone').value,
                address: document.getElementById('settingAddress').value
            };
            window.appDB.saveSettings(updated);
            if (storeSettingsModal) storeSettingsModal.classList.remove('active');
        });
    }

    // Close Modals
    document.querySelectorAll('.modal-close-btn, .modal-backdrop-close').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
        });
    });

// Handle Custom Category Toggle
function toggleCustomCategoryField(val) {
    const customGroup = document.getElementById('customCategoryGroup');
    const customInput = document.getElementById('newProdCustomCategory');
    if (!customGroup) return;

    if (val === 'custom') {
        customGroup.style.display = 'flex';
        if (customInput) customInput.focus();
    } else {
        customGroup.style.display = 'none';
    }
}
window.toggleCustomCategoryField = toggleCustomCategoryField;

// Helper: One-click suggested name
function applySuggestedName(name) {
    const input = document.getElementById('settingStoreName');
    if (input) {
        input.value = name;
        if (window.showToast) window.showToast(`تم اختيار الاسم: "${name}". اضغط حفظ للاعتماد.`, 'info');
    }
}
window.applySuggestedName = applySuggestedName;

// Helper: Filter Customers Table
function filterCustomersTable(query) {
    const table = document.getElementById('customersListTable');
    if (!table || !window.appDB) return;
    const q = (query || '').toLowerCase().trim();
    const rows = table.querySelectorAll('tr');
    rows.forEach(r => {
        const text = r.textContent.toLowerCase();
        r.style.display = text.includes(q) ? '' : 'none';
    });
}
window.filterCustomersTable = filterCustomersTable;

// Helper: Select customer from POS Quick Picker dropdown
function handleSelectCustomerFromPicker(selectEl) {
    if (!selectEl || !selectEl.value || !window.appDB) return;
    const custId = selectEl.value;
    const customer = window.appDB.customers.find(c => c.id === custId);
    if (!customer) return;

    const nameInput = document.getElementById('posCustomerName');
    const phoneInput = document.getElementById('posCustomerPhone');
    const badge = document.getElementById('posCustomerBadge');
    const badgeText = document.getElementById('posCustomerBadgeText');

    if (nameInput) nameInput.value = customer.name;
    if (phoneInput) phoneInput.value = customer.phone || '';

    if (badge && badgeText) {
        badge.style.display = 'flex';
        badge.className = 'text-accent-emerald';
        badgeText.textContent = `عميل مسجل [${customer.id}] - إجمالي المشتريات السابقة: $${Number(customer.totalSpent).toFixed(0)}`;
    }

    if (window.showToast) window.showToast(`تم استدعاء بيانات العميل: ${customer.name}`, 'info');
}
window.handleSelectCustomerFromPicker = handleSelectCustomerFromPicker;

// Helper: Check if typed name matches an existing registered customer
function checkIfCustomerRegistered(name) {
    if (!name || !window.appDB) return;
    const trimmed = name.trim().toLowerCase();
    const badge = document.getElementById('posCustomerBadge');
    const badgeText = document.getElementById('posCustomerBadgeText');
    const phoneInput = document.getElementById('posCustomerPhone');

    const match = window.appDB.customers.find(c => c.name.toLowerCase() === trimmed);
    if (match) {
        if (phoneInput && !phoneInput.value && match.phone) {
            phoneInput.value = match.phone;
        }
        if (badge && badgeText) {
            badge.style.display = 'flex';
            badge.className = 'text-accent-emerald';
            badgeText.textContent = `عميل مسجل سابقاً [${match.ordersCount} فواتير سابقة]`;
        }
    } else if (trimmed.length > 2) {
        if (badge && badgeText) {
            badge.style.display = 'flex';
            badge.className = 'text-gold';
            badgeText.textContent = `عميل جديد - سيتم حفظه مع رقم هاتفه في قاعدة البيانات فور إصدار الفاتورة`;
        }
    } else {
        if (badge) badge.style.display = 'none';
    }
}
window.checkIfCustomerRegistered = checkIfCustomerRegistered;

// Helper: Quick Walk-In
function setQuickWalkInCustomer() {
    const nameInput = document.getElementById('posCustomerName');
    const phoneInput = document.getElementById('posCustomerPhone');
    const picker = document.getElementById('posCustomerQuickSelect');
    const badge = document.getElementById('posCustomerBadge');

    if (nameInput) nameInput.value = 'عميل نقدي';
    if (phoneInput) phoneInput.value = '';
    if (picker) picker.value = '';
    if (badge) badge.style.display = 'none';
    if (window.showToast) window.showToast('تم تعيين العميل: عميل نقدي سريع', 'info');
}
window.setQuickWalkInCustomer = setQuickWalkInCustomer;

    // Form Submit: Add Product
    const formAddProduct = document.getElementById('formAddProduct');
    if (formAddProduct) {
        formAddProduct.addEventListener('submit', (e) => {
            e.preventDefault();
            const categorySelect = document.getElementById('newProdCategory').value;
            const customCategoryVal = document.getElementById('newProdCustomCategory') ? document.getElementById('newProdCustomCategory').value : '';

            const data = {
                nameAr: document.getElementById('newProdNameAr').value,
                nameEn: document.getElementById('newProdNameEn').value,
                category: categorySelect,
                customCategory: customCategoryVal,
                cost: document.getElementById('newProdCost').value,
                price: document.getElementById('newProdPrice').value,
                stock: document.getElementById('newProdStock').value,
                sku: document.getElementById('newProdSku').value,
                image: document.getElementById('newProdImage').value || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=500&auto=format&fit=crop&q=80'
            };

            window.appInventory.addProduct(data);
            formAddProduct.reset();
            toggleCustomCategoryField('أغذية وسوبرماركت');
            if (addProductModal) addProductModal.classList.remove('active');
            showToast(`تمت إضافة "${data.nameAr}" (${data.category === 'custom' ? data.customCategory : data.category}) إلى المخزون بنجاح!`, 'success');
        });
    }

    // Form Submit: Edit Price
    const formEditPrice = document.getElementById('formEditPrice');
    if (formEditPrice) {
        formEditPrice.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = document.getElementById('editPriceTargetId').value;
            const newPrice = document.getElementById('editPriceNewInput').value;

            window.appInventory.changePrice(id, newPrice);
            const modal = document.getElementById('editPriceModal');
            if (modal) modal.classList.remove('active');
            showToast(`تم تحديث السعر في O(1) وتوثيق التغيير في الـ Stack`, 'success');
        });
    }

    // Form Submit: Edit Stock
    const formEditStock = document.getElementById('formEditStock');
    if (formEditStock) {
        formEditStock.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = document.getElementById('editStockTargetId').value;
            const delta = document.getElementById('editStockDeltaInput').value;

            window.appInventory.changeStock(id, delta);
            const modal = document.getElementById('editStockModal');
            if (modal) modal.classList.remove('active');
            showToast(`تم تعديل كمية المخزون وتوثيقها بالمكدس`, 'success');
        });
    }

    // POS Checkout button
    const checkoutBtn = document.getElementById('posCheckoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            window.posManager.checkout();
        });
    }

    // Print Receipt button
    const printReceiptBtn = document.getElementById('btnPrintReceipt');
    if (printReceiptBtn) {
        printReceiptBtn.addEventListener('click', () => {
            window.print();
        });
    }
}

function setupAddProductCalculator() {
    const costInput = document.getElementById('newProdCost');
    const priceInput = document.getElementById('newProdPrice');
    const marginDisplay = document.getElementById('calcMarginDisplay');
    const profitDisplay = document.getElementById('calcProfitDisplay');

    function updateCalc() {
        const cost = parseFloat(costInput.value) || 0;
        const price = parseFloat(priceInput.value) || 0;
        const profit = price - cost;
        const margin = price > 0 ? ((profit / price) * 100).toFixed(1) : 0;

        if (marginDisplay) marginDisplay.textContent = `${margin}%`;
        if (profitDisplay) profitDisplay.textContent = `$${profit.toFixed(2)}`;
    }

    if (costInput && priceInput) {
        costInput.addEventListener('input', updateCalc);
        priceInput.addEventListener('input', updateCalc);
    }
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast-message toast-${type}`;

    let icon = 'fa-info-circle';
    if (type === 'success') icon = 'fa-circle-check';
    if (type === 'warning') icon = 'fa-triangle-exclamation';
    if (type === 'danger') icon = 'fa-circle-xmark';

    toast.innerHTML = `
        <i class="fas ${icon}"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 400);
    }, 3500);
}

window.showToast = showToast;

function renderFinancialChart() {
    const ctx = document.getElementById('financialOverviewChart');
    if (!ctx || !window.Chart) return;

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'اليوم'],
            datasets: [
                {
                    label: 'المبيعات ($)',
                    data: [1800, 2400, 1950, 3100, 2800, 3900, 4850],
                    borderColor: '#00f2fe',
                    backgroundColor: 'rgba(0, 242, 254, 0.12)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 3
                },
                {
                    label: 'صافي الأرباح ($)',
                    data: [540, 720, 610, 950, 840, 1200, 1580],
                    borderColor: '#38ef7d',
                    backgroundColor: 'rgba(56, 239, 125, 0.1)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#a0aec0',
                        font: { family: 'Cairo' }
                    }
                }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: '#718096', font: { family: 'Cairo' } }
                },
                y: {
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: '#718096' }
                }
            }
        }
    });
}
