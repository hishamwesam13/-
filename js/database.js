/**
 * NexusCommerce - Local Database & CRM Persistence Manager
 * Uses LocalStorage / IndexedDB structure for storing Products, Customers, Invoices, and Settings.
 */

class AppDatabase {
    constructor() {
        this.STORAGE_KEYS = {
            PRODUCTS: 'nexus_db_products',
            CUSTOMERS: 'nexus_db_customers',
            INVOICES: 'nexus_db_invoices',
            SETTINGS: 'nexus_db_settings',
            ACTIONS: 'nexus_db_actions'
        };

        this.initSettings();
        this.initCustomers();
    }

    initSettings() {
        const defaultSettings = {
            storeNameAr: 'كليك كاشير',
            storeNameEn: 'ClickCashier',
            tagline: 'منظومة نقاط البيع والمحاسبة التجارية الذكية',
            taxNumber: '310928374600003',
            currency: '$',
            phone: '+966 50 123 4567',
            address: 'المملكة العربية السعودية - الرياض'
        };

        const saved = localStorage.getItem(this.STORAGE_KEYS.SETTINGS);
        if (saved) {
            try {
                this.settings = JSON.parse(saved);
                // Ensure name is ClickCashier if it was previous default
                if (this.settings.storeNameAr === 'نيكسوس برو' || !this.settings.storeNameAr) {
                    this.settings.storeNameAr = 'كليك كاشير';
                    this.settings.storeNameEn = 'ClickCashier';
                    localStorage.setItem(this.STORAGE_KEYS.SETTINGS, JSON.stringify(this.settings));
                }
            } catch (e) {
                this.settings = defaultSettings;
            }
        } else {
            this.settings = defaultSettings;
            localStorage.setItem(this.STORAGE_KEYS.SETTINGS, JSON.stringify(this.settings));
        }

        this.applySettingsToDOM();
    }

    saveSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        localStorage.setItem(this.STORAGE_KEYS.SETTINGS, JSON.stringify(this.settings));
        this.applySettingsToDOM();
        if (window.showToast) window.showToast('تم حفظ إعدادات واسم المتجر بنجاح!', 'success');
    }

    applySettingsToDOM() {
        const brandHeaders = document.querySelectorAll('.brand-dynamic-name');
        brandHeaders.forEach(el => {
            el.textContent = this.settings.storeNameAr;
        });

        const brandSubs = document.querySelectorAll('.brand-dynamic-tagline');
        brandSubs.forEach(el => {
            el.textContent = this.settings.tagline;
        });

        // Update inputs in settings modal if open
        const nameInput = document.getElementById('settingStoreName');
        const taxInput = document.getElementById('settingTaxNumber');
        const phoneInput = document.getElementById('settingPhone');
        const addrInput = document.getElementById('settingAddress');

        if (nameInput) nameInput.value = this.settings.storeNameAr;
        if (taxInput) taxInput.value = this.settings.taxNumber;
        if (phoneInput) phoneInput.value = this.settings.phone;
        if (addrInput) addrInput.value = this.settings.address;
    }

    initCustomers() {
        const saved = localStorage.getItem(this.STORAGE_KEYS.CUSTOMERS);
        if (saved) {
            this.customers = JSON.parse(saved);
        } else {
            // Seed realistic initial customers
            this.customers = [
                {
                    id: 'CUST-101',
                    name: 'شركة النخبة للتقنية والاستيراد',
                    phone: '0501122334',
                    email: 'info@elitetrade.com',
                    totalSpent: 3573.10,
                    ordersCount: 2,
                    lastOrderDate: new Date().toISOString(),
                    notes: 'عميل جملة تجاري موثوق'
                },
                {
                    id: 'CUST-102',
                    name: 'مؤسسة الأفق للتجارة العامة',
                    phone: '0559988776',
                    email: 'contact@alofooq.sa',
                    totalSpent: 1786.55,
                    ordersCount: 1,
                    lastOrderDate: new Date().toISOString(),
                    notes: 'دفع نقدي فوري'
                },
                {
                    id: 'CUST-103',
                    name: 'سالم عبد الله القحطاني',
                    phone: '0543322110',
                    email: 'salem.q@gmail.com',
                    totalSpent: 850.00,
                    ordersCount: 3,
                    lastOrderDate: new Date().toISOString(),
                    notes: 'عميل أفراد دائم'
                }
            ];
            this.saveCustomers();
        }
        this.updatePosCustomersPicker();
    }

    saveCustomers() {
        localStorage.setItem(this.STORAGE_KEYS.CUSTOMERS, JSON.stringify(this.customers));
        this.renderCustomersTable();
    }

    getAllCustomers() {
        return this.customers;
    }

    getCustomerByName(name) {
        if (!name) return null;
        return this.customers.find(c => c.name.toLowerCase().trim() === name.toLowerCase().trim());
    }

    recordCustomerPurchase(customerName, customerPhone, invoiceTotal) {
        const trimmedName = customerName ? customerName.trim() : 'عميل نقدي';
        const phone = customerPhone ? customerPhone.trim() : '';

        if (trimmedName === 'عميل نقدي' && !phone) {
            return;
        }

        let customer = this.getCustomerByName(trimmedName);
        if (!customer && phone) {
            customer = this.customers.find(c => c.phone && c.phone === phone);
        }

        if (customer) {
            customer.totalSpent += Number(invoiceTotal);
            customer.ordersCount += 1;
            customer.lastOrderDate = new Date().toISOString();
            if (phone && !customer.phone) {
                customer.phone = phone;
            }
        } else {
            customer = {
                id: 'CUST-' + Math.floor(100 + Math.random() * 900),
                name: trimmedName,
                phone: phone,
                email: '',
                totalSpent: Number(invoiceTotal),
                ordersCount: 1,
                lastOrderDate: new Date().toISOString(),
                notes: 'عميل مسجل عبر نقطة البيع'
            };
            this.customers.push(customer);
        }

        this.saveCustomers();
        this.updatePosCustomersPicker();
    }

    updatePosCustomersPicker() {
        const datalist = document.getElementById('registeredCustomersDatalist');
        const selectPicker = document.getElementById('posCustomerQuickSelect');

        if (datalist) {
            datalist.innerHTML = this.customers.map(c => 
                `<option value="${c.name}">${c.phone ? c.phone + ' - ' : ''}إجمالي مشتريات: $${Number(c.totalSpent).toFixed(0)}</option>`
            ).join('');
        }

        if (selectPicker) {
            selectPicker.innerHTML = `
                <option value="">-- استدعاء عميل مسجل من قاعدة البيانات --</option>
                ${this.customers.map(c => `
                    <option value="${c.id}" data-name="${c.name}" data-phone="${c.phone || ''}">
                        ${c.name} ${c.phone ? '(' + c.phone + ')' : ''} - [${c.ordersCount} فواتير]
                    </option>
                `).join('')}
            `;
        }
    }

    addCustomer(data) {
        const newCust = {
            id: 'CUST-' + Math.floor(100 + Math.random() * 900),
            name: data.name,
            phone: data.phone || '',
            email: data.email || '',
            totalSpent: parseFloat(data.initialSpent) || 0,
            ordersCount: parseInt(data.initialOrders) || 0,
            lastOrderDate: new Date().toISOString(),
            notes: data.notes || ''
        };
        this.customers.unshift(newCust);
        this.saveCustomers();
        return newCust;
    }

    deleteCustomer(id) {
        this.customers = this.customers.filter(c => c.id !== id);
        this.saveCustomers();
    }

    renderCustomersTable() {
        const container = document.getElementById('customersListTable');
        const countBadge = document.getElementById('customersCountBadge');
        if (!container) return;

        if (countBadge) countBadge.textContent = `${this.customers.length} عميل مسجل`;

        if (this.customers.length === 0) {
            container.innerHTML = `<tr><td colspan="7" class="text-center" style="padding: 24px;">لا يوجد عملاء مسجلون حتى الآن</td></tr>`;
            return;
        }

        container.innerHTML = this.customers.map(c => `
            <tr>
                <td><strong>${c.name}</strong></td>
                <td><code>${c.id}</code></td>
                <td><i class="fas fa-phone text-cyan"></i> ${c.phone || 'غير مسجل'}</td>
                <td><span class="badge badge-primary">${c.ordersCount} فواتير</span></td>
                <td><strong class="text-accent-emerald" style="font-size: 1rem;">$${Number(c.totalSpent).toFixed(2)}</strong></td>
                <td><small class="text-muted">${new Date(c.lastOrderDate).toLocaleDateString('ar-EG')}</small></td>
                <td>
                    <button class="btn btn-xs btn-danger-outline" onclick="window.appDB.deleteCustomer('${c.id}')" title="حذف العميل">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    /**
     * Export Full Database as JSON Backup
     */
    exportBackupJSON() {
        const backupData = {
            version: '2.0',
            exportedAt: new Date().toISOString(),
            settings: this.settings,
            customers: this.customers,
            products: window.appProductsMap ? window.appProductsMap.getAll() : [],
            invoices: window.posManager ? window.posManager.transactions : []
        };

        const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `NexusCommerce_Backup_${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);

        if (window.showToast) window.showToast('تم تصدير قاعدة البيانات وحفظ النسخة الاحتياطية بنجاح!', 'success');
    }

    /**
     * Import Database from JSON Backup
     */
    importBackupJSON(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data.customers) {
                    this.customers = data.customers;
                    this.saveCustomers();
                }
                if (data.settings) {
                    this.saveSettings(data.settings);
                }
                if (data.products && window.appProductsMap) {
                    window.appProductsMap.loadFromArray(data.products);
                }
                if (data.invoices && window.posManager) {
                    window.posManager.transactions = data.invoices;
                    window.posManager.updateFinancialSummary();
                    window.posManager.renderTransactionsTable();
                }
                if (window.showToast) window.showToast('تمت استعادة قاعدة البيانات بنجاح!', 'success');
            } catch (err) {
                alert('فشل استيراد الملف: تنسيق JSON غير صالح!');
            }
        };
        reader.readAsText(file);
    }
}

window.AppDatabase = AppDatabase;
window.appDB = new AppDatabase();
