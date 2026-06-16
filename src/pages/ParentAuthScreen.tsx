import React, { useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Shield, Lock, Mail, User, ArrowLeft, Activity } from 'lucide-react';
import logo from '../assets/35160e99e546074153c34366a831aa0e30d421e6.png';

interface ParentAuthScreenProps {
  onLogin: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  onRegister: (name: string, email: string, password: string) => Promise<void>;
  onRequestPasswordReset: (email: string) => Promise<void>;
  onResetPassword: (email: string, otp: string, password: string) => Promise<void>;
  onBack: () => void;
}

export function ParentAuthScreen({ onLogin, onRegister, onRequestPasswordReset, onResetPassword, onBack }: ParentAuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetOtpSent, setResetOtpSent] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    if (isResetMode) {
      setIsSubmitting(true);
      try {
        if (!resetOtpSent) {
          await onRequestPasswordReset(email);
          setResetOtpSent(true);
          setSuccess('Reset OTP sent. Check your email and enter the code below.');
        } else {
          if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
          }

          await onResetPassword(email, resetOtp, password);
          setSuccess('Password reset successfully. You can log in now.');
          setIsResetMode(false);
          setResetOtpSent(false);
          setPassword('');
          setConfirmPassword('');
          setResetOtp('');
          setIsLogin(true);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not reset password. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isLogin) {
        await onLogin(email, password, rememberMe);
      } else {
        await onRegister(name, email, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign you in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[var(--parent-bg)] to-[#e0f2f5] px-5 py-20 sm:px-8 lg:px-12">
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle, #2d9caf 1px, transparent 1px)',
            backgroundSize: '30px 30px',
          }}
        />
      </div>

      <button
        onClick={onBack}
        className="absolute left-5 top-5 z-10 inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-[var(--parent-teal)] shadow-[0_4px_16px_rgba(0,0,0,0.08)] backdrop-blur transition-all hover:bg-white hover:text-[var(--parent-teal-dark)] sm:left-8 sm:top-8"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Home</span>
      </button>

      <div className="relative mx-auto grid min-h-[calc(100vh-10rem)] w-full max-w-6xl items-center gap-8 lg:grid-cols-[1fr_28rem]">
        <section className="text-center lg:text-left">
          <div className="mb-6 flex justify-center lg:justify-start">
            <img src={logo} alt="CharmChime Logo" className="h-24 w-24 object-contain drop-shadow-sm" />
          </div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-[var(--parent-teal)]">
            Parent portal
          </p>
          <h1 className="mx-auto max-w-2xl text-4xl font-semibold leading-tight text-[#1e293b] sm:text-5xl lg:mx-0">
            {isLogin ? 'Monitor wellbeing with confidence' : 'Create your parent account'}
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-[#475569] lg:mx-0">
            {isLogin
              ? "Access your child's emotional trends, routines, and gentle progress insights."
              : "Set up a secure dashboard built around your child's privacy and care."}
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3 lg:max-w-2xl">
            {[
              { label: 'Secure', icon: <Shield className="h-5 w-5" /> },
              { label: 'Insightful', icon: <Activity className="h-5 w-5" /> },
              { label: 'Private', icon: <Lock className="h-5 w-5" /> },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-center gap-2 rounded-xl bg-white/75 px-4 py-3 text-[var(--parent-slate)] shadow-[0_4px_16px_rgba(0,0,0,0.05)] backdrop-blur">
                {item.icon}
                <span className="text-sm font-semibold">{item.label}</span>
              </div>
            ))}
          </div>
        </section>

        <Card variant="parent" className="relative w-full">
          <div className="space-y-6">
            <div className="text-center space-y-3">
              <div className="flex justify-center">
                <img src={logo} alt="CharmChime Logo" className="w-16 h-16 object-contain" />
              </div>
              <div>
                <h2 className="text-[#2d3748]">
                  {isLogin ? 'Parent Login' : 'Sign Up'}
                </h2>
                <p className="text-[#64748b] mt-2">
                  {isLogin
                    ? "Access your child's wellbeing insights."
                    : "Start monitoring your child's emotional journey."}
                </p>
              </div>
            </div>

            {!isResetMode && <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2 rounded-lg transition-all ${
                  isLogin
                    ? 'bg-[var(--parent-teal)] text-white shadow-md'
                    : 'text-[#64748b]'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2 rounded-lg transition-all ${
                  !isLogin
                    ? 'bg-[var(--parent-teal)] text-white shadow-md'
                    : 'text-[#64748b]'
                }`}
              >
                Sign Up
              </button>
            </div>}

            {!isLogin && (
              <div className="bg-[var(--parent-teal)]/10 border border-[var(--parent-teal)]/20 rounded-xl p-4">
                <div className="flex gap-3">
                  <Shield className="w-5 h-5 text-[var(--parent-teal)] flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-[#475569]">
                    <p className="mb-1">Your child's privacy is protected.</p>
                    <p>You'll see emotional trends and insights, not detailed journal content.</p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {!isLogin && !isResetMode && (
                <Input
                  label="Full Name"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  variant="parent"
                  icon={<User className="w-5 h-5" />}
                />
              )}

              <Input
                label={isResetMode ? 'Account Email Address' : 'Email Address'}
                placeholder="parent@example.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                variant="parent"
                icon={<Mail className="w-5 h-5" />}
              />

              {isResetMode && resetOtpSent && (
                <Input
                  label="Reset OTP"
                  placeholder="6-digit code"
                  value={resetOtp}
                  onChange={(e) => setResetOtp(e.target.value)}
                  variant="parent"
                  icon={<Lock className="w-5 h-5" />}
                />
              )}

              {(!isResetMode || resetOtpSent) && <Input
                label={isResetMode ? 'Create New Password' : isLogin ? 'Password' : 'Create Password'}
                placeholder="Enter your password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                variant="parent"
                icon={<Lock className="w-5 h-5" />}
              />}

              {(!isLogin || (isResetMode && resetOtpSent)) && (
                <Input
                  label="Confirm Password"
                  placeholder="Re-enter your password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  variant="parent"
                  icon={<Lock className="w-5 h-5" />}
                />
              )}

              {isLogin && !isResetMode && (
                <div className="flex items-center justify-between gap-4 text-sm">
                  <label className="flex items-center gap-2 text-[#475569] cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded"
                      checked={rememberMe}
                      onChange={(event) => setRememberMe(event.target.checked)}
                    />
                    <span>Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setError('');
                      setSuccess('');
                      setIsResetMode(true);
                      setResetOtpSent(false);
                      setPassword('');
                      setConfirmPassword('');
                      setResetOtp('');
                    }}
                    className="text-[var(--parent-teal)] hover:text-[var(--parent-teal-dark)]"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <Button
                variant="parent-teal"
                size="large"
                onClick={handleSubmit}
                icon={<Shield className="w-5 h-5" />}
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? 'Please wait...'
                  : isResetMode
                    ? resetOtpSent
                      ? 'Reset Password'
                      : 'Send Reset OTP'
                    : isLogin
                      ? 'Access Dashboard'
                      : 'Create Account'}
              </Button>

              {isResetMode && (
                <button
                  type="button"
                  onClick={() => {
                    setIsResetMode(false);
                    setResetOtpSent(false);
                    setError('');
                    setSuccess('');
                  }}
                  className="w-full text-center text-sm text-[var(--parent-teal)] hover:text-[var(--parent-teal-dark)]"
                >
                  Back to login
                </button>
              )}
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center text-sm text-red-700">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center text-sm text-emerald-700">
                {success}
              </div>
            )}

            {!isLogin && (
              <p className="text-xs text-[#94a3b8] text-center">
                By signing up, you agree to our Terms of Service and Privacy Policy.
                CharmChime is designed to protect private journal content.
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
