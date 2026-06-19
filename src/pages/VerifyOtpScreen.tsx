import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router';
import { ArrowLeft, CheckCircle2, KeyRound, RefreshCw, ShieldCheck } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { api, type OtpContext } from '../services/api';
import logo from '../assets/35160e99e546074153c34366a831aa0e30d421e6.png';

export const OTP_CONTEXT_STORAGE_KEY = 'charmchime_otp_context';

interface VerifyOtpScreenProps {
  onBack: () => void;
  onVerified: (userType: 'parent' | 'child') => void;
}

const getStoredOtpContext = (): OtpContext | null => {
  const saved = sessionStorage.getItem(OTP_CONTEXT_STORAGE_KEY);

  if (!saved) {
    return null;
  }

  try {
    const context = JSON.parse(saved) as OtpContext;

    if (
      !context.userType ||
      !context.email ||
      (context.userType === 'child' && !context.name)
    ) {
      sessionStorage.removeItem(OTP_CONTEXT_STORAGE_KEY);
      return null;
    }

    return context;
  } catch {
    sessionStorage.removeItem(OTP_CONTEXT_STORAGE_KEY);
    return null;
  }
};

const getContextLabel = (context: OtpContext | null) => {
  if (!context) {
    return 'your account';
  }

  return context.email || 'your email';
};

export function VerifyOtpScreen({ onBack, onVerified }: VerifyOtpScreenProps) {
  const location = useLocation();
  const [context] = useState<OtpContext | null>(() => {
    const stateContext = location.state as OtpContext | null;
    const hasRequiredState =
      stateContext?.userType &&
      stateContext.email &&
      (stateContext.userType === 'parent' || stateContext.name);

    return hasRequiredState ? stateContext : getStoredOtpContext();
  });
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(60);

  const variant = context?.userType === 'parent' ? 'parent' : 'child';
  const buttonVariant = context?.userType === 'parent' ? 'parent-teal' : 'child-blue';
  const cardTitle = context?.userType === 'parent' ? 'Verify parent account' : 'Verify child account';
  const destination = useMemo(() => getContextLabel(context), [context]);

  useEffect(() => {
    if (context?.userType) {
      sessionStorage.setItem(OTP_CONTEXT_STORAGE_KEY, JSON.stringify(context));
    }
  }, [context]);

  useEffect(() => {
    if (cooldown <= 0) {
      return;
    }

    const timer = window.setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  const handleOtpChange = (value: string) => {
    setOtp(value.replace(/\D/g, '').slice(0, 6));
    setError('');
  };

  const handleVerify = async () => {
    setError('');
    setSuccess('');

    if (!context) {
      setError('We could not find your verification details. Please sign up or log in again.');
      return;
    }

    if (otp.length !== 6) {
      setError('Enter the 6-digit OTP.');
      return;
    }

    setIsVerifying(true);
    try {
      await api.auth.verifyOtp({ ...context, otp });
      sessionStorage.removeItem(OTP_CONTEXT_STORAGE_KEY);
      setSuccess('Account verified successfully. Redirecting you to login...');
      window.setTimeout(() => onVerified(context.userType), 900);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid or expired OTP. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setSuccess('');

    if (!context) {
      setError('We could not find your verification details. Please sign up or log in again.');
      return;
    }

    setIsResending(true);
    try {
      await api.auth.resendOtp(context);
      setOtp('');
      setCooldown(60);
      setSuccess('A new OTP has been sent. Please check the latest code.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not resend OTP. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className={`relative min-h-screen overflow-hidden px-5 py-20 sm:px-8 lg:px-12 ${
      context?.userType === 'parent'
        ? 'bg-gradient-to-br from-[var(--parent-bg)] to-[#e0f2f5]'
        : 'bg-gradient-to-br from-[var(--child-blue)] via-[var(--child-lavender)] to-[var(--child-mint)]'
    }`}>
      <button
        onClick={onBack}
        className={`absolute left-5 top-5 z-10 inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 shadow-[0_4px_16px_rgba(0,0,0,0.08)] backdrop-blur transition-all hover:bg-white sm:left-8 sm:top-8 ${
          context?.userType === 'parent'
            ? 'text-[var(--parent-teal)] hover:text-[var(--parent-teal-dark)]'
            : 'text-[#1a365d] hover:text-[#2d3748]'
        }`}
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Back</span>
      </button>

      <div className="relative mx-auto grid min-h-[calc(100vh-10rem)] w-full max-w-5xl items-center gap-8 lg:grid-cols-[1fr_26rem]">
        <section className={`text-center lg:text-left ${
          context?.userType === 'parent' ? 'text-[#1e293b]' : 'text-[#123057]'
        }`}>
          <div className="mb-6 flex justify-center lg:justify-start">
            <img src={logo} alt="CharmChime Logo" className="h-24 w-24 object-contain drop-shadow-sm" />
          </div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] opacity-75">
            Secure verification
          </p>
          <h1 className="mx-auto max-w-2xl text-4xl font-semibold leading-tight sm:text-5xl lg:mx-0">
            One quick code before you continue
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base opacity-80 lg:mx-0">
            Enter the 6-digit OTP for {destination}. This keeps CharmChime accounts protected before the first login.
          </p>
        </section>

        <Card variant={variant} className="relative w-full">
          <div className="space-y-6">
            <div className="space-y-3 text-center">
              <div className="flex justify-center">
                <img src={logo} alt="CharmChime Logo" className="h-16 w-16 object-contain" />
              </div>
              <div>
                <h2 className="text-[#2d3748]">{cardTitle}</h2>
                <p className="mt-2 text-[#64748b]">Code sent to {destination}</p>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-center text-[#475569]">6-digit OTP</label>
              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#94a3b8]" />
                <input
                  value={otp}
                  onChange={(event) => handleOtpChange(event.target.value)}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  placeholder="000000"
                  className={`w-full text-center text-2xl font-semibold tracking-[0.4em] ${
                    variant === 'child' ? 'rounded-full border-2 border-[var(--child-blue)]' : 'rounded-xl border border-gray-300'
                  } bg-white py-4 pl-12 pr-4 text-[#1e293b] transition-all duration-200 focus:outline-none focus:ring-4 ${
                    variant === 'child' ? 'focus:border-[var(--child-blue-dark)] focus:ring-[var(--child-blue)]/20' : 'focus:border-[var(--parent-teal)] focus:ring-[var(--parent-teal)]/20'
                  }`}
                />
              </div>
            </div>

            <Button
              variant={buttonVariant}
              size="large"
              onClick={handleVerify}
              icon={<ShieldCheck className="h-5 w-5" />}
              className="w-full"
              disabled={isVerifying || otp.length !== 6}
            >
              {isVerifying ? 'Verifying...' : 'Verify OTP'}
            </Button>

            <button
              type="button"
              onClick={handleResend}
              disabled={cooldown > 0 || isResending}
              className={`flex w-full items-center justify-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
                variant === 'parent'
                  ? 'border-[var(--parent-teal)]/30 text-[var(--parent-teal)] hover:bg-[var(--parent-teal)]/10'
                  : 'border-[#1a365d]/20 text-[#1a365d] hover:bg-white/50'
              }`}
            >
              <RefreshCw className={`h-4 w-4 ${isResending ? 'animate-spin' : ''}`} />
              {cooldown > 0 ? `Resend OTP in ${cooldown}s` : isResending ? 'Sending...' : 'Resend OTP'}
            </button>

            {success && (
              <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center text-sm text-red-700">
                {error}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
