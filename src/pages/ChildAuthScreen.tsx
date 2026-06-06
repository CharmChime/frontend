import React, { useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Sparkles, Heart, Star, ArrowLeft } from 'lucide-react';
import logo from '../assets/35160e99e546074153c34366a831aa0e30d421e6.png';

interface ChildAuthScreenProps {
  onLogin: (name: string, pin: string) => Promise<void>;
  onRegister: (name: string, age: string, pin: string) => Promise<void>;
  onBack: () => void;
}

export function ChildAuthScreen({ onLogin, onRegister, onBack }: ChildAuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setError('');

    if (!isLogin && pin !== confirmPin) {
      setError('PINs do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isLogin) {
        await onLogin(name, pin);
      } else {
        await onRegister(name, age, pin);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign you in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[var(--child-blue)] via-[var(--child-lavender)] to-[var(--child-mint)] px-5 py-20 sm:px-8 lg:px-12">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Star className="absolute top-20 left-20 w-8 h-8 text-[var(--child-yellow)] opacity-60 animate-pulse" fill="currentColor" />
        <Heart className="absolute top-40 right-32 w-10 h-10 text-[var(--child-peach)] opacity-50 animate-pulse" fill="currentColor" style={{ animationDelay: '1s' }} />
        <Sparkles className="absolute bottom-20 right-20 w-8 h-8 text-[var(--child-yellow)] opacity-60 animate-pulse" fill="currentColor" style={{ animationDelay: '0.5s' }} />
      </div>

      <button
        onClick={onBack}
        className="absolute left-5 top-5 z-10 inline-flex items-center gap-2 rounded-full bg-white/85 px-4 py-2 text-[#1a365d] shadow-[0_4px_16px_rgba(0,0,0,0.08)] backdrop-blur transition-all hover:bg-white hover:text-[#2d3748] sm:left-8 sm:top-8"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Home</span>
      </button>

      <div className="relative mx-auto grid min-h-[calc(100vh-10rem)] w-full max-w-6xl items-center gap-8 lg:grid-cols-[1fr_28rem]">
        <section className="text-center text-[#1a365d] lg:text-left">
          <div className="mb-6 flex justify-center lg:justify-start">
            <img src={logo} alt="CharmChime Logo" className="h-28 w-28 object-contain drop-shadow-sm" />
          </div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-[#1a365d]/70">
            Child space
          </p>
          <h1 className="mx-auto max-w-2xl text-4xl font-semibold leading-tight text-[#123057] sm:text-5xl lg:mx-0">
            {isLogin ? 'Welcome back to your journal' : 'Create your magical journal'}
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-[#1a365d]/80 lg:mx-0">
            {isLogin
              ? 'Pick up where you left off and keep your thoughts, stories, and memories close.'
              : 'Set up a private, friendly place for daily feelings, stories, and little wins.'}
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3 lg:max-w-2xl">
            {['Safe', 'Private', 'Creative'].map((item) => (
              <div key={item} className="rounded-[1.25rem] bg-white/35 px-4 py-3 text-center shadow-[0_4px_16px_rgba(0,0,0,0.05)] backdrop-blur">
                <span className="text-sm font-semibold text-[#123057]">{item}</span>
              </div>
            ))}
          </div>
        </section>

        <Card variant="child" className="relative w-full">
          <div className="space-y-6">
            <div className="flex justify-center">
              <img
                src={logo}
                alt="CharmChime Logo"
                className="w-24 h-24 object-contain animate-bounce"
                style={{ animationDuration: '3s' }}
              />
            </div>

            <div className="space-y-2 text-center">
              <h2 className="text-[#2d3748]">{isLogin ? 'Login' : 'Sign Up'}</h2>
              <p className="text-[#4a5568]">
                {isLogin
                  ? 'Enter your details to continue your journey.'
                  : 'Create your magical journaling space.'}
              </p>
            </div>

            <div className="flex gap-2 bg-gray-100 p-1 rounded-full">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2 rounded-full transition-all ${
                  isLogin
                    ? 'bg-[var(--child-blue)] text-[#1a365d] shadow-md'
                    : 'text-[#64748b]'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2 rounded-full transition-all ${
                  !isLogin
                    ? 'bg-[var(--child-blue)] text-[#1a365d] shadow-md'
                    : 'text-[#64748b]'
                }`}
              >
                Sign Up
              </button>
            </div>

            <div className="space-y-4 pt-4">
              <Input
                label="What's your name?"
                placeholder="Enter your name..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                variant="child"
                icon={<Heart className="w-5 h-5" fill="currentColor" />}
              />

              {!isLogin && (
                <Input
                  label="How old are you?"
                  placeholder="Your age..."
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  variant="child"
                  icon={<Star className="w-5 h-5" fill="currentColor" />}
                />
              )}

              <Input
                label={isLogin ? 'Enter your PIN' : 'Create a PIN (4 digits)'}
                placeholder="****"
                type="password"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                variant="child"
                icon={<Star className="w-5 h-5" fill="currentColor" />}
              />

              {!isLogin && (
                <Input
                  label="Confirm your PIN"
                  placeholder="****"
                  type="password"
                  maxLength={4}
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  variant="child"
                  icon={<Star className="w-5 h-5" fill="currentColor" />}
                />
              )}

              <Button
                variant="child-blue"
                size="large"
                onClick={handleSubmit}
                icon={<Sparkles className="w-5 h-5" fill="currentColor" />}
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Please wait...' : isLogin ? 'Start My Journey' : 'Create My Account'}
              </Button>
            </div>

            {error && (
              <div className="rounded-[1.5rem] border-2 border-red-200 bg-red-50 p-4 text-center text-sm text-red-700">
                {error}
              </div>
            )}

            {!isLogin && (
              <div className="bg-[var(--child-yellow)]/20 border-2 border-[var(--child-yellow)] rounded-[1.5rem] p-4">
                <p className="text-sm text-[#744210] text-center">
                  Ask a parent or guardian to help you create your account safely.
                </p>
              </div>
            )}

            <p className="text-sm text-[#64748b] text-center pt-4">
              Safe - Private - Just for you
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
