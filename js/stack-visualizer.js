/**
 * Stack Visualizer Component
 * Provides real-time interactive 3D/Glass visual animations for Stack operations (push, pop, peek)
 */

class StackVisualizer {
    constructor(containerId, logId, codeDisplayId) {
        this.container = document.getElementById(containerId);
        this.logContainer = document.getElementById(logId);
        this.codeDisplay = document.getElementById(codeDisplayId);
        this.initListeners();
    }

    initListeners() {
        if (!window.appActionStack) return;
        window.appActionStack.subscribe((eventType, item, stackInstance) => {
            this.handleStackEvent(eventType, item, stackInstance);
        });
    }

    handleStackEvent(eventType, item, stackInstance) {
        this.updateStats(stackInstance);
        this.updateCodeDisplay(eventType, item);
        this.appendLog(eventType, item);

        if (eventType === 'push') {
            this.renderPush(item, stackInstance);
        } else if (eventType === 'pop') {
            this.renderPop(item, stackInstance);
        } else if (eventType === 'peek') {
            this.renderPeek(item);
        } else if (eventType === 'clear') {
            this.renderClear();
        }
    }

    updateStats(stack) {
        const depthEl = document.getElementById('stackDepthIndicator');
        const capEl = document.getElementById('stackCapacityIndicator');
        const statusEl = document.getElementById('stackStatusBadge');

        if (depthEl) depthEl.textContent = stack.size();
        if (capEl) capEl.textContent = `${stack.size()} / ${stack.maxCapacity}`;
        if (statusEl) {
            if (stack.isEmpty()) {
                statusEl.textContent = window.i18n ? window.i18n.t('empty') : 'فارغ (Empty)';
                statusEl.className = 'badge badge-outline';
            } else {
                statusEl.textContent = `${stack.size()} ${window.i18n ? window.i18n.t('items') : 'عناصر'}`;
                statusEl.className = 'badge badge-primary';
            }
        }
    }

    updateCodeDisplay(action, item) {
        if (!this.codeDisplay) return;
        let code = '';
        const itemStr = item ? JSON.stringify({
            id: item.id,
            type: item.type,
            target: item.targetId,
            val: item.payload
        }, null, 2) : '';

        switch (action) {
            case 'push':
                code = `// Time Complexity: O(1)\nstack.push(${itemStr});\n// Size is now: ${window.appActionStack.size()}`;
                break;
            case 'pop':
                code = `// Time Complexity: O(1)\nconst removed = stack.pop();\n// Removed: ${item ? item.type : 'null'}\n// Size is now: ${window.appActionStack.size()}`;
                break;
            case 'peek':
                code = `// Time Complexity: O(1)\nconst currentTop = stack.peek();\n// Inspected: ${item ? item.type : 'null'} (Unchanged)`;
                break;
            case 'clear':
                code = `// Reset stack\nstack.clear();\n// Size: 0`;
                break;
            default:
                code = `// Stack idle\n// Ready for push, pop, peek`;
        }
        this.codeDisplay.textContent = code;
    }

    appendLog(action, item) {
        if (!this.logContainer) return;
        const entry = document.createElement('div');
        entry.className = `log-entry log-${action}`;
        const time = new Date().toLocaleTimeString();

        let detailText = '';
        if (item) {
            if (item.type === 'PRICE_UPDATE') {
                detailText = `[${item.payload.productName || item.targetId}] ${item.previousState?.price ?? ''} ➔ ${item.payload.newPrice}$`;
            } else if (item.type === 'STOCK_UPDATE') {
                detailText = `[${item.payload.productName || item.targetId}] Qty ${item.payload.delta > 0 ? '+' : ''}${item.payload.delta}`;
            } else if (item.type === 'SALE_TRANSACTION') {
                detailText = `Invoice #${item.payload.invoiceId} ($${item.payload.total})`;
            } else if (item.type === 'PRODUCT_ADD') {
                detailText = `Added: ${item.payload.name}`;
            } else if (item.type === 'PRODUCT_DELETE') {
                detailText = `Deleted: ${item.payload.name}`;
            } else {
                detailText = item.type;
            }
        }

        entry.innerHTML = `
            <span class="log-time">${time}</span>
            <span class="log-op-tag op-${action}">${action.toUpperCase()}</span>
            <span class="log-msg">${detailText}</span>
        `;

        this.logContainer.insertBefore(entry, this.logContainer.firstChild);

        // Keep last 40 logs
        while (this.logContainer.children.length > 40) {
            this.logContainer.removeChild(this.logContainer.lastChild);
        }
    }

    renderFullStack(stack) {
        if (!this.container) return;
        this.container.innerHTML = '';
        const items = stack.getItems();

        if (items.length === 0) {
            this.container.innerHTML = `
                <div class="empty-stack-placeholder">
                    <i class="fas fa-layer-group placeholder-icon"></i>
                    <p class="placeholder-title" data-i18n="stack_empty_title">المكدس فارغ حالياً</p>
                    <small data-i18n="stack_empty_desc">قم بتعديل الأسعار أو تنفيذ مبيعات لمشاهدة الـ Push مباشرة</small>
                </div>
            `;
            return;
        }

        // Render from top (last item in array) to bottom
        for (let i = items.length - 1; i >= 0; i--) {
            const isTop = (i === items.length - 1);
            const el = this.createStackCardElement(items[i], i, isTop);
            this.container.appendChild(el);
        }
    }

    createStackCardElement(item, index, isTop) {
        const card = document.createElement('div');
        card.id = `stack-card-${item.id}`;
        card.className = `stack-item-card ${isTop ? 'is-top' : ''}`;
        card.dataset.id = item.id;

        const timeStr = new Date(item.timestamp).toLocaleTimeString();
        let icon = 'fa-bolt';
        let typeBadge = item.type;
        let colorTheme = 'primary';

        if (item.type === 'PRICE_UPDATE') {
            icon = 'fa-tag';
            typeBadge = 'تعديل سعر';
            colorTheme = 'accent';
        } else if (item.type === 'STOCK_UPDATE') {
            icon = 'fa-boxes-stacked';
            typeBadge = 'تعديل كمية';
            colorTheme = 'info';
        } else if (item.type === 'SALE_TRANSACTION') {
            icon = 'fa-receipt';
            typeBadge = 'فاتورة بيع';
            colorTheme = 'success';
        } else if (item.type === 'PRODUCT_ADD') {
            icon = 'fa-plus-circle';
            typeBadge = 'إضافة منتج';
            colorTheme = 'warning';
        } else if (item.type === 'PRODUCT_DELETE') {
            icon = 'fa-trash';
            typeBadge = 'حذف منتج';
            colorTheme = 'danger';
        }

        let detailsHtml = '';
        if (item.type === 'PRICE_UPDATE') {
            detailsHtml = `
                <div class="stack-meta-price">
                    <span>${item.payload.productName || item.targetId}</span>
                    <strong class="price-change-pill">$${item.previousState?.price} ➔ $${item.payload.newPrice}</strong>
                </div>
            `;
        } else if (item.type === 'STOCK_UPDATE') {
            detailsHtml = `
                <div class="stack-meta-price">
                    <span>${item.payload.productName || item.targetId}</span>
                    <strong class="stock-change-pill">المخزون: ${item.payload.newStock}</strong>
                </div>
            `;
        } else if (item.type === 'SALE_TRANSACTION') {
            detailsHtml = `
                <div class="stack-meta-price">
                    <span>فاتورة #${item.payload.invoiceId}</span>
                    <strong class="text-success">+$${item.payload.total}</strong>
                </div>
            `;
        } else {
            detailsHtml = `<div>${item.payload.name || item.targetId}</div>`;
        }

        card.innerHTML = `
            <div class="stack-card-header">
                <div class="stack-card-type badge-${colorTheme}">
                    <i class="fas ${icon}"></i>
                    <span>${typeBadge}</span>
                </div>
                ${isTop ? '<span class="top-pointer-badge"><i class="fas fa-hand-point-down"></i> TOP [Index: ' + index + ']</span>' : '<span class="index-badge">#' + index + '</span>'}
            </div>
            <div class="stack-card-body">
                ${detailsHtml}
            </div>
            <div class="stack-card-footer">
                <span class="card-id-stamp">${item.id}</span>
                <span class="card-time">${timeStr}</span>
            </div>
        `;

        // Card click to peek this specific element
        card.addEventListener('click', () => {
            this.showItemDetailsModal(item, index, isTop);
        });

        return card;
    }

    renderPush(item, stack) {
        this.renderFullStack(stack);
        const topEl = this.container.querySelector('.is-top');
        if (topEl) {
            topEl.classList.add('animate-drop-bounce');
            setTimeout(() => topEl.classList.remove('animate-drop-bounce'), 800);
        }
    }

    renderPop(item, stack) {
        if (!item) return;
        const firstCard = this.container.querySelector('.stack-item-card');
        if (firstCard) {
            firstCard.classList.add('animate-pop-out');
            setTimeout(() => {
                this.renderFullStack(stack);
            }, 400);
        } else {
            this.renderFullStack(stack);
        }
    }

    renderPeek(item) {
        if (!item) return;
        const topCard = this.container.querySelector('.is-top');
        if (topCard) {
            topCard.classList.add('animate-peek-glow');
            setTimeout(() => topCard.classList.remove('animate-peek-glow'), 1600);
        }
        this.showItemDetailsModal(item, window.appActionStack.size() - 1, true);
    }

    renderClear() {
        if (this.container) {
            this.container.innerHTML = `
                <div class="empty-stack-placeholder">
                    <i class="fas fa-layer-group placeholder-icon"></i>
                    <p class="placeholder-title" data-i18n="stack_empty_title">المكدس فارغ حالياً</p>
                    <small data-i18n="stack_empty_desc">قم بتعديل الأسعار أو تنفيذ مبيعات لمشاهدة الـ Push مباشرة</small>
                </div>
            `;
        }
    }

    showItemDetailsModal(item, index, isTop) {
        const modal = document.getElementById('stackDetailModal');
        const contentEl = document.getElementById('stackDetailModalContent');
        if (!modal || !contentEl) return;

        contentEl.innerHTML = `
            <div class="modal-stack-inspector">
                <div class="inspector-header">
                    <div class="badge ${isTop ? 'badge-warning' : 'badge-primary'}">
                        ${isTop ? '★ TOP OF STACK' : `INDEX #${index}`}
                    </div>
                    <h4>${item.type}</h4>
                    <code>${item.id}</code>
                </div>
                <div class="inspector-json">
                    <pre><code>${JSON.stringify(item, null, 2)}</code></pre>
                </div>
                <div class="inspector-summary">
                    <p><strong>تاريخ العملية:</strong> ${new Date(item.timestamp).toLocaleString('ar')}</p>
                    <p><strong>الهدف:</strong> ${item.targetId}</p>
                    <p><strong>حالة سابقة:</strong> ${item.previousState ? JSON.stringify(item.previousState) : 'لا يوجد'}</p>
                </div>
            </div>
        `;
        modal.classList.add('active');
    }
}

window.StackVisualizer = StackVisualizer;
