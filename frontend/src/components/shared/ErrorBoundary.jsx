import { Component } from 'react';

// Last line of defence: if a page crashes while rendering, show a message instead of a blank screen.
export class ErrorBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error, info) {
    console.error('Unexpected UI error:', error, info.componentStack);
  }

  render() {
    if (!this.state.failed) return this.props.children;

    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div role="alert" className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <h1 className="text-lg font-semibold text-slate-900">Something went wrong</h1>
          <p className="mt-2 text-sm text-slate-600">An unexpected error occurred. Reloading the page usually fixes it.</p>
          <button
            type="button"
            onClick={() => window.location.assign('/')}
            className="mt-5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            Reload the app
          </button>
        </div>
      </div>
    );
  }
}
