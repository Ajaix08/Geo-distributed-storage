import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('GeoVault UI error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-ink text-slate-200 px-6">
          <div className="max-w-md text-center border border-line bg-panel rounded-xl p-8">
            <p className="text-sm tracking-widest text-accent font-mono mb-2">ERR_UI_CRASH</p>
            <h2 className="text-xl font-display font-semibold mb-2">Something broke on this screen</h2>
            <p className="text-slate-400 text-sm mb-6">
              Reload the page. If the problem continues, the gateway or a regional server may be unreachable.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-lg bg-accent text-ink font-medium hover:opacity-90 transition"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
