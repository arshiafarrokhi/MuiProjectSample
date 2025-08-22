import type { ReactNode } from 'react';

import React, { Component } from 'react';

import { LoadingScreen } from 'src/components/loading-screen';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
  };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <LoadingScreen />;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
