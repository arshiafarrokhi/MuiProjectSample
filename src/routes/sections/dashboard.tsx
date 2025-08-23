import type { RouteObject } from 'react-router';

import { Outlet } from 'react-router';
import React, { lazy, Suspense } from 'react';

import { CONFIG } from 'src/global-config';
import { DashboardLayout } from 'src/layouts/dashboard';

import { LoadingScreen } from 'src/components/loading-screen';
import ErrorBoundary from 'src/components/ErrorBoundary/ErrorBoundary';

import { AuthGuard } from 'src/auth/guard';

// ----------------------------------------------------------------------

// const PageError = lazy(() => import('src/pages/error/404'));
const Users = lazy(() => import('src/pages/dashboard/users'));

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
      // <AuthGuard>
      <DashboardRoutesLayout />
      // </AuthGuard>
    ),
    // errorElement: <LoadingScreen />,
    children: [
      { path: 'users', element: <Users /> },
      // { path: 'agentBots', element: <AgentBots /> },
      // {
      //   path: 'agentBots/:botId/:botName/edit',
      //   element: <EditBotPage />,
      //   errorElement: <LoadingScreen />,
      //   children: [
      //     { path: 'model-settings', element: <EditBotModelSettingspage /> },
      //     { path: '', element: <EditBotAssistantSettingspage /> },
      //   ],
      // },
      // { path: 'knowledgeBases', element: <KnowledgeBases /> },
      // {
      //   path: 'knowledgeBases/:knId/:knName/edit',
      //   element: <EditKnowledgeBasesPage />,
      //   errorElement: <LoadingScreen />,
      //   children: [
      //     { path: 'dataset', element: <EditKnowledgeBasesDatasetSettingsPage /> },
      //     { path: '', element: <EditKnowledgeBasesConfigurationSettingsPage /> },
      //   ],
      // },
    ],
  },
];
