import React, { ReactNode } from 'react';
import { Plus } from 'lucide-react';

interface EmptyStateProps {
  id?: string;
  icon: ReactNode;
  title: string;
  description?: string;
  actionText: string;
  onAction: () => void;
  secondaryActionText?: string;
  onSecondaryAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  id,
  icon,
  title,
  description,
  actionText,
  onAction,
  secondaryActionText,
  onSecondaryAction,
}) => {
  return (
    <div
      id={id || 'empty-state-card'}
      className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-[#E5E5DF] bg-white my-4 shadow-xs"
    >
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#F5F5F0] border border-[#E5E5DF] flex items-center justify-center text-[#5A5A40] mb-5">
        {icon}
      </div>

      <h3 className="text-xl sm:text-2xl font-bold text-[#1A1A18] tracking-tight mb-2 font-['Outfit']">
        {title}
      </h3>

      {description && (
        <p className="text-[#7A7A72] text-sm max-w-md mb-6 leading-relaxed">
          {description}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          id={id ? `${id}-btn-primary` : 'empty-state-btn-primary'}
          onClick={onAction}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#5A5A40] hover:bg-[#484832] text-white font-semibold text-sm transition-all duration-150 shadow-xs active:scale-98 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          {actionText}
        </button>

        {secondaryActionText && onSecondaryAction && (
          <button
            id={id ? `${id}-btn-secondary` : 'empty-state-btn-secondary'}
            onClick={onSecondaryAction}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E5E5DF] bg-[#EAEAE5] hover:bg-[#E0E0DA] text-[#2D2D2A] font-medium text-sm transition-all duration-150 cursor-pointer"
          >
            {secondaryActionText}
          </button>
        )}
      </div>
    </div>
  );
};
