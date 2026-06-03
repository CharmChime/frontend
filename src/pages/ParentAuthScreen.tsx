import React, { useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Shield, Lock, Mail, User, ArrowLeft } from 'lucide-react';
import logo from '../assets/35160e99e546074153c34366a831aa0e30d421e6.png';

interface ParentAuthScreenProps {
  onLogin: (email: string, password: string) => void;
  onRegister: (name: string, email: string, password: string) => void;
  onBack: () => void;
}

export function ParentAuthScreen({ onLogin, onRegister, onBack }: ParentAuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = () => {
    if (isLogin) {
      onLogin(email, password);
    } else {
      if (password === confirmPassword) {
        onRegister(name, email, password);
      } else {
        alert('Passwords do not match!');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--parent-bg)] to-[#e0f2f5] flex items-center justify-center p-6">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle, #2d9caf 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }}></div>
      </div>

      <div className="w-full max-w-md relative">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[var(--parent-teal)] mb-4 hover:text-[var(--parent-teal-dark)] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Home</span>
        </button>

        <Card variant="parent" className="relative">
          <div className="space-y-6">
            {/* Logo/Header */}
            <div className="text-center space-y-3">
              <div className="flex justify-center">
                <img 
                  src={logo} 
                  alt="CharmChime Logo" 
                  className="w-16 h-16 object-contain"
                />
              </div>
              <div>
                <h2 className="text-[#2d3748]">
                  {isLogin ? 'Parent Dashboard Login' : 'Create Parent Account'}
                </h2>
                <p className="text-[#64748b] mt-2">
                  {isLogin 
                    ? 'Access your child\'s wellbeing insights'
                    : 'Start monitoring your child\'s emotional journey'
                  }
                </p>
              </div>
            </div>

            {/* Auth Toggle */}
            <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
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
            </div>

            {/* Security Notice */}
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

            {/* Form */}
            <div className="space-y-4">
              {!isLogin && (
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
                label="Email Address"
                placeholder="parent@example.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                variant="parent"
                icon={<Mail className="w-5 h-5" />}
              />

              <Input
                label={isLogin ? "Password" : "Create Password"}
                placeholder="Enter your password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                variant="parent"
                icon={<Lock className="w-5 h-5" />}
              />

              {!isLogin && (
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

              {isLogin && (
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 text-[#475569] cursor-pointer">
                    <input type="checkbox" className="rounded" />
                    <span>Remember me</span>
                  </label>
                  <a href="#" className="text-[var(--parent-teal)] hover:text-[var(--parent-teal-dark)]">
                    Forgot password?
                  </a>
                </div>
              )}

              <Button
                variant="parent-teal"
                size="large"
                onClick={handleSubmit}
                icon={<Shield className="w-5 h-5" />}
                className="w-full"
              >
                {isLogin ? 'Access Dashboard' : 'Create Account'}
              </Button>
            </div>

            {/* Terms */}
            {!isLogin && (
              <p className="text-xs text-[#94a3b8] text-center">
                By signing up, you agree to our Terms of Service and Privacy Policy. 
                CharmChime is not designed to collect PII or sensitive data.
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}