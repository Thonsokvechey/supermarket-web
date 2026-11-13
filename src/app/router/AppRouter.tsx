import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { LoginPage } from '../../features/auth/LoginPage';
import { AuthManagementPage } from '../../features/auth/AuthManagementPage';
import { DashboardPage } from '../../features/dashboard/DashboardPage';
import { EmployeesPage } from '../../features/employees/EmployeesPage';
import { InventoryPage } from '../../features/inventory/InventoryPage';
import { SuppliersPage } from '../../features/suppliers/SuppliersPage';
import { PurchasingPage } from '../../features/purchasing/PurchasingPage';
import { PosPage } from '../../features/pos/PosPage';
import { FinancePage } from '../../features/finance/FinancePage';
import { ReportsPage } from '../../features/reports/ReportsPage';

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<MainLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="auth-management" element={<AuthManagementPage />} />
          <Route path="employees" element={<EmployeesPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="suppliers" element={<SuppliersPage />} />
          <Route path="purchasing" element={<PurchasingPage />} />
          <Route path="pos" element={<PosPage />} />
          <Route path="finance" element={<FinancePage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

