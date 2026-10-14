import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CustomerLayout } from '../layouts/CustomerLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleBasedRoute } from './RoleBasedRoute';

// Customer & Catalog Pages
import { HomePage } from '@/modules/catalog/pages/HomePage';
import { BookCatalogPage } from '@/modules/catalog/pages/BookCatalogPage';
import { BookDetailPage } from '@/modules/catalog/pages/BookDetailPage';

// Auth Pages
import { LoginPage } from '@/modules/auth/pages/LoginPage';
import { RegisterPage } from '@/modules/auth/pages/RegisterPage';
import { ForgotPasswordPage } from '@/modules/auth/pages/ForgotPasswordPage';

// Cart & Wishlist Pages
import { CartPage } from '@/modules/cart/pages/CartPage';
import { WishlistPage } from '@/modules/cart/pages/WishlistPage';

// Order Pages
import { CheckoutPage } from '@/modules/order/pages/CheckoutPage';
import { PaymentReturnPage } from '@/modules/order/pages/PaymentReturnPage';
import { OrderHistoryPage } from '@/modules/order/pages/OrderHistoryPage';
import { OrderDetailPage } from '@/modules/order/pages/OrderDetailPage';

// User Account Pages
import { CustomerProfilePage } from '@/modules/user/pages/CustomerProfilePage';
import { AddressListPage } from '@/modules/user/pages/AddressListPage';

// Admin Portal Pages
import { AdminDashboardPage } from '@/modules/report/pages/admin/AdminDashboardPage';
import { AdminBookListPage } from '@/modules/catalog/pages/admin/AdminBookListPage';
import { AdminBookFormPage } from '@/modules/catalog/pages/admin/AdminBookFormPage';
import { AdminOrderListPage } from '@/modules/order/pages/admin/AdminOrderListPage';
import { AdminStockCardPage } from '@/modules/inventory/pages/admin/AdminStockCardPage';
import { AdminLowStockPage } from '@/modules/inventory/pages/admin/AdminLowStockPage';
import { AdminCustomerListPage } from '@/modules/user/pages/admin/AdminCustomerListPage';
import { AdminStaffListPage } from '@/modules/user/pages/admin/AdminStaffListPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* 1. Customer Public & Protected Routes */}
      <Route element={<CustomerLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/books" element={<BookCatalogPage />} />
        <Route path="/books/:id" element={<BookDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route path="/payment/vnpay/return" element={<PaymentReturnPage />} />
        <Route
          path="/me/orders"
          element={
            <ProtectedRoute>
              <OrderHistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/me/orders/:orderCode"
          element={
            <ProtectedRoute>
              <OrderDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/me/profile"
          element={
            <ProtectedRoute>
              <CustomerProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/me/addresses"
          element={
            <ProtectedRoute>
              <AddressListPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* 2. Authentication Flow Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Route>

      {/* 3. Administrative Portal Routes */}
      <Route
        path="/admin"
        element={
          <RoleBasedRoute allowedRoles={['STAFF', 'MANAGER', 'ADMIN']}>
            <AdminLayout />
          </RoleBasedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="books" element={<AdminBookListPage />} />
        <Route path="books/new" element={<AdminBookFormPage />} />
        <Route path="books/:id/edit" element={<AdminBookFormPage />} />
        <Route path="orders" element={<AdminOrderListPage />} />
        <Route path="inventory/stock-cards" element={<AdminStockCardPage />} />
        <Route path="inventory/low-stock" element={<AdminLowStockPage />} />
        <Route path="customers" element={<AdminCustomerListPage />} />
        <Route path="staff" element={<AdminStaffListPage />} />
      </Route>

      {/* 4. Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

