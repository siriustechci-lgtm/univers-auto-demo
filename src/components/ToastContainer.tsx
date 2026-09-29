import React from 'react';
import { useCrm } from '../context/CrmContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useCrm();

  if (toasts.length === 0) return null;

  return (
    <div id="toast-container" className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none px-4">
      {toasts.map((toast) => {
        const icons = {
          success: <CheckCircle2 className="w-5 h-5 text-[#4A7A4A] shrink-0" />,
          error: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
          warning: <AlertTriangle className="w-5 h-5 text-[#B87320] shrink-0" />,
          info: <Info className="w-5 h-5 text-[#5A5A40] shrink-0" />,
        };

        const borders = {
          success: 'border-[#4A7A4A]/30 bg-white text-[#2D2D2A]',
          error: 'border-rose-300 bg-white text-[#2D2D2A]',
          warning: 'border-[#B87320]/30 bg-white text-[#2D2D2A]',
          info: 'border-[#5A5A40]/30 bg-white text-[#2D2D2A]',
        };

        return (
          <div
            key={toast.id}
            id={`toast-${toast.id}`}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-md transition-all duration-200 ${borders[toast.type]}`}
          >
            {icons[toast.type]}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm leading-tight text-[#1A1A18]">{toast.title}</p>
              {toast.message && (
                <p className="text-xs text-[#5A5A52] mt-1 leading-relaxed">{toast.message}</p>
              )}
            </div>
            <button
              id={`toast-close-${toast.id}`}
              onClick={() => removeToast(toast.id)}
              className="text-[#7A7A72] hover:text-[#1A1A18] p-1 rounded-lg hover:bg-[#F0EFEB] transition-colors cursor-pointer"
              aria-label="Fermer la notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
