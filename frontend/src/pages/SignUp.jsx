import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/layout/AuthLayout';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import { supabase } from '../lib/supabase';

export default function SignUp() {
  const [formData, setFormData] = useState({
    businessName: '',
    businessType: '',
    phone: '',
    email: '',
    password: '',
    currentBalance: ''
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          business_name: formData.businessName,
          business_type: formData.businessType,
          phone: formData.phone,
          current_balance: formData.currentBalance
        }
      }
    });

    if (error) {
      setErrorMsg(error.message);
    } else {
      setSuccessMsg('Account created successfully! Redirecting to dashboard...');
      setTimeout(() => navigate('/dashboard'), 1500);
    }
    setLoading(false);
  };

  const businessTypes = [
    { value: 'retail', label: 'Retail' },
    { value: 'service', label: 'Service' },
    { value: 'manufacturing', label: 'Manufacturing' },
  ];

  const headerAction = (
    <div className="text-sm text-gray-300 flex items-center space-x-3">
      <span className="hidden sm:inline">Already have an account?</span>
      <Link to="/login" className="text-brand-blue font-semibold hover:text-white transition-colors bg-brand-blue/10 hover:bg-brand-blue/20 px-5 py-2.5 rounded-full border border-brand-blue/20">
        Login
      </Link>
    </div>
  );

  return (
    <AuthLayout headerAction={headerAction}>
      <div className="w-full max-w-md mx-auto animate-fade-in" style={{ animationDelay: '0.15s' }}>
        <h2 className="text-3xl lg:text-4xl font-semibold text-white mb-2">
          Create Account
        </h2>
        <p className="text-gray-400 mb-8 text-sm">
          Get started with Floater today
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
            label="Business Name" 
            id="businessName" 
            placeholder="e.g. Coimbatore Mills"
            value={formData.businessName}
            onChange={handleChange}
            required
            disabled={loading}
          />
          
          <Select 
            label="Business Type" 
            id="businessType"
            options={businessTypes}
            value={formData.businessType}
            onChange={handleChange}
            required
            disabled={loading}
          />

          <Input 
            label="Mobile Number" 
            id="phone" 
            type="tel"
            placeholder="+91 Mobile Number"
            value={formData.phone}
            onChange={handleChange}
            required
            disabled={loading}
          />

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
            placeholder="Create Password"
            value={formData.password}
            onChange={handleChange}
            required
            disabled={loading}
          />

          <Input 
            label="Current Balance (₹)" 
            id="currentBalance" 
            type="number" 
            placeholder="e.g. 50000"
            value={formData.currentBalance}
            onChange={handleChange}
            required
            disabled={loading}
          />

          <Button type="submit" className="mt-8 text-base py-3.5" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>
      </div>
    </AuthLayout>
  );
}
