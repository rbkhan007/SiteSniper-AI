"use client";

import { Component, ReactNode } from "react";

interface Props { children: ReactNode; fallback?: ReactNode; }
interface State { hasError: boolean; error?: Error; }

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError(error: Error): State { return { hasError: true, error }; }
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) { console.error("ErrorBoundary caught:", error, errorInfo); }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="p-6 rounded-2xl text-center bg-card border border-card-border">
          <p className="text-red-500 font-semibold mb-2">Something went wrong</p>
          <p className="text-sm text-muted-foreground mb-4">{this.state.error?.message || "An unexpected error occurred"}</p>
          <button onClick={() => this.setState({ hasError: false })} className="px-4 py-2 text-sm rounded-lg transition-colors bg-muted text-foreground hover:bg-muted/80">Try Again</button>
        </div>
      );
    }
    return this.props.children;
  }
}
