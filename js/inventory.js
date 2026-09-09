/**
 * NexusCommerce Inventory Management
 * Powered by ProductsHashMap for O(1) mutations & ActionStack for Undo/Audit
 */

class InventoryManager {
    constructor() {
        this.productsMap = window.appProductsMap;
        this.actionStack = window.appActionStack;
        this.currentFilterCategory = 'all';
        this.currentSearchQuery = '';
        this.currentStockFilter = 'all';
        this.viewMode = 'grid'; // 'grid' or 'table'

        this.initDefaultProducts();
        this.bindEvents();
    }

    initDefaultProducts() {
        const defaultItems = [
            {
                id: 'PRD-101',
                nameAr: 'عطر ليذر عود ملكي فاخر 100 مل',
                nameEn: 'Royal Leather Oud EDP 100ml',
                category: 'عطور ومستحضرات',
                cost: 45,
                price: 119,
                stock: 16,
                lowStockThreshold: 5,
                sku: 'PERF-OUD-100',
                image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=500&auto=format&fit=crop&q=80',
                rating: 4.9,
                createdAt: new Date()
            },
            {
                id: 'PRD-102',
                nameAr: 'بن قهوة كولومبية مختصة تحميص وسط 1 كجم',
                nameEn: 'Colombian Specialty Coffee Beans 1kg',
                category: 'أغذية وسوبرماركت',
                cost: 14,
                price: 28,
                stock: 25,
                lowStockThreshold: 8,
                sku: 'COF-COL-1KG',
                image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500&auto=format&fit=crop&q=80',
                rating: 4.8,
                createdAt: new Date()
            },
            {
                id: 'PRD-103',
                nameAr: 'حذاء سنيكرز رياضي جلد طبيعي مريح',
                nameEn: 'Classic Leather Running Sneakers',
                category: 'أزياء وملابس',
                cost: 38,
                price: 85,
                stock: 2, // Low stock on purpose
                lowStockThreshold: 5,
                sku: 'SHOE-SNK-42',
                image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=80',
                rating: 4.7,
                createdAt: new Date()
            },
            {
                id: 'PRD-104',
                nameAr: 'طقم شنيور ومفك لاسلكي احترافي 20V',
                nameEn: 'Professional 20V Cordless Drill Kit',
                category: 'أدوات ومعدات',
                cost: 65,
                price: 135,
                stock: 0, // OUT OF STOCK to test prevention
                lowStockThreshold: 4,
                sku: 'TOOL-DRL-20V',
                image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=500&auto=format&fit=crop&q=80',
                rating: 4.9,
                createdAt: new Date()
            },
            {
                id: 'PRD-105',
                nameAr: 'كرسي مكتب طبي داعم للفقرات شبكي',
                nameEn: 'Ergonomic Mesh Office Executive Chair',
                category: 'أثاث وديكور',
                cost: 90,
                price: 189,
                stock: 7,
                lowStockThreshold: 3,
                sku: 'FURN-CHR-ERG',
                image: 'https://images.unsplash.com/photo-1580481077194-469b81b85437?w=500&auto=format&fit=crop&q=80',
                rating: 4.9,
                createdAt: new Date()
            },
            {
                id: 'PRD-106',
                nameAr: 'سماعات رأس لاسلكية بخاصية إلغاء الضوضاء',
                nameEn: 'Wireless Noise Cancelling Headset',
                category: 'إلكترونيات وتقنية',
                cost: 110,
                price: 199,
                stock: 12,
                lowStockThreshold: 4,
                sku: 'TECH-AUD-ANC',
                image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80',
                rating: 4.8,
                createdAt: new Date()
            }
        ];

        this.productsMap.loadFromArray(defaultItems);
        this.updateDynamicCategories();
    }

    updateDynamicCategories() {
        const filtersContainer = document.getElementById('dynamicCategoryFilters');
        if (!filtersContainer) return;

        const allProds = this.productsMap.getAll();
        const categories = [...new Set(allProds.map(p => p.category).filter(Boolean))];

        const isAr = !window.i18n || window.i18n.currentLang === 'ar';

        let html = `
            <button class="filter-pill ${this.currentFilterCategory === 'all' ? 'active' : ''}" data-category="all">
                ${isAr ? 'كافة الأصناف' : 'All Categories'}
            </button>
        `;

        categories.forEach(cat => {
            const isActive = (this.currentFilterCategory === cat);
            html += `
                <button class="filter-pill ${isActive ? 'active' : ''}" data-category="${cat}">
                    ${cat}
                </button>
            `;
        });

        filtersContainer.innerHTML = html;

        // Rebind click listeners to dynamic pills
        filtersContainer.querySelectorAll('.filter-pill').forEach(pill => {
            pill.addEventListener('click', () => {
                filtersContainer.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
                this.currentFilterCategory = pill.dataset.category;
                this.renderProducts();
            });
        });
    }

    bindEvents() {
        this.productsMap.subscribe(() => {
            this.renderProducts();
            this.updateInventoryStats();
        });
    }

    /**
     * Add new product to HashMap and push audit action to Stack
     */
    addProduct(productData) {
        const id = 'PRD-' + Math.floor(100 + Math.random() * 900);
        
        let finalCategory = productData.category;
        if (finalCategory === 'custom' && productData.customCategory && productData.customCategory.trim()) {
            finalCategory = productData.customCategory.trim();
        } else if (!finalCategory || finalCategory === 'custom') {
            finalCategory = 'منتجات عامة';
        }

        const newProduct = {
            id,
            nameAr: productData.nameAr || 'منتج جديد',
            nameEn: productData.nameEn || productData.nameAr || 'New Product',
            category: finalCategory,
            cost: parseFloat(productData.cost) || 0,
            price: parseFloat(productData.price) || 0,
            stock: parseInt(productData.stock) >= 0 ? parseInt(productData.stock) : 0,
            lowStockThreshold: parseInt(productData.lowStockThreshold) || 5,
            sku: productData.sku || `SKU-${Date.now().toString().slice(-6)}`,
            image: productData.image || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=500&auto=format&fit=crop&q=80',
            rating: 5.0,
            createdAt: new Date()
        };

        // 1. O(1) insert into Hash Map
        this.productsMap.set(id, newProduct);

        // 2. Push to action stack for Undo / Audit
        const action = new AuditAction('PRODUCT_ADD', id, {
            name: newProduct.nameAr,
            price: newProduct.price,
            stock: newProduct.stock
        }, null);
        this.actionStack.push(action);

        this.updateDynamicCategories();

        return newProduct;
    }

    /**
     * Delete product from HashMap and push audit action
     */
    deleteProduct(id) {
        const existing = this.productsMap.get(id);
        if (!existing) return false;

        // 1. O(1) delete
        this.productsMap.delete(id);

        // 2. Push to stack with full backup in previousState for undo
        const action = new AuditAction('PRODUCT_DELETE', id, {
            name: existing.nameAr,
            id: existing.id
        }, existing);
        this.actionStack.push(action);

        this.updateDynamicCategories();

        return true;
    }

    /**
     * Change price in O(1) and record on Stack
     */
    changePrice(id, newPrice) {
        const prod = this.productsMap.get(id);
        if (!prod) return false;

        const oldPrice = prod.price;
        const res = this.productsMap.updatePrice(id, newPrice);
        if (!res) return false;

        // Push to stack
        const action = new AuditAction('PRICE_UPDATE', id, {
            productName: prod.nameAr,
            newPrice: parseFloat(newPrice)
        }, {
            price: oldPrice
        });
        this.actionStack.push(action);

        return true;
    }

    /**
     * Change stock quantity
     */
    changeStock(id, delta) {
        const prod = this.productsMap.get(id);
        if (!prod) return false;

        const oldStock = prod.stock;
        const res = this.productsMap.updateStock(id, delta);
        if (!res) return false;

        // Push to stack
        const action = new AuditAction('STOCK_UPDATE', id, {
            productName: prod.nameAr,
            delta: parseInt(delta),
            newStock: res.newStock
        }, {
            stock: oldStock
        });
        this.actionStack.push(action);

        if (res.newStock <= 0 && window.showToast) {
            window.showToast(`تنبيه: نفد مخزون المنتج (${prod.nameAr}) بالكامل! أصبح غير متاح للبيع.`, 'danger');
        }

        return true;
    }

    /**
     * Undo last action by popping from Stack
     */
    undoLastAction() {
        if (this.actionStack.isEmpty()) {
            return null;
        }

        const popped = this.actionStack.pop();
        if (!popped) return null;

        // Revert according to action type
        switch (popped.type) {
            case 'PRICE_UPDATE':
                if (popped.previousState && popped.previousState.price !== undefined) {
                    const currentProd = this.productsMap.get(popped.targetId);
                    if (currentProd) {
                        currentProd.price = popped.previousState.price;
                        this.productsMap.notify('updatePrice', { prod: currentProd, oldPrice: popped.payload.newPrice, newPrice: popped.previousState.price });
                    }
                }
                break;

            case 'STOCK_UPDATE':
                if (popped.previousState && popped.previousState.stock !== undefined) {
                    const currentProd = this.productsMap.get(popped.targetId);
                    if (currentProd) {
                        currentProd.stock = popped.previousState.stock;
                        this.productsMap.notify('updateStock', { prod: currentProd, oldStock: popped.payload.newStock, newStock: popped.previousState.stock });
                    }
                }
                break;

            case 'PRODUCT_ADD':
                this.productsMap.delete(popped.targetId);
                this.updateDynamicCategories();
                break;

            case 'PRODUCT_DELETE':
                if (popped.previousState) {
                    this.productsMap.set(popped.targetId, popped.previousState);
                    this.updateDynamicCategories();
                }
                break;

            case 'SALE_TRANSACTION':
                if (popped.payload && popped.payload.items) {
                    popped.payload.items.forEach(cartItem => {
                        this.productsMap.updateStock(cartItem.id, cartItem.qty);
                    });
                }
                if (window.posManager) {
                    window.posManager.revertTransaction(popped.payload);
                }
                break;
        }

        return popped;
    }

    /**
     * Filter and search products
     */
    getFilteredProducts() {
        const all = this.productsMap.getAll();
        return all.filter(p => {
            if (this.currentFilterCategory !== 'all' && p.category !== this.currentFilterCategory) {
                return false;
            }

            if (this.currentStockFilter === 'low' && (Number(p.stock) > p.lowStockThreshold || Number(p.stock) === 0)) {
                return false;
            }
            if (this.currentStockFilter === 'out' && Number(p.stock) > 0) {
                return false;
            }
            if (this.currentStockFilter === 'in' && Number(p.stock) <= 0) {
                return false;
            }

            if (this.currentSearchQuery) {
                const q = this.currentSearchQuery.toLowerCase();
                const matchNameAr = (p.nameAr || '').toLowerCase().includes(q);
                const matchNameEn = (p.nameEn || '').toLowerCase().includes(q);
                const matchCategory = (p.category || '').toLowerCase().includes(q);
                const matchSku = (p.sku || '').toLowerCase().includes(q);
                const matchId = (p.id || '').toLowerCase().includes(q);
                if (!matchNameAr && !matchNameEn && !matchCategory && !matchSku && !matchId) {
                    return false;
                }
            }

            return true;
        });
    }

    renderProducts() {
        const gridContainer = document.getElementById('productsGridContainer');
        const tableContainer = document.getElementById('productsTableContainer');
        const posQuickGrid = document.getElementById('posProductsQuickGrid');
        const countBadge = document.getElementById('productsCountBadge');

        const items = this.getFilteredProducts();

        if (countBadge) countBadge.textContent = `${items.length} ${window.i18n ? window.i18n.t('product_unit') : 'منتج'}`;

        if (this.viewMode === 'grid' && gridContainer) {
            if (tableContainer) tableContainer.style.display = 'none';
            gridContainer.style.display = 'grid';
            this.renderGridView(gridContainer, items);
        } else if (this.viewMode === 'table' && tableContainer) {
            if (gridContainer) gridContainer.style.display = 'none';
            tableContainer.style.display = 'block';
            this.renderTableView(tableContainer, items);
        }

        if (posQuickGrid) {
            this.renderPosQuickGrid(posQuickGrid, this.productsMap.getAll());
        }
    }

    renderPosQuickGrid(container, items) {
        const isAr = !window.i18n || window.i18n.currentLang === 'ar';
        container.innerHTML = items.map(p => {
            const isOutOfStock = Number(p.stock) <= 0;
            return `
                <div class="product-card pos-quick-card ${isOutOfStock ? 'pos-card-out-of-stock' : ''}" 
                     onclick="${isOutOfStock ? `window.posManager.handleOutOfStockClick('${p.id}')` : `window.posManager.addToCart('${p.id}')`}" 
                     style="cursor: ${isOutOfStock ? 'not-allowed' : 'pointer'}; ${isOutOfStock ? 'opacity: 0.55; border-color: rgba(255, 65, 108, 0.4);' : ''}">
                    <div class="card-media" style="height: 120px; position: relative;">
                        <img src="${p.image}" alt="${p.nameAr}" loading="lazy" />
                        <span class="category-tag">${p.category}</span>
                        ${isOutOfStock ? `
                            <div class="out-of-stock-pos-banner">
                                <i class="fas fa-ban"></i> نفد المخزون
                            </div>
                        ` : ''}
                    </div>
                    <div class="card-content" style="padding: 10px;">
                        <h4 style="font-size: 0.85rem; height: 34px; margin-bottom: 6px; overflow: hidden;">${isAr ? p.nameAr : p.nameEn}</h4>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <strong class="text-accent" style="font-size: 1rem;">$${p.price}</strong>
                            <span class="badge ${isOutOfStock ? 'badge-danger' : 'badge-primary'}">
                                ${isOutOfStock ? 'غير متاح (0)' : `${p.stock} متوفر`}
                            </span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderGridView(container, items) {
        if (items.length === 0) {
            container.innerHTML = `
                <div class="empty-state-box">
                    <i class="fas fa-search"></i>
                    <h3 data-i18n="no_products_found">لا توجد منتجات مطابقة</h3>
                    <p data-i18n="no_products_hint">جرب تغيير كلمات البحث أو الفلاتر</p>
                </div>
            `;
            return;
        }

        const isAr = !window.i18n || window.i18n.currentLang === 'ar';

        container.innerHTML = items.map(p => {
            const margin = Math.round(((p.price - p.cost) / p.price) * 100);
            const isOutOfStock = Number(p.stock) <= 0;
            const isLowStock = !isOutOfStock && Number(p.stock) <= p.lowStockThreshold;

            let stockStatusHtml = '';
            if (isOutOfStock) {
                stockStatusHtml = `<span class="stock-pill stock-out"><i class="fas fa-ban"></i> نفد المخزون تماماً (0)</span>`;
            } else if (isLowStock) {
                stockStatusHtml = `<span class="stock-pill stock-low"><i class="fas fa-triangle-exclamation"></i> كمية منخفضة (${p.stock})</span>`;
            } else {
                stockStatusHtml = `<span class="stock-pill stock-good"><i class="fas fa-circle-check"></i> متوفر (${p.stock})</span>`;
            }

            return `
                <div class="product-card ${isOutOfStock ? 'card-out-of-stock' : ''}" data-product-id="${p.id}">
                    <div class="card-media">
                        <img src="${p.image}" alt="${p.nameAr}" loading="lazy" style="${isOutOfStock ? 'filter: grayscale(80%);' : ''}" />
                        <span class="category-tag">${p.category}</span>
                        <div class="quick-stock-badge">${stockStatusHtml}</div>
                        ${isOutOfStock ? `
                            <div class="card-out-watermark">
                                <span><i class="fas fa-circle-xmark"></i> غير متوفر للبيع</span>
                            </div>
                        ` : ''}
                    </div>
                    <div class="card-content">
                        <div class="card-header-row">
                            <span class="sku-code">${p.sku}</span>
                            <span class="product-id-tag">${p.id}</span>
                        </div>
                        <h4 class="product-title" title="${isAr ? p.nameAr : p.nameEn}">
                            ${isAr ? p.nameAr : p.nameEn}
                        </h4>
                        
                        <div class="financial-metrics">
                            <div class="metric-box">
                                <span class="metric-label" data-i18n="selling_price">سعر البيع</span>
                                <span class="metric-value price-highlight">$${p.price.toLocaleString()}</span>
                            </div>
                            <div class="metric-box">
                                <span class="metric-label" data-i18n="cost_price">التكلفة</span>
                                <span class="metric-value text-muted">$${p.cost.toLocaleString()}</span>
                            </div>
                            <div class="metric-box">
                                <span class="metric-label" data-i18n="margin">الربح</span>
                                <span class="metric-value margin-profit">+${margin}%</span>
                            </div>
                        </div>

                        <div class="stock-progress-wrap">
                            <div class="stock-progress-bar">
                                <div class="progress-fill ${isOutOfStock ? 'bg-danger' : (isLowStock ? 'bg-warning' : 'bg-success')}" 
                                     style="width: ${isOutOfStock ? '100%' : Math.min(100, (p.stock / 30) * 100) + '%'};"></div>
                            </div>
                        </div>

                        <div class="card-actions-row">
                            <button class="btn btn-secondary btn-sm" onclick="appInventory.openEditPriceModal('${p.id}')" title="تعديل السعر O(1)">
                                <i class="fas fa-dollar-sign"></i> <span data-i18n="edit_price">السعر</span>
                            </button>
                            <button class="btn btn-secondary btn-sm" onclick="appInventory.openEditStockModal('${p.id}')" title="تعديل الكمية O(1)">
                                <i class="fas fa-boxes-stacked"></i> <span data-i18n="edit_stock">الكمية</span>
                            </button>
                            ${isOutOfStock ? `
                                <button class="btn btn-secondary btn-sm" disabled style="opacity: 0.4; cursor: not-allowed; pointer-events: none;" title="نفد المخزون تماماً">
                                    <i class="fas fa-ban text-danger"></i> <span class="text-danger">خالص</span>
                                </button>
                            ` : `
                                <button class="btn btn-primary btn-sm" onclick="window.posManager.addToCart('${p.id}')" title="إضافة لنقطة البيع">
                                    <i class="fas fa-cart-plus"></i> <span data-i18n="sell">بيع</span>
                                </button>
                            `}
                            <button class="btn btn-danger-outline btn-sm btn-icon-only" onclick="appInventory.confirmDelete('${p.id}')" title="حذف">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderTableView(container, items) {
        const isAr = !window.i18n || window.i18n.currentLang === 'ar';
        container.innerHTML = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th data-i18n="product">المنتج</th>
                        <th>SKU</th>
                        <th data-i18n="category">الفئة</th>
                        <th data-i18n="cost_price">سعر التكلفة</th>
                        <th data-i18n="selling_price">سعر البيع</th>
                        <th data-i18n="margin">هامش الربح</th>
                        <th data-i18n="stock">المخزون</th>
                        <th data-i18n="actions">الإجراءات</th>
                    </tr>
                </thead>
                <tbody>
                    ${items.map(p => {
                        const margin = Math.round(((p.price - p.cost) / p.price) * 100);
                        return `
                            <tr>
                                <td>
                                    <div class="table-product-cell">
                                        <img src="${p.image}" alt="" class="table-thumb" />
                                        <div>
                                            <strong>${isAr ? p.nameAr : p.nameEn}</strong>
                                            <small class="text-muted block">${p.id}</small>
                                        </div>
                                    </div>
                                </td>
                                <td><code>${p.sku}</code></td>
                                <td><span class="badge badge-outline">${p.category}</span></td>
                                <td>$${p.cost}</td>
                                <td><strong class="text-accent">$${p.price}</strong></td>
                                <td><span class="badge badge-success">+${margin}%</span></td>
                                <td>
                                    <span class="badge ${p.stock === 0 ? 'badge-danger' : (p.stock <= p.lowStockThreshold ? 'badge-warning' : 'badge-primary')}">
                                        ${p.stock}
                                    </span>
                                </td>
                                <td>
                                    <div class="table-action-btns">
                                        <button class="btn btn-xs btn-secondary" onclick="appInventory.openEditPriceModal('${p.id}')">تعديل السعر</button>
                                        <button class="btn btn-xs btn-secondary" onclick="appInventory.openEditStockModal('${p.id}')">الكمية</button>
                                        <button class="btn btn-xs btn-primary" onclick="window.posManager.addToCart('${p.id}')">بيع</button>
                                        <button class="btn btn-xs btn-danger-outline" onclick="appInventory.confirmDelete('${p.id}')"><i class="fas fa-trash"></i></button>
                                    </div>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;
    }

    updateInventoryStats() {
        const all = this.productsMap.getAll();
        const totalCount = all.length;
        let totalValue = 0;
        let totalCost = 0;
        let lowStockCount = 0;
        let outOfStockCount = 0;

        all.forEach(p => {
            totalValue += p.price * p.stock;
            totalCost += p.cost * p.stock;
            if (p.stock === 0) outOfStockCount++;
            else if (p.stock <= p.lowStockThreshold) lowStockCount++;
        });

        const potentialProfit = Math.max(0, totalValue - totalCost);

        // Update DOM elements
        const totalValEl = document.getElementById('kpiTotalInventoryValue');
        const totalProdsEl = document.getElementById('kpiTotalProducts');
        const lowStockEl = document.getElementById('kpiLowStockCount');
        const potentialProfitEl = document.getElementById('kpiPotentialProfit');

        if (totalValEl) totalValEl.textContent = `$${totalValue.toLocaleString()}`;
        if (totalProdsEl) totalProdsEl.textContent = totalCount;
        if (lowStockEl) lowStockEl.textContent = lowStockCount;
        if (potentialProfitEl) potentialProfitEl.textContent = `$${potentialProfit.toLocaleString()}`;
    }

    openEditPriceModal(id) {
        const prod = this.productsMap.get(id);
        if (!prod) return;

        const modal = document.getElementById('editPriceModal');
        const titleEl = document.getElementById('editPriceProdName');
        const currentPriceEl = document.getElementById('editPriceCurrent');
        const newPriceInput = document.getElementById('editPriceNewInput');
        const prodIdInput = document.getElementById('editPriceTargetId');

        if (!modal) return;
        titleEl.textContent = prod.nameAr;
        currentPriceEl.textContent = `$${prod.price}`;
        newPriceInput.value = prod.price;
        prodIdInput.value = prod.id;

        modal.classList.add('active');
    }

    openEditStockModal(id) {
        const prod = this.productsMap.get(id);
        if (!prod) return;

        const modal = document.getElementById('editStockModal');
        const titleEl = document.getElementById('editStockProdName');
        const currentStockEl = document.getElementById('editStockCurrent');
        const deltaInput = document.getElementById('editStockDeltaInput');
        const prodIdInput = document.getElementById('editStockTargetId');

        if (!modal) return;
        titleEl.textContent = prod.nameAr;
        currentStockEl.textContent = prod.stock;
        deltaInput.value = 5;
        prodIdInput.value = prod.id;

        modal.classList.add('active');
    }

    confirmDelete(id) {
        const prod = this.productsMap.get(id);
        if (!prod) return;

        const isConfirmed = confirm(`هل أنت متأكد من حذف المنتج: ${prod.nameAr}؟\n(ملاحظة: يمكنك التراجع عن الحذف في أي وقت عبر الـ Stack Undo)`);
        if (isConfirmed) {
            this.deleteProduct(id);
            if (window.showToast) {
                window.showToast(`تم حذف ${prod.nameAr} بنجاح. يمكنك التراجع عبر الـ Pop/Undo`, 'info');
            }
        }
    }
}

window.InventoryManager = InventoryManager;
