import React from 'react';

type Props = { children: React.ReactNode; label: string };
type State = { error: Error | null };

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="error-boundary-fallback">
          <strong>{this.props.label} — something went wrong</strong>
          <span>Navigate away and back to retry, or reload the page to reset.</span>
        </div>
      );
    }
    return this.props.children;
  }
}
