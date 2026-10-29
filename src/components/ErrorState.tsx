import React from 'react';
import { AlertCircle, RefreshCw, UserCheck } from 'lucide-react';
import { PrimaryButton } from './PrimaryButton';
import { useNavigate } from 'react-router-dom';

interface ErrorStateProps {
  title?: string;
  message: string;
  details?: string;
  onRetry?: () => void;
  showContinueWithoutPhoto?: boolean;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Processing Notice',
  message,
  details,
  onRetry,
  showContinueWithoutPhoto = true,
}) => {
  const navigate = useNavigate();

  // If model is offline/unavailable, provide clear guidance
  const isOfflineModelError =
    message.toLowerCase().includes('model') &&
    (message.toLowerCase().includes('not installed') ||
      message.toLowerCase().includes('unavailable') ||
      message.toLowerCase().includes('offline'));

  const displayMessage = isOfflineModelError
    ? "This model isn't available offline yet. Connect once to download it, then try again."
    : message;

  return (
    <div
      role="alert"
      className="w-full max-w-lg mx-auto p-6 sm:p-8 rounded-2xl bg-white/[0.02] border border-red-500/30 shadow-2xl text-center space-y-6"
    >
      <div className="w-12 h-12 mx-auto rounded-xl bg-red-950/30 border border-red-500/30 flex items-center justify-center text-red-400">
        <AlertCircle className="w-6 h-6" />
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-medium text-white">{title}</h3>
        <p className="text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
          {displayMessage}
        </p>
        {details && (
          <p className="text-xs font-mono text-slate-400 bg-black/40 p-2.5 rounded-lg border border-white/10 break-words">
            {details}
          </p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        {onRetry && (
          <PrimaryButton
            variant="primary"
            onClick={onRetry}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Retry
          </PrimaryButton>
        )}

        {showContinueWithoutPhoto && (
          <PrimaryButton
            variant="outline"
            onClick={() => navigate('/selfie?mode=sample')}
            leftIcon={<UserCheck className="w-4 h-4 text-sky-400" />}
            className="border-white/20 text-slate-300 hover:text-white"
          >
            Use Demo Avatar Instead
          </PrimaryButton>
        )}
      </div>
    </div>
  );
};
