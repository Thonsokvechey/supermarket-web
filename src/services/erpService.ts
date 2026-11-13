import type {
  Department,
  Employee,
  Position,
  PosTransaction,
  Product,
  PurchaseOrder,
  Supplier,
} from '../types';

const STORAGE_KEYS = {
  DEPARTMENTS: 'sm_departments_v1',
  POSITIONS: 'sm_positions_v1',
  EMPLOYEES: 'sm_employees_v1',
  PRODUCTS: 'sm_products_v1',
  SUPPLIERS: 'sm_suppliers_v1',
  PURCHASE_ORDERS: 'sm_purchase_orders_v1',
  POS_TRANSACTIONS: 'sm_pos_transactions_v1',
};

const DEFAULT_DEPARTMENTS: Department[] = [
  {
    id: 'dept-1',
    branchId: 'main',
    branchName: 'Main Branch',
    name: 'Store Operations & Cashier',
    description: 'Front-end checkout, customer service, and floor staff',
    isActive: true,
  },
  {
    id: 'dept-2',
    branchId: 'main',
    branchName: 'Inventory & Warehouse',
    description: 'Stock receiving, shelf replenishment, and cold storage',
    isActive: true,
  },
  {
    id: 'dept-3',
    branchId: 'main',
    branchName: 'Finance & Administration',
    description: 'Accounting, purchasing, and HR management',
    isActive: true,
  },
];

const DEFAULT_POSITIONS: Position[] = [
  {
    id: 'pos-1',
    departmentId: 'dept-1',
    departmentName: 'Store Operations & Cashier',
    title: 'Senior Cashier',
    description: 'Handles POS terminal, KHQR & cash reconciliation',
    isActive: true,
  },
  {
    id: 'pos-2',
    departmentId: 'dept-2',
    departmentName: 'Inventory & Warehouse',
    title: 'Inventory Supervisor',
    description: 'Manages stock counts, expiry checks, and GRN',
    isActive: true,
  },
  {
    id: 'pos-3',
    departmentId: 'dept-3',
    departmentName: 'Finance & Administration',
    title: 'Branch Accountant',
    description: 'Manages daily settlement, exchange rates, and supplier payouts',
    isActive: true,
  },
];

const DEFAULT_EMPLOYEES: Employee[] = [
  {
    id: 'emp-1',
    code: 'EMP-001',
    fullName: 'Sokha Chan',
    email: 'sokha.chan@supermarket.kh',
    phone: '+855 12 345 678',
    departmentId: 'dept-1',
    departmentName: 'Store Operations & Cashier',
    positionId: 'pos-1',
    positionTitle: 'Senior Cashier',
    branchId: 'main',
    branchName: 'Main Branch',
    salaryUsd: 420,
    hireDate: '2025-02-15',
    isActive: true,
  },
  {
    id: 'emp-2',
    code: 'EMP-002',
    fullName: 'Dara Pich',
    email: 'dara.pich@supermarket.kh',
    phone: '+855 17 889 102',
    departmentId: 'dept-2',
    departmentName: 'Inventory & Warehouse',
    positionId: 'pos-2',
    positionTitle: 'Inventory Supervisor',
    branchId: 'main',
    branchName: 'Main Branch',
    salaryUsd: 650,
    hireDate: '2024-08-01',
    isActive: true,
  },
  {
    id: 'emp-3',
    code: 'EMP-003',
    fullName: 'Bopha Meas',
    email: 'bopha.meas@supermarket.kh',
    phone: '+855 96 441 220',
    departmentId: 'dept-3',
    departmentName: 'Finance & Administration',
    positionId: 'pos-3',
    positionTitle: 'Branch Accountant',
    branchId: 'main',
    branchName: 'Main Branch',
    salaryUsd: 780,
    hireDate: '2024-05-10',
    isActive: true,
  },
];

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'prd-1',
    sku: 'BEV-001',
    barcode: '884600100101',
    name: 'Cambodia Premium Mineral Water 1.5L',
    category: 'Beverages',
    unit: 'Bottle',
    costPriceUsd: 0.35,
    sellingPriceUsd: 0.65,
    stockQuantity: 240,
    reorderLevel: 50,
    isActive: true,
  },
  {
    id: 'prd-2',
    sku: 'GRO-002',
    barcode: '884600100102',
    name: 'Phka Rumduol Jasmine Rice 5kg',
    category: 'Grains & Rice',
    unit: 'Bag',
    costPriceUsd: 5.2,
    sellingPriceUsd: 6.8,
    stockQuantity: 64,
    reorderLevel: 20,
    isActive: true,
  },
  {
    id: 'prd-3',
    sku: 'DAI-003',
    barcode: '884600100103',
    name: 'Fresh Farm Pasteurized Milk 1L',
    category: 'Dairy & Chilled',
    unit: 'Carton',
    costPriceUsd: 1.85,
    sellingPriceUsd: 2.5,
    stockQuantity: 18,
    reorderLevel: 25,
    isActive: true,
  },
  {
    id: 'prd-4',
    sku: 'SNK-004',
    barcode: '884600100104',
    name: 'Roasted Cashew Nuts Kampong Thom 250g',
    category: 'Snacks',
    unit: 'Pack',
    costPriceUsd: 2.9,
    sellingPriceUsd: 4.2,
    stockQuantity: 45,
    reorderLevel: 15,
    isActive: true,
  },
  {
    id: 'prd-5',
    sku: 'HPC-005',
    barcode: '884600100105',
    name: 'Antibacterial Liquid Dish Soap 750ml',
    category: 'Household',
    unit: 'Bottle',
    costPriceUsd: 1.1,
    sellingPriceUsd: 1.75,
    stockQuantity: 12,
    reorderLevel: 20,
    isActive: true,
  },
  {
    id: 'prd-6',
    sku: 'COF-006',
    barcode: '884600100106',
    name: 'Mondulkiri Arabica Roast Ground Coffee 500g',
    category: 'Beverages',
    unit: 'Pack',
    costPriceUsd: 4.5,
    sellingPriceUsd: 6.5,
    stockQuantity: 32,
    reorderLevel: 10,
    isActive: true,
  },
];

const DEFAULT_SUPPLIERS: Supplier[] = [
  {
    id: 'sup-1',
    code: 'SUP-001',
    name: 'Khmer Beverages & Distribution Co., Ltd.',
    contactPerson: 'Vannak Lim',
    phone: '+855 23 990 112',
    email: 'orders@khmerbev.com.kh',
    address: 'National Road 2, Khan Meanchey, Phnom Penh',
    paymentTerms: 'Net 30',
    isActive: true,
  },
  {
    id: 'sup-2',
    code: 'SUP-002',
    name: 'Battambang Golden Rice Mill',
    contactPerson: 'Sreyneang Ouk',
    phone: '+855 53 771 209',
    email: 'sales@goldenricemill.kh',
    address: 'Svay Por, Battambang Province',
    paymentTerms: 'Net 15',
    isActive: true,
  },
  {
    id: 'sup-3',
    code: 'SUP-003',
    name: 'Mekong Dairy & Cold Chain Logistics',
    contactPerson: 'Rithy Kem',
    phone: '+855 12 800 511',
    email: 'dispatch@mekongdairy.kh',
    address: 'Chroy Changvar, Phnom Penh',
    paymentTerms: 'COD',
    isActive: true,
  },
];

const DEFAULT_PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: 'po-1',
    poNumber: 'PO-2026-0101',
    supplierId: 'sup-1',
    supplierName: 'Khmer Beverages & Distribution Co., Ltd.',
    branchName: 'Main Branch',
    orderDate: '2026-11-10',
    expectedDate: '2026-11-14',
    status: 'RECEIVED',
    totalUsd: 168.0,
    items: [
      {
        productId: 'prd-1',
        productName: 'Cambodia Premium Mineral Water 1.5L',
        quantity: 240,
        unitCostUsd: 0.35,
      },
      {
        productId: 'prd-6',
        productName: 'Mondulkiri Arabica Roast Ground Coffee 500g',
        quantity: 18,
        unitCostUsd: 4.6667,
      },
    ],
  },
  {
    id: 'po-2',
    poNumber: 'PO-2026-0102',
    supplierId: 'sup-2',
    supplierName: 'Battambang Golden Rice Mill',
    branchName: 'Main Branch',
    orderDate: '2026-11-12',
    expectedDate: '2026-11-16',
    status: 'ORDERED',
    totalUsd: 260.0,
    items: [
      {
        productId: 'prd-2',
        productName: 'Phka Rumduol Jasmine Rice 5kg',
        quantity: 50,
        unitCostUsd: 5.2,
      },
    ],
  },
];

const DEFAULT_POS_TRANSACTIONS: PosTransaction[] = [
  {
    id: 'tx-1001',
    receiptNo: 'INV-20261113-001',
    createdAt: new Date(Date.now() - 3600 * 1000 * 3).toISOString(),
    cashier: 'Sokha Chan',
    branchCode: 'MAIN',
    itemsCount: 4,
    totalUsd: 14.4,
    totalKhr: 59000,
    paymentMethod: 'KHQR',
  },
  {
    id: 'tx-1002',
    receiptNo: 'INV-20261113-002',
    createdAt: new Date(Date.now() - 3600 * 1000 * 1.5).toISOString(),
    cashier: 'Sokha Chan',
    branchCode: 'MAIN',
    itemsCount: 2,
    totalUsd: 9.3,
    totalKhr: 38100,
    paymentMethod: 'CASH',
  },
];

function readStore<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeStore<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
}

export const erpService = {
  getDepartments(): Department[] {
    return readStore(STORAGE_KEYS.DEPARTMENTS, DEFAULT_DEPARTMENTS);
  },
  saveDepartment(dept: Department): Department[] {
    const list = this.getDepartments();
    const idx = list.findIndex((d) => d.id === dept.id);
    const updated = idx >= 0 ? list.map((d) => (d.id === dept.id ? dept : d)) : [...list, dept];
    writeStore(STORAGE_KEYS.DEPARTMENTS, updated);
    return updated;
  },

  getPositions(): Position[] {
    return readStore(STORAGE_KEYS.POSITIONS, DEFAULT_POSITIONS);
  },
  savePosition(pos: Position): Position[] {
    const list = this.getPositions();
    const idx = list.findIndex((p) => p.id === pos.id);
    const updated = idx >= 0 ? list.map((p) => (p.id === pos.id ? pos : p)) : [...list, pos];
    writeStore(STORAGE_KEYS.POSITIONS, updated);
    return updated;
  },

  getEmployees(): Employee[] {
    return readStore(STORAGE_KEYS.EMPLOYEES, DEFAULT_EMPLOYEES);
  },
  saveEmployee(emp: Employee): Employee[] {
    const list = this.getEmployees();
    const idx = list.findIndex((e) => e.id === emp.id);
    const updated = idx >= 0 ? list.map((e) => (e.id === emp.id ? emp : e)) : [emp, ...list];
    writeStore(STORAGE_KEYS.EMPLOYEES, updated);
    return updated;
  },

  getProducts(): Product[] {
    return readStore(STORAGE_KEYS.PRODUCTS, DEFAULT_PRODUCTS);
  },
  saveProduct(product: Product): Product[] {
    const list = this.getProducts();
    const idx = list.findIndex((p) => p.id === product.id);
    const updated = idx >= 0 ? list.map((p) => (p.id === product.id ? product : p)) : [product, ...list];
    writeStore(STORAGE_KEYS.PRODUCTS, updated);
    return updated;
  },
  adjustStock(productId: string, delta: number): Product[] {
    const list = this.getProducts();
    const updated = list.map((p) =>
      p.id === productId ? { ...p, stockQuantity: Math.max(0, p.stockQuantity + delta) } : p
    );
    writeStore(STORAGE_KEYS.PRODUCTS, updated);
    return updated;
  },

  getSuppliers(): Supplier[] {
    return readStore(STORAGE_KEYS.SUPPLIERS, DEFAULT_SUPPLIERS);
  },
  saveSupplier(supplier: Supplier): Supplier[] {
    const list = this.getSuppliers();
    const idx = list.findIndex((s) => s.id === supplier.id);
    const updated = idx >= 0 ? list.map((s) => (s.id === supplier.id ? supplier : s)) : [supplier, ...list];
    writeStore(STORAGE_KEYS.SUPPLIERS, updated);
    return updated;
  },

  getPurchaseOrders(): PurchaseOrder[] {
    return readStore(STORAGE_KEYS.PURCHASE_ORDERS, DEFAULT_PURCHASE_ORDERS);
  },
  savePurchaseOrder(po: PurchaseOrder): PurchaseOrder[] {
    const list = this.getPurchaseOrders();
    const idx = list.findIndex((item) => item.id === po.id);
    const updated = idx >= 0 ? list.map((item) => (item.id === po.id ? po : item)) : [po, ...list];
    writeStore(STORAGE_KEYS.PURCHASE_ORDERS, updated);
    return updated;
  },

  getPosTransactions(): PosTransaction[] {
    return readStore(STORAGE_KEYS.POS_TRANSACTIONS, DEFAULT_POS_TRANSACTIONS);
  },
  recordPosTransaction(tx: PosTransaction, soldItems: Array<{ productId: string; quantity: number }>): PosTransaction[] {
    const list = this.getPosTransactions();
    const updated = [tx, ...list];
    writeStore(STORAGE_KEYS.POS_TRANSACTIONS, updated);

    const products = this.getProducts().map((p) => {
      const sold = soldItems.find((i) => i.productId === p.id);
      if (!sold) return p;
      return {
        ...p,
        stockQuantity: Math.max(0, p.stockQuantity - sold.quantity),
      };
    });
    writeStore(STORAGE_KEYS.PRODUCTS, products);
    return updated;
  },
};

