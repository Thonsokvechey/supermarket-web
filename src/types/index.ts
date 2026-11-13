// ============================================================================
// Auth & User Management Types (Matched to supermarket-backend DTOs)
// ============================================================================

export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface UserInfo {
  id: string;
  username: string;
  email: string | null;
  active?: boolean;
  isActive?: boolean;
  lastLoginAt: string | null;
  roles: string[];
  permissions: string[];
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresInMs: number;
  user: UserInfo;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  refreshToken?: string;
}

export interface PermissionResponse {
  id: string;
  permissionKey: string;
  description: string;
}

export interface RoleResponse {
  id: string;
  name: string;
  description: string | null;
  permissions: PermissionResponse[];
}

export interface CreateRoleRequest {
  name: string;
  description?: string;
  permissionIds?: string[];
  permissionKeys?: string[];
}

export interface AssignPermissionsRequest {
  permissionIds?: string[];
  permissionKeys?: string[];
}

export interface UserResponse {
  id: string;
  username: string;
  email: string | null;
  active?: boolean;
  isActive?: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  roles: string[];
  permissions: string[];
}

export interface CreateUserRequest {
  username: string;
  email?: string;
  password: string;
  isActive?: boolean;
  roleIds?: string[];
  roleNames?: string[];
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  password?: string;
  isActive?: boolean;
  roleIds?: string[];
  roleNames?: string[];
}

// ============================================================================
// Finance, Branch, Currency & Settings Types (Matched to supermarket-backend)
// ============================================================================

export interface BranchDto {
  id?: string;
  code: string;
  name: string;
  address?: string;
  phone?: string;
  isActive?: boolean;
  createdAt?: string;
}

export interface BusinessSettingResponse {
  id: string;
  branchId: string;
  branchCode: string;
  branchName: string;
  baseCurrencyCode: string;
  baseCurrencyName: string;
  baseCurrencySymbol: string;
  timezone: string;
  allowNegativeStock: boolean;
  createdAt: string;
}

export interface UpdateBusinessSettingRequest {
  baseCurrencyCode: string;
  timezone?: string;
  allowNegativeStock?: boolean;
}

export interface CurrencyDto {
  code: string;
  name: string;
  symbol: string;
  decimalPlaces: number;
  isActive?: boolean;
}

export interface ExchangeRateDto {
  id?: string;
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  validFrom: string;
  source?: string;
  approvedBy?: string;
  createdAt?: string;
}

// ============================================================================
// Employee, Inventory, Supplier, Purchasing, POS & Report Types
// ============================================================================

export interface Department {
  id: string;
  branchId: string;
  branchName?: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface Position {
  id: string;
  departmentId: string;
  departmentName?: string;
  title: string;
  description?: string;
  isActive: boolean;
}

export interface Employee {
  id: string;
  code: string;
  fullName: string;
  email: string;
  phone: string;
  departmentId: string;
  departmentName: string;
  positionId: string;
  positionTitle: string;
  branchId: string;
  branchName: string;
  salaryUsd: number;
  hireDate: string;
  isActive: boolean;
}

export interface Product {
  id: string;
  sku: string;
  barcode: string;
  name: string;
  category: string;
  unit: string;
  costPriceUsd: number;
  sellingPriceUsd: number;
  stockQuantity: number;
  reorderLevel: number;
  isActive: boolean;
}

export interface Supplier {
  id: string;
  code: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  paymentTerms: string;
  isActive: boolean;
}

export interface PurchaseOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitCostUsd: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  branchName: string;
  orderDate: string;
  expectedDate: string;
  status: 'DRAFT' | 'ORDERED' | 'RECEIVED' | 'CANCELLED';
  totalUsd: number;
  items: PurchaseOrderItem[];
}

export interface PosCartItem {
  product: Product;
  quantity: number;
  discountPercent: number;
}

export interface PosTransaction {
  id: string;
  receiptNo: string;
  createdAt: string;
  cashier: string;
  branchCode: string;
  itemsCount: number;
  totalUsd: number;
  totalKhr: number;
  paymentMethod: 'CASH' | 'KHQR' | 'CARD';
}

