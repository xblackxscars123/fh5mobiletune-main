import React from 'react';

type Props = {
  children: React.ReactNode;
  fallbackTitle?: string;
};

type State = {
  hasError: boolean;
  error?: Error;
};

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary] Render error', error);
    console.error('[ErrorBoundary] Component stack', info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="module-block p-6">
          <h3 className="font-display text-sm uppercase tracking-wider mb-2">
            {this.props.fallbackTitle ?? 'Something crashed while rendering'}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Open DevTools console for the full stack trace.
          </p>
          <pre className="text-xs whitespace-pre-wrap break-words bg-[hsl(220,15%,10%)] border border-[hsl(220,15%,18%)] rounded p-3 overflow-auto">
            {this.state.error?.message ?? 'Unknown error'}
          </pre>
          <button
            className="mt-4 inline-flex items-center justify-center rounded-md border border-border bg-card px-3 py-2 text-sm hover:bg-card/60"
            onClick={() => this.setState({ hasError: false, error: undefined })}
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
