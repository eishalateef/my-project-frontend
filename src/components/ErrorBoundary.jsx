import React from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '60vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            textAlign: 'center',
            backgroundColor: '#FAF9F6',
          }}
        >
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: '#FEE2E2',
              color: '#DC2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.25rem',
            }}
          >
            <AlertCircle size={32} />
          </div>
          <h2
            style={{
              fontSize: '1.4rem',
              fontWeight: 800,
              color: '#111111',
              marginBottom: '0.5rem',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            Something unexpected occurred
          </h2>
          <p
            style={{
              color: '#666666',
              fontSize: '0.9rem',
              maxWidth: '480px',
              lineHeight: 1.6,
              marginBottom: '1.75rem',
            }}
          >
            We encountered a temporary rendering issue. You can safely refresh the view or return to the main storefront.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={this.handleReload}
              className="btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.85rem',
                padding: '0.65rem 1.4rem',
              }}
            >
              <RefreshCw size={15} /> Reload Page
            </button>
            <button
              onClick={this.handleGoHome}
              className="btn-secondary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.85rem',
                padding: '0.65rem 1.4rem',
              }}
            >
              <Home size={15} /> Return to Storefront
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
