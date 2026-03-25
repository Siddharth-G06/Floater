import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  MessageSquare, 
  ArrowLeft, 
  Search, 
  Info, 
  AlertTriangle, 
  CheckCircle2, 
  Send,
  Zap,
  TrendingUp,
  Mail
} from 'lucide-react';
import Button from '../components/ui/Button';
import { supabase } from '../lib/supabase';

export default function Negotiate() {
  const [obligations, setObligations] = useState([]);
  const [selectedOb, setSelectedOb] = useState(null);
  const [loading, setLoading] = useState(true);
  const [negotiating, setNegotiating] = useState(false);
  const [plan, setPlan] = useState(null);
  const [search, setSearch] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchObligations();
  }, []);

  const fetchObligations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('obligations').select('*');
      if (error) throw error;
      setObligations(data || []);
    } catch (err) {
      console.error("Error loading obligations:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleNegotiate = async (ob) => {
    setSelectedOb(ob);
    setNegotiating(true);
    setPlan(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // We simulate a "Decision" based on obligation health
      // In a real app, this comes from the Scenario Simulator
      const decision = {
        action: ob.amount > 10000 ? "partial_pay" : "delay",
        delay_days: 7,
        recommended_amount: ob.amount * 0.5
      };

      const response = await fetch('http://localhost:5000/api/negotiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transaction: { vendor_name: ob.name, amount: ob.amount, due_date: ob.due_date },
          decision: decision,
          userId: user?.id || 'mock-user'
        })
      });

      const data = await response.json();
      if (data.success) {
        setPlan(data.plan);
      }
    } catch (err) {
      console.error("Negotiation failed:", err);
    } finally {
      setNegotiating(false);
    }
  };

  const [generating, setGenerating] = useState(false);
  const [generatedEmail, setGeneratedEmail] = useState("");

  const generateEmail = async () => {
    if (!plan) return;
    setGenerating(true);
    try {
      const response = await fetch('http://localhost:5000/api/generate-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendor_name: plan.vendor_name,
          amount: plan.proposed_amount,
          due_date: selectedOb.due_date,
          mode: plan.urgency,
          strategy: plan.strategy
        })
      });

      const data = await response.json();
      if (data.success) {
        setGeneratedEmail(data.email);
      } else {
        alert("Generation failed: " + data.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const filtered = obligations.filter(ob => 
    ob.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 lg:p-12 animate-fade-in font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Navigation */}
        <div className="mb-10">
          <Link to="/dashboard" className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors group">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Exit Simulator</span>
          </Link>
        </div>

        {/* Generated Email Modal */}
        {generatedEmail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-fade-in">
             <div className="bg-[#121212] w-full max-w-2xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
                <div className="p-6 border-b border-white/5 bg-white/2 flex justify-between items-center">
                   <div className="flex items-center space-x-3 text-brand-blue">
                      <Mail className="w-6 h-6" />
                      <h2 className="text-xl font-bold text-white">AI Generated Negotiation</h2>
                   </div>
                   <button onClick={() => setGeneratedEmail("")} className="text-gray-500 hover:text-white text-xl">&times;</button>
                </div>
                <div className="p-8 overflow-y-auto whitespace-pre-wrap text-gray-300 font-serif leading-relaxed text-lg bg-black/20">
                   {generatedEmail}
                </div>
                <div className="p-6 border-t border-white/5 bg-white/2 flex justify-end space-x-4">
                   <button 
                     onClick={() => {
                        navigator.clipboard.writeText(generatedEmail);
                        alert("Copied to clipboard!");
                     }}
                     className="px-6 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-sm font-bold uppercase transition-all"
                   >
                     Copy to Clipboard
                   </button>
                   <button 
                     onClick={() => setGeneratedEmail("")}
                     className="px-6 py-2.5 rounded-xl bg-brand-blue hover:bg-[#0051cc] text-white text-sm font-bold uppercase transition-all"
                   >
                     Done
                   </button>
                </div>
             </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column: List of Obligations */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#161616] p-6 rounded-3xl border border-white/5 space-y-6">
              <div className="flex items-center space-x-3">
                <MessageSquare className="w-6 h-6 text-brand-blue" />
                <h1 className="text-xl font-bold">AI Negotiator</h1>
              </div>
              
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                <input 
                  type="text" 
                  placeholder="Search vendors..." 
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-brand-blue/50 transition-colors"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar">
                {loading ? (
                  Array(3).fill(0).map((_, i) => (
                    <div key={i} className="h-20 bg-white/2 rounded-2xl animate-pulse"></div>
                  ))
                ) : filtered.length === 0 ? (
                  <div className="text-center py-10 opacity-30">No obligations found</div>
                ) : filtered.map((ob, i) => (
                  <button 
                    key={i}
                    onClick={() => handleNegotiate(ob)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all ${
                      selectedOb?.id === ob.id 
                        ? 'bg-brand-blue/10 border-brand-blue/40' 
                        : 'bg-white/2 border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-sm truncate max-w-[120px]">{ob.name}</span>
                      <span className="text-xs font-black text-brand-blue">${ob.amount?.toLocaleString()}</span>
                    </div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">Due {ob.due_date}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Negotiation Results */}
          <div className="lg:col-span-8">
            {!selectedOb ? (
              <div className="h-full min-h-[500px] bg-[#161616]/50 rounded-3xl border-2 border-dashed border-white/5 flex flex-col items-center justify-center p-12 text-center group">
                 <div className="w-20 h-20 bg-white/2 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Zap className="w-8 h-8 text-gray-600 group-hover:text-brand-blue transition-colors" />
                 </div>
                 <h2 className="text-2xl font-bold text-gray-400 mb-2">Select a Vendor to Start</h2>
                 <p className="text-gray-600 max-w-sm">
                    Our AI will analyze your relationship health and current cash position to recommend the best negotiation tactic.
                 </p>
              </div>
            ) : negotiating ? (
              <div className="h-full min-h-[500px] bg-[#161616] rounded-3xl border border-white/5 flex flex-col items-center justify-center p-12 text-center">
                 <div className="w-12 h-12 border-4 border-brand-blue border-t-transparent rounded-full animate-spin mb-6"></div>
                 <h2 className="text-xl font-bold text-brand-blue mb-2 italic">Analyzing Relationship Dynamics...</h2>
                 <p className="text-gray-500">Checking payment history & calculating leverage</p>
              </div>
            ) : plan ? (
              <div className="space-y-6 animate-slide-up">
                 {/* Top Strategy Card */}
                 <div className="bg-gradient-to-br from-brand-blue to-[#0051cc] p-8 rounded-3xl shadow-2xl shadow-brand-blue/20 relative overflow-hidden">
                    <TrendingUp className="absolute -right-4 -top-4 w-32 h-32 text-white/5" />
                    <div className="relative z-10">
                       <div className="flex items-center space-x-2 mb-2">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter bg-white text-brand-blue`}>
                             {plan.tone} TONE
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter bg-black/20 text-white border border-white/10">
                             {plan.urgency} URGENCY
                          </span>
                       </div>
                       <h2 className="text-3xl font-black mb-4">{plan.strategy}</h2>
                       <p className="text-white/80 leading-relaxed max-w-xl">
                          {plan.reason || "The AI recommends this approach to preserve the relationship while optimizing your current cash liquidity."}
                       </p>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Execution Details */}
                    <div className="bg-[#161616] p-8 rounded-3xl border border-white/5 space-y-6">
                       <h3 className="text-sm font-black uppercase tracking-widest text-gray-500 mb-4 flex items-center space-x-2">
                          <Info className="w-4 h-4" />
                          <span>Execution Details</span>
                       </h3>
                       <div className="space-y-4">
                          <div className="flex justify-between items-center py-3 border-b border-white/5">
                             <span className="text-gray-400 text-sm">Action</span>
                             <span className="font-bold text-brand-blue uppercase text-xs tracking-widest">{plan.action}</span>
                          </div>
                          <div className="flex justify-between items-center py-3 border-b border-white/5">
                             <span className="text-gray-400 text-sm">Proposed Amount</span>
                             <span className="font-bold text-white text-sm">${plan.proposed_amount?.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center py-3 border-b border-white/5">
                             <span className="text-gray-400 text-sm">Delay Request</span>
                             <span className="font-bold text-white text-sm">{plan.delay_days} days</span>
                          </div>
                          <div className="flex justify-between items-center py-3">
                             <span className="text-gray-400 text-sm">Negotiation Intensity</span>
                             <div className="flex items-center space-x-2">
                                <span className="font-bold text-sm">{(plan.intensity_score * 100).toFixed(0)}%</span>
                                <div className="w-20 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                   <div className="h-full bg-brand-blue" style={{ width: `${plan.intensity_score * 100}%` }}></div>
                                </div>
                             </div>
                          </div>
                       </div>
                    </div>

                    {/* Email Preview */}
                    <div className="bg-[#161616] p-8 rounded-3xl border border-white/5 space-y-6 flex flex-col">
                       <h3 className="text-sm font-black uppercase tracking-widest text-gray-500 mb-4 flex items-center space-x-2">
                          <Mail className="w-4 h-4" />
                          <span>Smart Draft Input</span>
                       </h3>
                       <div className="flex-1 bg-black/40 p-4 rounded-2xl border border-white/5 text-xs text-gray-400 leading-relaxed overflow-hidden italic">
                          "{plan.strategy}. Please note that we are prioritizing your account but require {plan.delay_days} days to settle the full amount..."
                       </div>
                       <Button 
                         onClick={generateEmail}
                         disabled={generating}
                         className="w-full bg-white/5 border-white/10 hover:bg-brand-blue hover:border-brand-blue transition-all group"
                       >
                          <Send className={`w-4 h-4 mr-2 ${generating ? 'animate-bounce' : 'group-hover:translate-x-1'} transition-transform`} />
                          <span>{generating ? 'AI is Writing...' : 'Open Email Generator'}</span>
                       </Button>
                    </div>
                 </div>
              </div>
            ) : null}
          </div>

        </div>
      </div>
    </div>
  );
}
