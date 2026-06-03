import React, { useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Sparkles, Heart, Star, ArrowLeft } from 'lucide-react';
import logo from '../assets/35160e99e546074153c34366a831aa0e30d421e6.png';

interface ChildAuthScreenProps {
  onLogin: (name: string, pin: string) => void;
  onRegister: (name: string, age: string, pin: string) => void;
  onBack: () => void;
}

export function ChildAuthScreen({ onLogin, onRegister, onBack }: ChildAuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const handleSubmit = () => {
    if (isLogin) {
      onLogin(name, pin);
    } else {
      if (pin === confirmPin) {
        onRegister(name, age, pin);
      } else {
        alert('PINs do not match!');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--child-blue)] via-[var(--child-lavender)] to-[var(--child-mint)] flex items-center justify-center p-6">
      {/* Floating decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Star className="absolute top-20 left-20 w-8 h-8 text-[var(--child-yellow)] opacity-60 animate-pulse" fill="currentColor" />
        <Heart className="absolute top-40 right-32 w-10 h-10 text-[var(--child-peach)] opacity-50 animate-pulse" fill="currentColor" style={{ animationDelay: '1s' }} />
        <Sparkles className="absolute bottom-20 right-20 w-8 h-8 text-[var(--child-yellow)] opacity-60 animate-pulse" fill="currentColor" style={{ animationDelay: '0.5s' }} />
      </div>

      <div className="w-full max-w-md relative">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[#1a365d] mb-4 hover:text-[#2d3748] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Home</span>
        </button>

        <Card variant="child" className="relative">
          <div className="space-y-6">
            {/* Logo/Avatar */}
            <div className="flex justify-center">
              <img 
                src={logo} 
                alt="CharmChime Logo" 
                className="w-24 h-24 object-contain animate-bounce" 
                style={{ animationDuration: '3s' }}
              />
            </div>

            {/* Welcome Text */}
            <div className="space-y-2 text-center">
              <h2 className="text-[#2d3748]">
                {isLogin ? 'Welcome Back! 👋' : 'Join CharmChime! ✨'}
              </h2>
              <p className="text-[#4a5568]">
                {isLogin 
                  ? 'Enter your details to continue your journey'
                  : 'Create your magical journaling space'
                }
              </p>
            </div>

            {/* Auth Toggle */}
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

            {/* Form */}
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
                label={isLogin ? "Enter your PIN" : "Create a PIN (4 digits)"}
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
              >
                {isLogin ? 'Start My Journey' : 'Create My Account'}
              </Button>
            </div>

            {/* Parent Notice */}
            {!isLogin && (
              <div className="bg-[var(--child-yellow)]/20 border-2 border-[var(--child-yellow)] rounded-[1.5rem] p-4">
                <p className="text-sm text-[#744210] text-center">
                  🌟 Ask a parent or guardian to help you create your account safely!
                </p>
              </div>
            )}

            {/* Footer */}
            <p className="text-sm text-[#64748b] text-center pt-4">
              Safe • Private • Just for you 🌟
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}