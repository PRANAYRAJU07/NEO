import React from 'react';
import { AlertCircle, RefreshCw, UserCheck, RotateCcw } from 'lucide-react';
import { PrimaryButton } from './PrimaryButton';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../app/AppContext';

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
  const { resetAll } = useApp();

  return (
    <div
      role="alert"
      className="w-full max-w-lg mx-auto p-6 sm:p-8 rounded-3xl bg-slate-900 border border-red-500/30 shadow-2xl text-center space-y-6"
    >
      <div className="w-16 h-16 mx-auto rounded-2xl bg-red-950/50 border border-red-500/40 flex items-center justify-center text-red-400">
        <AlertCircle className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <h3 className="text-xl font-bold text-white">{title}</h3>
        <p className="text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
          {message}
        </p>
        {details && (
          <p className="text-xs font-mono text-slate-400 bg-slate-950 p-2.5 rounded-lg border border-slate-800 break-words">
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
            Try Again
          </PrimaryButton>
        )}

        {showContinueWithoutPhoto && (
          <PrimaryButton
            variant="secondary"
            onClick={() => navigate('/selfie?mode=sample')}
            leftIcon={<UserCheck className="w-4 h-4 text-sky-400" />}
          >
            Use Demo Avatar
          </PrimaryButton>
        )}

        <PrimaryButton
          variant="outline"
          onClick={() => {
            resetAll();
            navigate('/');
          }}
          leftIcon={<RotateCcw className="w-4 h-4 text-slate-400" />}
        >
          Reset All
        </PrimaryButton>
      </div>
    </div>
  );
};
