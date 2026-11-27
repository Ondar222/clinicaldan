'use client';
import React, { useEffect } from 'react';

export default function PatientCabinetPage() {
  useEffect(() => {
    // Старый внешний кабинет пациента пока отключён:
    // const externalUrl = 'http://user.clinicaldan.ru/login';
    window.location.href = '/personal-cabinet';
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fdf2f4] via-white to-[#fdf2f4] py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-dark mb-4">Переход в личный кабинет</h2>
          <p className="text-gray-600 mb-6">
            Вы будете перенаправлены в личный кабинет администратора.
          </p>
          <p className="text-sm text-gray-500">
            Если переход не произошел автоматически, 
            <a 
              href="http://user.clinicaldan.ru/login" 
              className="text-primary hover:text-primaryDark underline ml-1"
            >
              нажмите здесь
            </a>
          </p>
        </div>
      </div>
    </div>
  );
} 