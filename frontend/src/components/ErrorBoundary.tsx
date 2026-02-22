import { Component, type ReactNode } from 'react';

interface Props { children: ReactNode; }
interface State { hasError: boolean; error: Error | null; }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-screen" style={{ background: 'var(--bg-dark)' }}>
          <div className="max-w-md p-6 text-center" style={{ border: '1px solid var(--danger)', background: 'var(--bg-panel)' }}>
            <h2 className="font-rajdhani font-bold text-xl uppercase tracking-wider mb-2" style={{ color: 'var(--danger)' }}>
              Something went wrong
            </h2>
            <p className="text-sm font-mono mb-4" style={{ color: 'var(--text-dim)' }}>
              {this.state.error?.message || 'Unknown error'}
            </p>
            <button
              onClick={() => { this.setState({ hasError: false, error: null }); window.location.href = '/dashboard'; }}
              className="px-4 py-2 text-sm font-mono uppercase tracking-wider"
              style={{ background: 'var(--accent)', color: '#000', border: 'none', cursor: 'pointer' }}
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
