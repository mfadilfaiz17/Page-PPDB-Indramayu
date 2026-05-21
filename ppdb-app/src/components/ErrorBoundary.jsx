import { Component } from "react";

/**
 * Error Boundary Component
 * Catches React component errors and displays a fallback UI
 * Prevents white screen of death
 *
 * Usage:
 * <ErrorBoundary>
 *   <MyComponent />
 * </ErrorBoundary>
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error for debugging
    console.error("🔴 Error Boundary Caught:", error);
    console.error("Component Stack:", errorInfo.componentStack);
    
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={styles.errorContainer}>
          <div style={styles.errorContent}>
            <h1 style={styles.errorTitle}>⚠️ Terjadi Kesalahan</h1>
            <p style={styles.errorMessage}>
              Maaf, aplikasi mengalami kesalahan yang tidak terduga. Silakan coba lagi.
            </p>
            {process.env.NODE_ENV === "development" && this.state.error && (
              <details style={styles.details}>
                <summary style={styles.summary}>Detail Teknis (Dev Only)</summary>
                <pre style={styles.pre}>
                  {this.state.error.toString()}
                  {"\n\n"}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
            <button onClick={this.handleReset} style={styles.button}>
              🔄 Coba Lagi
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const styles = {
  errorContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: "#f8f9fa",
    padding: "20px",
  },
  errorContent: {
    maxWidth: "500px",
    padding: "40px",
    backgroundColor: "white",
    borderRadius: "8px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    textAlign: "center",
  },
  errorTitle: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#d32f2f",
    marginBottom: "16px",
  },
  errorMessage: {
    fontSize: "16px",
    color: "#555",
    marginBottom: "24px",
    lineHeight: "1.5",
  },
  details: {
    marginBottom: "24px",
    textAlign: "left",
    backgroundColor: "#f5f5f5",
    padding: "12px",
    borderRadius: "4px",
  },
  summary: {
    cursor: "pointer",
    fontWeight: "bold",
    color: "#666",
  },
  pre: {
    marginTop: "12px",
    padding: "12px",
    backgroundColor: "#fff",
    borderRadius: "4px",
    overflow: "auto",
    fontSize: "12px",
    color: "#d32f2f",
    border: "1px solid #e0e0e0",
  },
  button: {
    padding: "12px 24px",
    fontSize: "16px",
    fontWeight: "bold",
    color: "white",
    backgroundColor: "#1976d2",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    transition: "background-color 0.3s",
  },
};

export default ErrorBoundary;
