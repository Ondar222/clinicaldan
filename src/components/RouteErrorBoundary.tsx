import React from "react";
import { Link } from "react-router-dom";

interface State {
  hasError: boolean;
  error?: Error;
}

export default class RouteErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Route error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center bg-gray-50 py-12 px-4">
          <div className="max-w-md w-full text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Не удалось загрузить страницу
            </h2>
            <p className="text-gray-600 text-sm mb-6">
              Обновите страницу или перейдите по ссылке ниже.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                to="/certificates"
                className="inline-block bg-primary hover:bg-primaryDark text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                К сертификатам
              </Link>
              <Link
                to="/"
                className="inline-block bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                На главную
              </Link>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
