import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Users, 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  CheckCircle2, 
  Mail,
  ShieldCheck,
  Zap
} from 'lucide-react';
import Button from '../components/ui/Button';

import { supabase } from '../lib/supabase';

export default function Relationships() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRelationships();
  }, []);

  const fetchRelationships = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || 'mock-user';

      const response = await fetch(`http://localhost:5000/api/relationships?userId=${userId}`);
      const data = await response.json();
      
      if (data.success) {
        const vendorArray = Object.values(data.relationships);
        setVendors(vendorArray);
      }
    } catch (error) {
      console.error("Error fetching relationships:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (score) => {
    if (score >= 80) return "text-green-400 bg-green-400/10 border-green-400/20";
    if (score >= 50) return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
    return "text-red-400 bg-red-400/10 border-red-400/20";
  };

  const getStatusLabel = (score) => {
    if (score >= 80) return "Strong";
    if (score >= 50) return "Stable";
    return "At Risk";
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white p-6 lg:p-12 animate-fade-in font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Navigation */}
        <div className="mb-10 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors group">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Dashboard</span>
          </Link>
          <div className="flex items-center space-x-6">
             <button 
                onClick={fetchRelationships}
                disabled={loading}
                className="text-xs font-bold text-gray-400 hover:text-white flex items-center space-x-2 transition-colors border border-white/5 bg-white/2 px-3 py-1.5 rounded-lg disabled:opacity-50"
             >
                <Zap className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>{loading ? 'Syncing...' : 'Refresh Standing'}</span>
             </button>
             <div className="flex items-center space-x-2 bg-brand-blue/10 px-4 py-2 rounded-full border border-brand-blue/20">
                <ShieldCheck className="w-4 h-4 text-brand-blue" />
                <span className="text-xs font-bold text-brand-blue uppercase tracking-widest">Trust Engine Active</span>
             </div>
          </div>
        </div>

        {/* Header Section */}
        <div className="mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-4 flex items-center space-x-4">
            <Users className="w-10 h-10 text-brand-blue" />
            <span>Relationship Health</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl leading-relaxed">
            Monitor and maintain your vendor standing. Our AI scoring engine analyzes your payment history to predict relationship friction before it happens.
          </p>
        </div>

        {/* Dashboard Grid */}
        {loading && vendors.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
             <div className="w-10 h-10 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
             <p className="text-gray-500 font-medium animate-pulse">Syncing Trust Graph...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main Stats Column */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-[#1e1e1e] rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
                 <div className="p-6 border-b border-white/5 bg-white/2 flex justify-between items-center">
                    <h2 className="text-xl font-bold flex items-center space-x-2">
                       <Zap className="w-5 h-5 text-yellow-500" />
                       <span>Active Counterparties</span>
                    </h2>
                    <span className="text-xs text-gray-500 uppercase font-black tracking-widest">{vendors.length} Total</span>
                 </div>
                 
                 <div className="divide-y divide-white/5">
                    {vendors.length === 0 ? (
                       <div className="p-20 text-center">
                          <Users className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                          <h4 className="text-xl font-bold text-gray-500">No Relationship Data Yet</h4>
                          <p className="text-gray-600 max-w-sm mx-auto mt-2">Upload your first receipts or add obligations to start tracking your vendor trust scores.</p>
                       </div>
                    ) : (
                      vendors.sort((a,b) => b.score - a.score).map((v, i) => (
                        <div key={i} className="p-6 hover:bg-white/2 transition-colors group">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center space-x-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xl ${v.score >= 80 ? 'bg-green-500/10 text-green-400' : 'bg-brand-blue/10 text-brand-blue'}`}>
                                  {v.vendor_name.charAt(0)}
                                </div>
                                <div>
                                  <h4 className="text-lg font-bold text-white group-hover:text-brand-blue transition-colors text-ellipsis overflow-hidden max-w-[200px] whitespace-nowrap">{v.vendor_name}</h4>
                                  <div className="flex items-center space-x-3 mt-1">
                                      <span className={`text-[10px] px-2 py-0.5 rounded-full border uppercase font-bold tracking-tighter ${getStatusColor(v.score)}`}>
                                        {getStatusLabel(v.score)}
                                      </span>
                                      <span className="text-xs text-gray-500">{v.total_transactions} Transactions</span>
                                  </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between md:justify-end md:space-x-10">
                                <div className="text-center md:text-right">
                                  <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Health Score</p>
                                  <div className="flex items-center space-x-2">
                                      <span className={`text-2xl font-black ${v.score >= 85 ? 'text-green-400' : v.score >= 50 ? 'text-white' : 'text-red-400'}`}>
                                        {v.score}
                                      </span>
                                      {v.score >= 80 ? (
                                        <TrendingUp className="w-4 h-4 text-green-400" />
                                      ) : (
                                        <TrendingDown className="w-4 h-4 text-red-400" />
                                      )}
                                  </div>
                                </div>
                                
                                <div className="flex space-x-2">
                                  <button className="p-2.5 bg-white/5 hover:bg-brand-blue/20 hover:text-brand-blue rounded-xl transition-all border border-transparent hover:border-brand-blue/30">
                                      <Mail className="w-5 h-5" />
                                  </button>
                                  <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold transition-all border border-white/5 uppercase tracking-widest">
                                      Details
                                  </button>
                                </div>
                            </div>
                          </div>
                          
                          {/* Subtle progress bar */}
                          <div className="mt-6 w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div 
                                className={`h-full transition-all duration-1000 ${v.score >= 80 ? 'bg-green-400' : v.score >= 50 ? 'bg-brand-blue' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'}`}
                                style={{ width: `${v.score}%` }}
                            ></div>
                          </div>
                        </div>
                      ))
                    )}
                 </div>
              </div>
            </div>

            {/* Side Insights Column */}
            <div className="space-y-6">
               <div className="bg-gradient-to-br from-brand-blue to-[#0051cc] p-8 rounded-3xl shadow-xl shadow-brand-blue/20 relative overflow-hidden group">
                  <Zap className="absolute -right-4 -bottom-4 w-32 h-32 text-white/10 group-hover:scale-110 transition-transform duration-700" />
                  <h3 className="text-xl font-bold mb-4 relative z-10">Negotiation Power</h3>
                  <p className="text-white/80 text-sm leading-relaxed mb-6 relative z-10">
                     Your average health score is <strong>{vendors.length > 0 ? (vendors.reduce((acc, v) => acc + v.score, 0) / vendors.length).toFixed(0) : '0'}/100</strong>. Our AI recommends requesting extensions only from your "Strong" vendors.
                  </p>
                  <Button variant="secondary" className="w-full bg-white/10 border-white/20 hover:bg-white text-brand-blue relative z-10">
                     Analyze Leverage
                  </Button>
               </div>

               <div className="bg-[#1e1e1e] p-8 rounded-3xl border border-white/5 shadow-xl">
                  <h3 className="text-lg font-bold mb-6 flex items-center space-x-2">
                     <AlertCircle className="w-5 h-5 text-red-400" />
                     <span>Priority Alerts</span>
                  </h3>
                  <div className="space-y-4">
                     {vendors.filter(v => v.score < 50).map((v, i) => (
                        <div key={i} className="p-4 bg-red-400/5 border border-red-400/20 rounded-2xl">
                           <p className="text-xs font-bold text-red-300 uppercase mb-1">Critical Friction</p>
                           <p className="text-sm text-gray-300">{v.vendor_name} score is dangerously low ({v.score}). Prioritize their payments immediately.</p>
                        </div>
                     ))}
                     {vendors.filter(v => v.score < 50).length === 0 && (
                        <div className="p-4 bg-green-400/5 border border-green-400/20 rounded-2xl">
                           <p className="text-xs font-bold text-green-300 uppercase mb-1">All Stable</p>
                           <p className="text-sm text-gray-300">No critical relationship friction detected across your payment network.</p>
                        </div>
                     )}
                  </div>
               </div>
            </div>
            
          </div>
        )}
      </div>
    </div>
  );
}
