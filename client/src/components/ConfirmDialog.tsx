import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = false,
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-md bg-bg-card border border-border-subtle rounded-xl shadow-2xl p-6 relative animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="absolute top-4 right-4 text-text-secondary hover:text-text-primary p-1 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4 mb-5">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
            isDestructive ? 'bg-danger/15 text-danger' : 'bg-warning/15 text-warning'
          }`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-text-primary leading-snug">{title}</h3>
            <p className="text-sm text-text-secondary mt-1.5 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-md ${
              isDestructive
                ? 'bg-danger text-white hover:bg-danger/90 disabled:opacity-50'
                : 'btn-primary disabled:opacity-50'
            }`}
          >
            {isLoading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
