/**
 * POS (Point of Sale) & Accounting Engine
 * Handles live cashier transactions, invoicing, receipt printing, and profit/loss calculations
 */

class POSManager {
    constructor() {
        this.cart = []; // [{ id, name, price, cost, qty, maxStock }]
        this.transactions = [];
        this.taxRate = 0.15; // 15% VAT
        this.discountPercent = 0;
        this.productsMap = window.appProductsMap;
        this.actionStack = window.appActionStack;

        this.initDemoTransactions();
        this.updateFinancialSummary();
    }

    initDemoTransactions() {
        const savedInvoices = localStorage.getItem('nexus_db_invoices');
        if (savedInvoices) {
            try {
                this.transactions = JSON.parse(savedInvoices);
                return;
            } catch (e) {
                console.warn('Failed to parse stored invoices');
            }
        }

        // Seed past sales transactions if empty
        const now = Date.now();
        const demoSales = [
            {
                invoiceId: 'INV-1092',
                timestamp: new Date(now - 3600 * 1000 * 5),
                customerName: 'عميل نقدي (Walk-in)',
                items: [
                    { id: 'PRD-102', name: 'آيفون 16 برو تيتانيوم', price: 1199, cost: 880, qty: 1 }
                ],
                subtotal: 1199,
                tax: 179.85,
                discount: 0,
                total: 1378.85,
                cogs: 880,
                profit: 319
            },
            {
                invoiceId: 'INV-1093',
                timestamp: new Date(now - 3600 * 1000 * 2),
                customerName: 'شركة النخبة للتقنية',
                items: [
                    { id: 'PRD-103', name: 'سماعات سوني سبيس ساوند', price: 399, cost: 260, qty: 2 },
                    { id: 'PRD-106', name: 'ساعة آبل الترا 2', price: 799, cost: 610, qty: 1 }
                ],
                subtotal: 1597,
                tax: 239.55,
                discount: 50,
                total: 1786.55,
                cogs: 1130,
                profit: 417
            }
        ];

        this.transactions = demoSales;
    }

    handleOutOfStockClick(productId) {
        const prod = this.productsMap.get(productId);
        const name = prod ? prod.nameAr : 'هذا المنتج';
        if (window.showToast) {
            window.showToast(`عذراً! ${name} نفد من المخزون تماماً (0) ولا يمكن بيعه. قم بإضافة كمية جديدة للمخزن أولاً.`, 'danger');
        }
    }

    addToCart(productId) {
        const prod = this.productsMap.get(productId);
        if (!prod) return;

        const availableStock = Number(prod.stock);

        if (availableStock <= 0) {
            this.handleOutOfStockClick(productId);
            return;
        }

        const existing = this.cart.find(item => item.id === productId);
        if (existing) {
            if (existing.qty + 1 > availableStock) {
                if (window.showToast) {
                    window.showToast(`عذراً! الكمية المطلوبة تتجاوز المخزون المتوفر (${availableStock}) فقط!`, 'warning');
                }
                return;
            }
            existing.qty += 1;
        } else {
            this.cart.push({
                id: prod.id,
                name: prod.nameAr,
                price: prod.price,
                cost: prod.cost,
                qty: 1,
                maxStock: availableStock,
                image: prod.image
            });
        }

        this.renderCart();
        if (window.showToast) window.showToast(`تمت إضافة ${prod.nameAr} إلى الفاتورة`, 'success');
    }

    updateCartQty(productId, newQty) {
        const item = this.cart.find(i => i.id === productId);
        if (!item) return;

        const prod = this.productsMap.get(productId);
        const currentStock = prod ? Number(prod.stock) : item.maxStock;

        if (currentStock <= 0) {
            this.removeFromCart(productId);
            if (window.showToast) window.showToast(`تمت إزالة ${item.name} من السلة لنفاد المخزون!`, 'danger');
            return;
        }

        if (newQty <= 0) {
            this.removeFromCart(productId);
            return;
        }

        if (newQty > currentStock) {
            if (window.showToast) window.showToast(`الكمية المتاحة في المخزن هي (${currentStock}) فقط!`, 'warning');
            item.qty = currentStock;
        } else {
            item.qty = newQty;
        }

        this.renderCart();
    }

    removeFromCart(productId) {
        this.cart = this.cart.filter(i => i.id !== productId);
        this.renderCart();
    }

    clearCart() {
        this.cart = [];
        this.discountPercent = 0;
        this.renderCart();
    }

    getCartTotals() {
        let subtotal = 0;
        let totalCost = 0;

        this.cart.forEach(item => {
            subtotal += item.price * item.qty;
            totalCost += item.cost * item.qty;
        });

        const discountAmount = (subtotal * this.discountPercent) / 100;
        const discountedSubtotal = Math.max(0, subtotal - discountAmount);
        const taxAmount = discountedSubtotal * this.taxRate;
        const grandTotal = discountedSubtotal + taxAmount;
        const netProfit = discountedSubtotal - totalCost;

        return {
            subtotal,
            discountAmount,
            discountPercent: this.discountPercent,
            taxAmount,
            grandTotal,
            totalCost,
            netProfit
        };
    }

    renderCart() {
        const cartList = document.getElementById('posCartItemsList');
        const countBadge = document.getElementById('posCartCount');
        const subtotalEl = document.getElementById('posCartSubtotal');
        const taxEl = document.getElementById('posCartTax');
        const discountEl = document.getElementById('posCartDiscount');
        const grandTotalEl = document.getElementById('posCartGrandTotal');
        const checkoutBtn = document.getElementById('posCheckoutBtn');

        if (!cartList) return;

        const totals = this.getCartTotals();

        if (countBadge) countBadge.textContent = this.cart.reduce((acc, i) => acc + i.qty, 0);
        if (subtotalEl) subtotalEl.textContent = `$${totals.subtotal.toFixed(2)}`;
        if (taxEl) taxEl.textContent = `$${totals.taxAmount.toFixed(2)}`;
        if (discountEl) discountEl.textContent = `-$${totals.discountAmount.toFixed(2)}`;
        if (grandTotalEl) grandTotalEl.textContent = `$${totals.grandTotal.toFixed(2)}`;

        if (checkoutBtn) {
            checkoutBtn.disabled = (this.cart.length === 0);
        }

        if (this.cart.length === 0) {
            cartList.innerHTML = `
                <div class="cart-empty-placeholder">
                    <i class="fas fa-cash-register"></i>
                    <p data-i18n="cart_empty_title">سلة الفاتورة فارغة</p>
                    <small data-i18n="cart_empty_hint">انقر على "بيع" من قائمة المنتجات لإضافتها فوراً</small>
                </div>
            `;
            return;
        }

        cartList.innerHTML = this.cart.map(item => `
            <div class="pos-cart-item">
                <img src="${item.image}" alt="" class="cart-item-thumb" />
                <div class="cart-item-details">
                    <h5 class="cart-item-title">${item.name}</h5>
                    <div class="cart-item-price-unit">$${item.price} للقطعة</div>
                    <div class="cart-item-controls">
                        <div class="qty-stepper">
                            <button onclick="window.posManager.updateCartQty('${item.id}', ${item.qty - 1})">-</button>
                            <input type="number" value="${item.qty}" min="1" max="${item.maxStock}" 
                                   onchange="window.posManager.updateCartQty('${item.id}', parseInt(this.value))" />
                            <button onclick="window.posManager.updateCartQty('${item.id}', ${item.qty + 1})">+</button>
                        </div>
                        <span class="cart-item-total">$${(item.price * item.qty).toFixed(2)}</span>
                        <button class="btn-remove-item" onclick="window.posManager.removeFromCart('${item.id}')" title="حذف">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    checkout() {
        if (this.cart.length === 0) return;

        // 0. PRE-FLIGHT VALIDATION: Strict stock check for every single item
        for (const item of this.cart) {
            const currentProd = this.productsMap.get(item.id);
            const available = currentProd ? Number(currentProd.stock) : 0;
            if (!currentProd || available <= 0) {
                if (window.showToast) {
                    window.showToast(`فشلت الفاتورة: الصنف (${item.name}) نفد من المخزون تماماً ولا يمكن بيعه!`, 'danger');
                }
                this.removeFromCart(item.id);
                return;
            }
            if (available < item.qty) {
                if (window.showToast) {
                    window.showToast(`فشلت الفاتورة: الكمية المطلوبة من (${item.name}) هي ${item.qty} بينما المتاح هو ${available} فقط!`, 'danger');
                }
                item.qty = available;
                this.renderCart();
                return;
            }
        }

        const totals = this.getCartTotals();
        const invoiceId = 'INV-' + Math.floor(1000 + Math.random() * 9000);
        const customerNameInput = document.getElementById('posCustomerName');
        const customerPhoneInput = document.getElementById('posCustomerPhone');
        const customerName = (customerNameInput && customerNameInput.value.trim()) ? customerNameInput.value.trim() : 'عميل نقدي';
        const customerPhone = (customerPhoneInput && customerPhoneInput.value.trim()) ? customerPhoneInput.value.trim() : '';

        // 1. Deduct stock from ProductsHashMap in O(1)
        const outOfStockAlerts = [];
        this.cart.forEach(item => {
            const res = this.productsMap.updateStock(item.id, -item.qty);
            if (res && res.newStock === 0) {
                outOfStockAlerts.push(item.name);
            }
        });

        // 2. Create Transaction Record
        const transaction = {
            invoiceId,
            timestamp: new Date(),
            customerName,
            customerPhone,
            items: [...this.cart],
            subtotal: totals.subtotal,
            discount: totals.discountAmount,
            tax: totals.taxAmount,
            total: totals.grandTotal,
            cogs: totals.totalCost,
            profit: totals.netProfit
        };

        this.transactions.unshift(transaction);

        // Save transaction permanently to LocalStorage
        try {
            localStorage.setItem('nexus_db_invoices', JSON.stringify(this.transactions));
        } catch (e) {
            console.error('Storage error', e);
        }

        // Record customer in CRM Database
        if (window.appDB) {
            window.appDB.recordCustomerPurchase(customerName, customerPhone, totals.grandTotal);
        }

        // 3. Push Audit Action to Stack (Supports Undo/Pop)
        const auditAction = new AuditAction('SALE_TRANSACTION', invoiceId, {
            invoiceId,
            total: totals.grandTotal.toFixed(2),
            items: [...this.cart],
            profit: totals.netProfit.toFixed(2)
        }, null);

        this.actionStack.push(auditAction);

        // 4. Update Financials
        this.updateFinancialSummary();
        this.renderTransactionsTable();

        // 5. Show Receipt Modal
        this.showReceiptModal(transaction);

        // 6. Reset Cart
        this.clearCart();
        if (customerNameInput) customerNameInput.value = '';
        if (customerPhoneInput) customerPhoneInput.value = '';

        const badgeEl = document.getElementById('posCustomerBadge');
        if (badgeEl) badgeEl.style.display = 'none';

        if (window.showToast) {
            window.showToast(`تم إصدار الفاتورة #${invoiceId} بنجاح!`, 'success');
            if (outOfStockAlerts.length > 0) {
                setTimeout(() => {
                    window.showToast(`تنبيه: لقد نفد مخزون (${outOfStockAlerts.join('، ')}) بعد هذه الفاتورة!`, 'warning');
                }, 1200);
            }
        }
    }

    revertTransaction(transactionPayload) {
        if (!transactionPayload) return;
        this.transactions = this.transactions.filter(t => t.invoiceId !== transactionPayload.invoiceId);
        this.updateFinancialSummary();
        this.renderTransactionsTable();
    }

    updateFinancialSummary() {
        let totalRevenue = 0;
        let totalCOGS = 0;
        let totalNetProfit = 0;
        let totalTax = 0;
        let totalItemsCount = 0;

        this.transactions.forEach(t => {
            totalRevenue += t.total;
            totalCOGS += t.cogs;
            totalNetProfit += t.profit;
            totalTax += t.tax || 0;
            if (t.items) {
                totalItemsCount += t.items.reduce((acc, it) => acc + (it.qty || 1), 0);
            }
        });

        const capitalPercent = totalRevenue > 0 ? ((totalCOGS / totalRevenue) * 100).toFixed(1) : '0';
        const profitPercent = totalRevenue > 0 ? ((totalNetProfit / totalRevenue) * 100).toFixed(1) : '0';

        // Update Top KPI cards
        const revEl = document.getElementById('kpiTotalRevenue');
        const profitEl = document.getElementById('kpiNetProfit');
        const salesCountEl = document.getElementById('kpiSalesCount');
        const marginEl = document.getElementById('kpiProfitMargin');

        if (revEl) revEl.textContent = `$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        if (profitEl) profitEl.textContent = `$${totalNetProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        if (salesCountEl) salesCountEl.textContent = this.transactions.length;
        if (marginEl) marginEl.textContent = `${profitPercent}%`;

        // Update mobile KPI preview pills
        const mobileRevEl = document.getElementById('kpiMobileRev');
        const mobileProfitEl = document.getElementById('kpiMobileProfit');
        if (mobileRevEl) mobileRevEl.textContent = `$${totalRevenue.toFixed(0)}`;
        if (mobileProfitEl) mobileProfitEl.textContent = `$${totalNetProfit.toFixed(0)}`;

        // Update live ticker
        const tickerRevenue = document.getElementById('tickerRevenue');
        const tickerProfit = document.getElementById('tickerProfit');
        if (tickerRevenue) tickerRevenue.textContent = `$${totalRevenue.toFixed(0)}`;
        if (tickerProfit) tickerProfit.textContent = `$${totalNetProfit.toFixed(0)}`;

        // Update The Executive Daily Accounting Table
        const tblRev = document.getElementById('dailyTableRevenue');
        const tblCap = document.getElementById('dailyTableCapital');
        const tblCapPct = document.getElementById('dailyTableCapitalPercent');
        const tblProfit = document.getElementById('dailyTableNetProfit');
        const tblProfitPct = document.getElementById('dailyTableProfitPercent');
        const tblVat = document.getElementById('dailyTableVat');
        const tblInvoices = document.getElementById('dailyTableInvoicesCount');
        const tblItemsSold = document.getElementById('dailyTableItemsSold');

        if (tblRev) tblRev.textContent = `$${totalRevenue.toFixed(2)}`;
        if (tblCap) tblCap.textContent = `$${totalCOGS.toFixed(2)}`;
        if (tblCapPct) tblCapPct.textContent = `${capitalPercent}% من الدخل`;
        if (tblProfit) tblProfit.textContent = `$${totalNetProfit.toFixed(2)}`;
        if (tblProfitPct) tblProfitPct.textContent = `${profitPercent}% ربح صافي`;
        if (tblVat) tblVat.textContent = `$${totalTax.toFixed(2)}`;
        if (tblInvoices) tblInvoices.textContent = `${this.transactions.length} فاتورة`;
        if (tblItemsSold) tblItemsSold.textContent = `${totalItemsCount} قطعة مباعة`;

        // Update the Split Ratio Visual Bar
        const ratioCapText = document.getElementById('ratioCapitalPercent');
        const ratioProfText = document.getElementById('ratioProfitPercent');
        const ratioCapBar = document.getElementById('ratioCapitalBar');
        const ratioProfBar = document.getElementById('ratioProfitBar');

        if (ratioCapText) ratioCapText.textContent = `${capitalPercent}% ($${totalCOGS.toFixed(2)})`;
        if (ratioProfText) ratioProfText.textContent = `${profitPercent}% ($${totalNetProfit.toFixed(2)})`;
        if (ratioCapBar) ratioCapBar.style.width = `${Math.max(5, Math.min(95, parseFloat(capitalPercent) || 50))}%`;
        if (ratioProfBar) ratioProfBar.style.width = `${Math.max(5, Math.min(95, parseFloat(profitPercent) || 50))}%`;
    }

    renderTransactionsTable() {
        const container = document.getElementById('accountingTransactionsTable');
        if (!container) return;

        if (this.transactions.length === 0) {
            container.innerHTML = `<tr><td colspan="6" class="text-center">لا توجد حركات مبيعات مسجلة حتى الآن</td></tr>`;
            return;
        }

        container.innerHTML = this.transactions.map(t => {
            const timeStr = new Date(t.timestamp).toLocaleTimeString('ar-EG');
            return `
                <tr>
                    <td><strong>#${t.invoiceId}</strong></td>
                    <td>${timeStr}</td>
                    <td>${t.customerName}</td>
                    <td>${t.items.length} أصناف</td>
                    <td><strong class="text-white">$${t.total.toFixed(2)}</strong></td>
                    <td><span class="badge badge-success">+$${t.profit.toFixed(2)}</span></td>
                    <td>
                        <button class="btn btn-xs btn-outline" onclick="window.posManager.reprintInvoice('${t.invoiceId}')" title="عرض وطباعة الفاتورة">
                            <i class="fas fa-print"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    reprintInvoice(invoiceId) {
        const tx = this.transactions.find(t => t.invoiceId === invoiceId);
        if (tx) {
            this.showReceiptModal(tx);
        }
    }

    showReceiptModal(tx) {
        const modal = document.getElementById('receiptModal');
        const content = document.getElementById('receiptModalContent');
        if (!modal || !content) return;

        content.innerHTML = `
            <div class="printable-receipt" id="printableReceipt">
                <div class="receipt-header">
                    <div class="receipt-brand">
                        <i class="fas fa-cash-register brand-icon"></i>
                        <h2>CLICK CASHIER | كليك كاشير</h2>
                    </div>
                    <p class="receipt-sub">فاتورة ضريبية مبسطة (Simplified Tax Invoice)</p>
                    <div class="receipt-meta">
                        <div><strong>رقم الفاتورة:</strong> ${tx.invoiceId}</div>
                        <div><strong>التاريخ:</strong> ${new Date(tx.timestamp).toLocaleString('ar-EG')}</div>
                        <div><strong>العميل:</strong> ${tx.customerName} ${tx.customerPhone ? `<span style="color: #0088cc;">(${tx.customerPhone})</span>` : ''}</div>
                        <div><strong>الرقم الضريبي:</strong> 310928374600003</div>
                    </div>
                </div>

                <div class="receipt-divider"></div>

                <table class="receipt-items-table">
                    <thead>
                        <tr>
                            <th>الصنف</th>
                            <th>الكمية</th>
                            <th>السعر</th>
                            <th>الإجمالي</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tx.items.map(i => `
                            <tr>
                                <td>${i.name}</td>
                                <td>${i.qty}</td>
                                <td>$${i.price}</td>
                                <td>$${(i.price * i.qty).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div class="receipt-divider"></div>

                <div class="receipt-calc-rows">
                    <div class="calc-row">
                        <span>المجموع الفرعي:</span>
                        <span>$${tx.subtotal.toFixed(2)}</span>
                    </div>
                    ${tx.discount > 0 ? `
                        <div class="calc-row text-danger">
                            <span>الخصم:</span>
                            <span>-$${tx.discount.toFixed(2)}</span>
                        </div>
                    ` : ''}
                    <div class="calc-row">
                        <span>ضريبة القيمة المضافة (15%):</span>
                        <span>$${tx.tax.toFixed(2)}</span>
                    </div>
                    <div class="calc-row total-row">
                        <span>الإجمالي النهائي:</span>
                        <span>$${tx.total.toFixed(2)}</span>
                    </div>
                </div>

                <div class="receipt-footer">
                    <div class="receipt-barcode">
                        <div class="barcode-lines"></div>
                        <code>*${tx.invoiceId}*</code>
                    </div>
                    <p class="thank-you-msg">شكراً لتسوقكم معنا! سعداء بخدمتكم دائماً</p>
                </div>
            </div>
        `;

        modal.classList.add('active');
    }
}

window.POSManager = POSManager;
