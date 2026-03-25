import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../components/layout/AuthLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { supabase } from '../lib/supabase';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const { data, error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    if (error) {
      setErrorMsg(error.message);
    } else {
      setSuccessMsg('Login successful! Redirecting to dashboard...');
      // Navigation will go here later
    }
    setLoading(false);
  };

  const headerAction = (
    <div className="text-sm text-gray-300 flex items-center space-x-3">
      <span className="hidden sm:inline">Don't have an account?</span>
      <Link to="/signup" className="text-brand-blue font-semibold hover:text-white transition-colors bg-brand-blue/10 hover:bg-brand-blue/20 px-5 py-2.5 rounded-full border border-brand-blue/20">
        Sign Up
      </Link>
    </div>
  );

  return (
    <AuthLayout headerAction={headerAction}>
      <div className="w-full max-w-md mx-auto animate-fade-in" style={{ animationDelay: '0.15s' }}>
        <h2 className="text-3xl lg:text-4xl font-semibold text-white mb-2">
          Welcome back
        </h2>
        <p className="text-gray-400 mb-8 text-sm">
          Login to your CashPilot account
        </p>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 text-red-400 text-sm rounded-md">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3 bg-green-500/10 border border-green-500/50 text-green-400 text-sm rounded-md">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            label="Your Email" 
            id="email" 
            type="email" 
            placeholder="Enter Email Address"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={loading}
          />
          <Input 
            label="Password" 
            id="password" 
            type="password" 
            placeholder="Enter Password"
            value={formData.password}
            onChange={handleChange}
            required
            disabled={loading}
          />

          <div className="text-right mb-6 -mt-2">
            <a href="#" className="text-sm text-brand-blue hover:text-[#3385ff] transition-colors">
              Forgot password?
            </a>
          </div>

          <Button type="submit" className="mt-2 text-base py-3.5" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>

        <div className="mt-8 text-center bg-[#2c2c2c] p-4 rounded-xl border border-gray-700/50 flex flex-col items-center">
          <p className="text-sm text-gray-400">
            Only authorized CashPilot admins will assist you
          </p>
        </div>

        <p className="text-xs text-center text-gray-500 mt-8">
          By logging in, you agree to our <a href="#" className="text-brand-blue hover:text-[#3385ff] transition-colors">Privacy policy</a> and <a href="#" className="text-brand-blue hover:text-[#3385ff] transition-colors">Terms of Use</a>
        </p>
      </div>
    </AuthLayout>
  );
}
