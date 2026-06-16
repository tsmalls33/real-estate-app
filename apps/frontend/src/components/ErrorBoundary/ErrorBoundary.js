import React from 'react';
import ErrorPanel from '../ErrorPanel/ErrorPanel';

class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) return <ErrorPanel variant="error" />;
    return this.props.children;
  }
}

export default ErrorBoundary;
