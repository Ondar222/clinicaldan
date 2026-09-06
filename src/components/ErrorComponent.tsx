import React from 'react';

interface ErrorComponentProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export default function ErrorComponent({ 
  title = "Ошибка загрузки данных", 
  message = "Не удалось загрузить данные. Попробуйте позже.",
  onRetry 
}: ErrorComponentProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fdf2f4] via-white to-[#fdf2f4] py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg mb-6">
            <div className="flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            <p className="text-sm">{message}</p>
          </div>
          
          {onRetry && (
            <button 
              onClick={onRetry}
              className="bg-primary hover:bg-primaryDark text-white px-6 py-3 rounded-md font-medium transition-colors"
            >
              Попробовать снова
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 