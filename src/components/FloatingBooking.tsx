import React from 'react';
import { useNavigate } from 'react-router-dom';
import AppointmentModal from './AppointmentModal';

interface FloatingBookingProps {
  className?: string;
}

export default function FloatingBooking({ className }: FloatingBookingProps) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = React.useState(false);
  const [appointmentOpen, setAppointmentOpen] = React.useState(false);
  const [mode, setMode] = React.useState<'doctor' | 'service' | null>(null);

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  const openDoctorModal = () => {
    setMode('doctor');
    setIsOpen(false);
    setAppointmentOpen(true);
  };

  const openServiceModal = () => {
    setMode('service');
    setIsOpen(false);
    setAppointmentOpen(true);
  };

  return (
    <>
      {/* <button
        aria-label="Запись"
        onClick={handleOpen}
        className={`fixed left-4 bottom-4 sm:left-6 sm:bottom-6 z-40 rounded-full shadow-lg bg-primary text-white w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center hover:bg-primaryDark transition-colors ${className || ''}`}
      >
        <span className="text-xs sm:text-sm font-semibold">Запись</span>
      </button> */}

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={handleClose}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Записаться</h3>
              <p className="text-sm text-gray-600 mt-1">Выберите вариант записи в реальном времени</p>
            </div>
            <div className="p-5 space-y-3">
              <button
                onClick={openDoctorModal}
                className="w-full flex items-center justify-between px-4 py-3 bg-white/90 border-2 border-primary/30 text-primary rounded-xl hover:bg-primary hover:text-white hover:border-primary transition-all duration-200 shadow-sm"
              >
                <span className="flex items-center gap-3">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">👩‍⚕️</span>
                  К врачу
                </span>
                <span>→</span>
              </button>
              <button
                onClick={openServiceModal}
                className="w-full flex items-center justify-between px-4 py-3 bg-white/90 border-2 border-primary/30 text-primary rounded-xl hover:bg-primary hover:text-white hover:border-primary transition-all duration-200 shadow-sm"
              >
                <span className="flex items-center gap-3">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">🧾</span>
                  На услугу
                </span>
                <span>→</span>
              </button>
            </div>
            <div className="p-4 border-t flex justify-end">
              <button onClick={handleClose} className="px-4 py-2 text-gray-600 hover:text-gray-800">Закрыть</button>
            </div>
          </div>
        </div>
      )}
      <AppointmentModal
        isOpen={appointmentOpen}
        onClose={() => setAppointmentOpen(false)}
        onSuccess={() => setAppointmentOpen(false)}
      />
    </>
  );
}


