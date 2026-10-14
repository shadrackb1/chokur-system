import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="min-h-screen bg-surface flex items-center justify-center p-8">
          <div className="max-w-md mx-auto text-center bg-surface-panel border border-hairline rounded-lg p-8">
            <span className="material-symbols-outlined text-6xl text-error mb-4 block">error</span>
            <h2 className="text-h2 text-primary mb-2">Something went wrong</h2>
            <p className="text-body text-secondary mb-6">{this.state.error?.message || 'An unexpected error occurred'}</p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-6 py-3 bg-brand text-inverse text-body font-medium rounded-sm hover:bg-brand-hover transition-base focus-ring"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}