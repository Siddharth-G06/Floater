import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Users, 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  ShieldCheck,
  Zap,
  Mail
} from 'lucide-react';
import Button from '../components/ui/Button';
import { supabase } from '../lib/supabase';

export default function Relationships() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLeverage, setShowLeverage] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [leverageAnalysis, setLeverageAnalysis] = useState("");
  const navigate = useNavigate();

  const handleAnalyzeLeverage = async () => {
    setShowLeverage(true);
    setAnalyzing(true);
    setLeverageAnalysis("");
    try {
      const response = await fetch('http://localhost:5000/api/analyze-leverage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendors })
      });
      const data = await response.json();
      if (data.success) {
        setLeverageAnalysis(data.analysis);
      } else {
        setLeverageAnalysis("Simulation error: " + (data.error || "Failed to generate report"));
      }
    } catch (err) {
       console.error(err);
       setLeverageAnalysis("Backend unreachable. Please ensure the server is running.");
    } finally {
       setAnalyzing(false);
    }
  };

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

  if (loading && vendors.length === 0) {
    return (
      <div className="min-h-screen bg-[#121212] text-white p-6 lg:p-12 flex flex-col items-center justify-center animate-fade-in font-sans">
         <div className="w-10 h-10 border-4 border-brand-blue border-t-transparent rounded-full animate-spin mb-4"></div>
         <p className="text-gray-500 font-medium animate-pulse">Syncing Trust Graph...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white p-6 lg:p-12 animate-fade-in font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Leverage Analysis Modal */}
        {showLeverage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-fade-in">
             <div className="bg-[#1e1e1e] w-full max-w-2xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-8 border-b border-white/5 bg-gradient-to-r from-brand-blue/20 to-transparent flex justify-between items-center">
                   <div>
                      <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
                         <ShieldCheck className="w-7 h-7 text-brand-blue" />
                         <span>AI Leverage Report</span>
                      </h2>
                      <p className="text-gray-400 text-sm mt-1">Strategic assessment of negotiation power.</p>
                   </div>
                   <button onClick={() => setShowLeverage(false)} className="text-gray-500 hover:text-white text-3xl transition-colors">&times;</button>
                </div>
                
                <div className="p-8 overflow-y-auto space-y-10 custom-scrollbar">
                   <div className="grid grid-cols-2 gap-6">
                      <div className="p-6 bg-green-400/5 border border-green-400/10 rounded-3xl">
                         <p className="text-[10px] font-black uppercase text-green-400 tracking-widest mb-2">Extension Power</p>
                         <h3 className="text-3xl font-black text-white">Strong</h3>
                         <p className="text-xs text-gray-500 mt-2">High leverage trust partners.</p>
                      </div>
                      <div className="p-6 bg-red-400/5 border border-red-400/10 rounded-3xl">
                         <p className="text-[10px] font-black uppercase text-red-400 tracking-widest mb-2">Friction Risk</p>
                         <h3 className="text-3xl font-black text-white">Critical</h3>
                         <p className="text-xs text-gray-500 mt-2">Low negotiation margin.</p>
                      </div>
                   </div>

                   <div className="space-y-4">
                      <h4 className="text-sm font-bold uppercase tracking-widest text-gray-500">Resource Distribution</h4>
                      <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden flex">
                         <div className="h-full bg-green-400" style={{ width: `${(vendors.filter(v => v.score >= 80).length / Math.max(1, vendors.length)) * 100}%` }}></div>
                         <div className="h-full bg-brand-blue" style={{ width: `${(vendors.filter(v => v.score >= 50 && v.score < 80).length / Math.max(1, vendors.length)) * 100}%` }}></div>
                         <div className="h-full bg-red-500" style={{ width: `${(vendors.filter(v => v.score < 50).length / Math.max(1, vendors.length)) * 100}%` }}></div>
                      </div>
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter">
                         <span className="text-green-400">Trust-Based ({vendors.filter(v => v.score >= 80).length})</span>
                         <span className="text-brand-blue">Standard ({vendors.filter(v => v.score >= 50 && v.score < 80).length})</span>
                         <span className="text-red-400">High Risk ({vendors.filter(v => v.score < 50).length})</span>
                      </div>
                   </div>

                   <div className="p-8 bg-white/2 border border-white/5 rounded-3xl space-y-4 shadow-inner">
                      <h4 className="text-lg font-bold flex items-center space-x-2 text-brand-blue">
                         <Zap className="w-5 h-5" />
                         <span>Strategic Resource Allocation Map</span>
                      </h4>
                      <div className="text-gray-300 leading-relaxed border-l-2 border-brand-blue/30 pl-6 py-2">
                         {analyzing ? (
                           <div className="flex flex-col items-center justify-center py-10 space-y-4">
                              <div className="w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
                              <p className="text-xs font-bold text-brand-blue animate-pulse uppercase tracking-widest">Generating Leverage Report via Llama 3...</p>
                           </div>
                         ) : (
                           <div className="whitespace-pre-wrap text-sm leading-7">
                              {leverageAnalysis || "Report error: Analysis failed. Please ensure Ollama is running with llama3 model."}
                           </div>
                         )}
                      </div>
                   </div>
                </div>

                <div className="p-6 border-t border-white/5 bg-white/2 flex justify-end">
                   <button 
                     disabled={analyzing}
                     onClick={() => setShowLeverage(false)} 
                     className="px-8 py-3 rounded-2xl bg-brand-blue hover:bg-[#0051cc] text-white text-sm font-bold uppercase transition-all disabled:opacity-50"
                   >
                     {analyzing ? "AI Thinking..." : "Acknowledge Strategy"}
                   </button>
                </div>
             </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mb-10 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors group">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Dashboard</span>
          </Link>
          <div className="flex items-center space-x-4">
             <button onClick={fetchRelationships} className="text-xs font-bold text-gray-400 hover:text-white transition-colors border border-white/5 bg-white/2 px-3 py-1.5 rounded-lg">
                Refresh
             </button>
             <div className="flex items-center space-x-2 bg-brand-blue/10 px-4 py-2 rounded-full border border-brand-blue/20 text-xs font-bold text-brand-blue uppercase">
                <ShieldCheck className="w-4 h-4" />
                <span>Trust Engine Active</span>
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
            Monitor and maintain your vendor standing. Our AI scoring engine analyzes your history to predict friction.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                                   <h4 className="text-lg font-bold text-white group-hover:text-brand-blue transition-colors truncate max-w-[200px]">{v.vendor_name}</h4>
                                   <div className="flex items-center space-x-3 mt-1 text-[10px]">
                                       <span className={`px-2 py-0.5 rounded-full border uppercase font-bold ${getStatusColor(v.score)}`}>
                                         {getStatusLabel(v.score)}
                                       </span>
                                   </div>
                                 </div>
                             </div>
                             
                             <div className="flex items-center justify-between md:justify-end md:space-x-10 text-center md:text-right">
                                 <div>
                                   <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Health Score</p>
                                   <span className={`text-2xl font-black ${v.score >= 85 ? 'text-green-400' : 'text-white'}`}>{v.score}</span>
                                 </div>
                             </div>
                           </div>
                         </div>
                       ))
                     )}
                  </div>
               </div>
            </div>

            <div className="space-y-6">
               <div className="bg-gradient-to-br from-brand-blue to-[#0051cc] p-8 rounded-3xl shadow-xl shadow-brand-blue/20 relative overflow-hidden group">
                  <Zap className="absolute -right-4 -bottom-4 w-32 h-32 text-white/10" />
                  <h3 className="text-xl font-bold mb-4 relative z-10">Negotiation Power</h3>
                  <p className="text-white/80 text-sm leading-relaxed mb-6 relative z-10">
                     Your average score: <strong>{vendors.length > 0 ? (vendors.reduce((acc, v) => acc + v.score, 0) / vendors.length).toFixed(0) : '0'}/100</strong>.
                  </p>
                  <Button 
                    onClick={handleAnalyzeLeverage}
                    variant="secondary" 
                    className="w-full bg-white/10 border-white/20 hover:bg-white text-brand-blue relative z-10"
                  >
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
                           <p className="text-sm text-gray-300">{v.vendor_name} score is low ({v.score}).</p>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
        </div>
      </div>
    </div>
  );
}
