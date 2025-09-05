import type { RouteObject } from 'react-router';

import { Outlet } from 'react-router';
import React, { lazy, Suspense } from 'react';

import { CONFIG } from 'src/global-config';
import { DashboardLayout } from 'src/layouts/dashboard';

import { LoadingScreen } from 'src/components/loading-screen';
import ErrorBoundary from 'src/components/ErrorBoundary/ErrorBoundary';

import { AuthGuard } from 'src/auth/guard';

// ----------------------------------------------------------------------

const EditUsersPage = lazy(() => import('src/pages/dashboard/users/components/EditUsersPage'));
const UsersPage = lazy(() => import('src/pages/dashboard/users'));
const DashboardPage = lazy(() => import('src/pages/dashboard/dashboard'));
const ProductsPage = lazy(() => import('src/pages/dashboard/products/index'));
const ProductSimPage = lazy(() => import('src/pages/dashboard/productSim'));
const AdminPage = lazy(() => import('src/pages/dashboard/adminPage'));
const ProductDetailsPage = lazy(
  () => import('src/sections/products/components/ProductDetailsPage')
);

// ----------------------------------------------------------------------

const DashboardRoutesLayout = () => (
  <DashboardLayout>
    <ErrorBoundary>
      <Suspense fallback={<LoadingScreen />}>
        <Outlet />
      </Suspense>
    </ErrorBoundary>
  </DashboardLayout>
);

export const dashboardRoutes: RouteObject[] = [
  {
    path: '/dashboard',
    element: CONFIG.auth.skip ? (
      <DashboardRoutesLayout />
    ) : (
      <AuthGuard>
        <DashboardRoutesLayout />
      </AuthGuard>
    ),
    errorElement: <LoadingScreen />,
    children: [
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'users', element: <UsersPage /> },
      {
        path: 'users/:userId',
        element: <EditUsersPage />,
        // errorElement: <LoadingScreen />,
      },
      { path: 'products', element: <ProductsPage /> },
      {
        path: 'products/:productId',
        element: <ProductDetailsPage />,
        // errorElement: <LoadingScreen />,
      },
      { path: 'productSim', element: <ProductSimPage /> },
      { path: 'admin', element: <AdminPage /> },
    ],
  },
];
