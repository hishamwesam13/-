/**
 * NexusCommerce Engine - Data Structures
 * 1. Stack: LIFO data structure with push, pop, peek, size, isEmpty for Price Audits and Action Undo/Redo.
 * 2. ProductsHashMap: O(1) Key-Value Store for high-speed product updates, price edits, and inventory lookup.
 */

class AuditAction {
    constructor(type, targetId, payload, previousState = null) {
        this.id = 'ACT_' + Math.random().toString(36).substring(2, 9).toUpperCase();
        this.type = type; // 'PRICE_UPDATE', 'STOCK_UPDATE', 'PRODUCT_ADD', 'PRODUCT_DELETE', 'SALE_TRANSACTION'
        this.targetId = targetId;
        this.payload = payload;
        this.previousState = previousState;
        this.timestamp = new Date();
    }
}

class ActionStack {
    constructor(maxCapacity = 30) {
        this.items = [];
        this.maxCapacity = maxCapacity;
        this.listeners = [];
    }

    /**
     * Push a new audit action onto the stack
     * Time Complexity: O(1)
     */
    push(action) {
        if (this.items.length >= this.maxCapacity) {
            // Drop the oldest item from bottom to maintain bounded capacity
            this.items.shift();
        }
        this.items.push(action);
        this.notify('push', action);
        return true;
    }

    /**
     * Remove and return the top action from the stack (Undo)
     * Time Complexity: O(1)
     */
    pop() {
        if (this.isEmpty()) {
            return null;
        }
        const popped = this.items.pop();
        this.notify('pop', popped);
        return popped;
    }

    /**
     * Inspect the top element without removing it
     * Time Complexity: O(1)
     */
    peek() {
        if (this.isEmpty()) {
            return null;
        }
        const topItem = this.items[this.items.length - 1];
        this.notify('peek', topItem);
        return topItem;
    }

    /**
     * Check if stack is empty
     */
    isEmpty() {
        return this.items.length === 0;
    }

    /**
     * Get current stack size
     */
    size() {
        return this.items.length;
    }

    /**
     * Return all items as an array copy (top is last element)
     */
    getItems() {
        return [...this.items];
    }

    /**
     * Clear all actions
     */
    clear() {
        this.items = [];
        this.notify('clear', null);
    }

    /**
     * Subscribe to stack changes
     */
    subscribe(callback) {
        this.listeners.push(callback);
    }

    notify(eventType, item) {
        this.listeners.forEach(callback => callback(eventType, item, this));
    }
}

class ProductsHashMap {
    constructor() {
        // Core hash map storing { [productId]: Product }
        this.map = {};
        this.listeners = [];
    }

    /**
     * Insert or update product
     * Time Complexity: O(1)
     */
    set(productId, product) {
        this.map[productId] = product;
        this.notify('set', product);
        return product;
    }

    /**
     * Get product by ID or SKU
     * Time Complexity: O(1)
     */
    get(productId) {
        return this.map[productId] || null;
    }

    /**
     * Check if product exists
     * Time Complexity: O(1)
     */
    has(productId) {
        return Object.prototype.hasOwnProperty.call(this.map, productId);
    }

    /**
     * Delete product by ID
     * Time Complexity: O(1)
     */
    delete(productId) {
        if (this.has(productId)) {
            const deleted = this.map[productId];
            delete this.map[productId];
            this.notify('delete', deleted);
            return deleted;
        }
        return null;
    }

    /**
     * Update price in O(1)
     */
    updatePrice(productId, newPrice) {
        const prod = this.get(productId);
        if (!prod) return null;
        const oldPrice = prod.price;
        prod.price = Number(newPrice);
        prod.updatedAt = new Date();
        this.notify('updatePrice', { prod, oldPrice, newPrice });
        return { prod, oldPrice, newPrice };
    }

    /**
     * Update stock quantity in O(1)
     */
    updateStock(productId, deltaQuantity) {
        const prod = this.get(productId);
        if (!prod) return null;
        const oldStock = prod.stock;
        prod.stock = Math.max(0, prod.stock + Number(deltaQuantity));
        prod.updatedAt = new Date();
        this.notify('updateStock', { prod, oldStock, newStock: prod.stock });
        return { prod, oldStock, newStock: prod.stock };
    }

    /**
     * Get all products as an array for filtering and rendering
     */
    getAll() {
        return Object.values(this.map);
    }

    /**
     * Count total items
     */
    count() {
        return Object.keys(this.map).length;
    }

    /**
     * Bulk load products
     */
    loadFromArray(productsArray) {
        productsArray.forEach(p => {
            this.map[p.id] = p;
        });
        this.notify('load', this.map);
    }

    subscribe(callback) {
        this.listeners.push(callback);
    }

    notify(event, data) {
        this.listeners.forEach(cb => cb(event, data, this));
    }
}

// Global instances
window.AuditAction = AuditAction;
window.ActionStack = ActionStack;
window.ProductsHashMap = ProductsHashMap;
window.appActionStack = new ActionStack(25);
window.appProductsMap = new ProductsHashMap();
