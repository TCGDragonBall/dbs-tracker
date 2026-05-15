import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  componentDidMount() {
    window.addEventListener('error', this.handleGlobalError);
    window.addEventListener('unhandledrejection', this.handleGlobalPromiseRejection);
  }

  componentWillUnmount() {
    window.removeEventListener('error', this.handleGlobalError);
    window.removeEventListener('unhandledrejection', this.handleGlobalPromiseRejection);
  }

  handleGlobalError = (event: ErrorEvent) => {
    event.preventDefault();
    this.setState({ hasError: true, error: event.error || new Error(event.message) });
  };

  handleGlobalPromiseRejection = (event: PromiseRejectionEvent) => {
    event.preventDefault();
    this.setState({ hasError: true, error: event.reason });
  };

  render() {
    if (this.state.hasError) {
      let message = "Algo salió mal.";
      try {
        const parsed = JSON.parse(this.state.error.message);
        if (parsed.error && parsed.error.includes("insufficient permissions")) {
          message = "No tienes permisos para realizar esta acción.";
        } else if (parsed.error && (parsed.error.includes("Quota") || parsed.error.includes("quota"))) {
          message = "Límite de cuota excedido. Por favor, inténtalo de nuevo mañana cuando se restablezca la cuota.";
        }
      } catch (e) {
        // Not a JSON error
        if (this.state.error?.message?.includes("Quota") || this.state.error?.message?.includes("quota")) {
          message = "Límite de cuota excedido. Por favor, inténtalo de nuevo mañana cuando se restablezca la cuota.";
        }
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-red-50">
          <h1 className="text-2xl font-bold text-red-600 mb-4">¡Ups!</h1>
          <p className="text-gray-700 mb-4 max-w-md">{message}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
