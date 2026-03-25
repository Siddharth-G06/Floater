import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { LogOut, Activity, MessageSquare, CreditCard, ReceiptText } from 'lucide-react';
import Button from '../components/ui/Button';
import AddPaymentForm from '../components/forms/AddPaymentForm';
import DocumentUpload from '../components/forms/DocumentUpload';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
      } else {
        setUser(session.user);
      }
      setLoading(false);
    };

    fetchUser();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] font-sans text-white p-6 lg:p-12 animate-fade-in">
      {/* Header bar */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 bg-[#1e1e1e] p-6 rounded-2xl shadow-lg border border-white/5">
        <div>
          <h1 className="text-2xl font-bold tracking-wide">Floater Dashboard</h1>
          <p className="text-gray-400 mt-1">Welcome back, <span className="text-[#bbf7d0] font-medium">{user?.email}</span></p>
        </div>
        
        <button 
          onClick={handleLogout}
          className="mt-4 md:mt-0 px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl font-medium flex items-center space-x-2 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out</span>
        </button>
      </header>

      {/* Feature Grid */}
      <div className="max-w-5xl mx-auto">
        <h2 className="text-xl font-semibold mb-6 flex items-center space-x-2">
          <Activity className="w-5 h-5 text-brand-blue" />
          <span>Simulation Tools</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Situation Simulation Card */}
          <div className="bg-gradient-to-br from-[#1e1e1e] to-[#2c2c2c] p-8 rounded-3xl border border-white/5 hover:border-brand-blue/50 transition-all duration-300 group cursor-pointer shadow-xl hover:shadow-brand-blue/10">
            <div className="w-14 h-14 bg-brand-blue/20 rounded-2xl flex items-center justify-center mb-6 text-brand-blue group-hover:scale-110 transition-transform">
              <Activity className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Situation Simulation</h3>
            <p className="text-gray-400 mb-8 leading-relaxed">
              Model your short-term liquidity state, detect upcoming obligation conflicts, and generate prioritized action plans.
            </p>
            <Button variant="primary" className="group-hover:bg-[#0051cc]">
              Launch Simulator
            </Button>
          </div>

          {/* Negotiation Simulation Card */}
          <div className="bg-gradient-to-br from-[#1e1e1e] to-[#2c2c2c] p-8 rounded-3xl border border-white/5 hover:border-purple-500/50 transition-all duration-300 group cursor-pointer shadow-xl hover:shadow-purple-500/10">
            <div className="w-14 h-14 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-6 text-purple-400 group-hover:scale-110 transition-transform">
              <MessageSquare className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Negotiation Simulation</h3>
            <p className="text-gray-400 mb-8 leading-relaxed">
              Rehearse payment deferrals with AI role-playing your actual counterparties based on past relationship history.
            </p>
            <button className="w-full py-3 px-4 rounded-md font-semibold transition duration-200 uppercase tracking-wide text-sm bg-purple-600 hover:bg-purple-700 text-white shadow-md">
              Start Negotiation
            </button>
          </div>
        </div>
      </div>

      {/* Obligations Form Section */}
      <div className="max-w-5xl mx-auto mt-12 mb-12">
        <h2 className="text-xl font-semibold mb-6 flex items-center space-x-2">
          <CreditCard className="w-5 h-5 text-green-400" />
          <span>Manage Obligations</span>
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <AddPaymentForm />
          </div>
          <div className="lg:col-span-1">
            <DocumentUpload />
          </div>
        </div>
      </div>
    </div>
  );
}
