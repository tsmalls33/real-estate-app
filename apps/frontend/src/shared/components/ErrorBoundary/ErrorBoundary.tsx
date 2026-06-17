import React from 'react';
import ErrorPanel from '../ErrorPanel/ErrorPanel';

type State = { hasError: boolean };

export default class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('ErrorBoundary caught:', error, info);
  }

  render(): React.ReactNode {
    if (this.state.hasError) return <ErrorPanel variant="error" />;
    return this.props.children;
  }
}
