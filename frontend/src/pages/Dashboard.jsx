import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { LogOut, Activity, MessageSquare, CreditCard, ReceiptText } from 'lucide-react';
import Button from '../components/ui/Button';
import AddPaymentForm from '../components/forms/AddPaymentForm';
import DocumentUpload from '../components/forms/DocumentUpload';
import SituationPanel from '../components/ui/SituationPanel';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);
  const [activeScenario, setActiveScenario] = useState(null);
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

  const handleApplyScenario = async (scenario) => {
    setActiveScenario(scenario);
    setSimulating(true);
    setSimulationResult(null);

    try {
      // 1. Fetch real obligations
      const { data: obligations, error } = await supabase
        .from('obligations')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      if (!obligations || obligations.length === 0) {
        alert("You have no obligations to simulate against!");
        setSimulating(false);
        return;
      }

      // 2. Apply "Worst Case" logic to the balance
      let simulatedBalance = parseFloat(user?.user_metadata?.current_balance || 0);
      
      if (scenario.effect.type === 'balance_reduction') {
        simulatedBalance -= scenario.effect.value;
      } else if (scenario.effect.type === 'balance_percent_reduction') {
        simulatedBalance *= (1 - scenario.effect.value);
      }

      // Ensure balance doesn't go crazy negative for the math engine
      simulatedBalance = Math.max(-10000, simulatedBalance);

      // 3. Send to scoring API
      const response = await fetch('http://localhost:5000/api/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          balance: simulatedBalance, 
          obligations 
        })
      });

      if (!response.ok) throw new Error("Simulator API error");

      const result = await response.json();
      setSimulationResult(result.scored_obligations);

      // Auto-scroll to results
      setTimeout(() => {
        document.getElementById('simulation-results')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);

    } catch (err) {
       console.error(err);
       alert("Error running simulation: " + err.message);
    } finally {
       setSimulating(false);
    }
  };

  const handleSimulate = async () => {
    setActiveScenario(null); // Clear any specific chosen scenario label
    setSimulating(true);
    setSimulationResult(null);

    try {
      // 1. Fetch obligations
      const { data: obligations, error } = await supabase
        .from('obligations')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      
      if (!obligations || obligations.length === 0) {
        alert("You don't have any obligations saved!");
        setSimulating(false);
        return;
      }

      // 2. Get user balance
      const balance = parseFloat(user?.user_metadata?.current_balance || 0);

      // 3. Send to API
      const response = await fetch('http://localhost:5000/api/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ balance, obligations })
      });

      if (!response.ok) throw new Error("Simulation API failed. Check if Node backend is running.");

      const result = await response.json();
      setSimulationResult(result.scored_obligations);
      
      // Auto-scroll to results
      setTimeout(() => {
        document.getElementById('simulation-results')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);

    } catch (err) {
      console.error(err);
      alert("Simulation error: " + err.message);
    } finally {
      setSimulating(false);
    }
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
            <h3 className="text-2xl font-bold mb-3">Payment Priority</h3>
            <p className="text-gray-400 mb-8 leading-relaxed">
              Model your short-term liquidity state, detect upcoming obligation conflicts, and generate prioritized action plans.
            </p>
            <Button 
              variant="primary" 
              className="group-hover:bg-[#0051cc]" 
              onClick={handleSimulate}
              disabled={simulating}
            >
              {simulating ? 'Analyzing Data...' : 'Launch Simulator'}
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

        {/* Situation Simulator Container - Positioned below Priority Cards */}
        <div className="mt-6">
          <SituationPanel 
            onApplyScenario={handleApplyScenario} 
            activeScenarioId={activeScenario?.id}
            isSimulating={simulating}
          />
        </div>
      </div>

      {/* Simulation Results Section */}
      {simulationResult && (
        <div className="max-w-5xl mx-auto mt-12 mb-12 animate-fade-in" id="simulation-results">
          <div className="bg-[#1e1e1e] rounded-3xl p-8 lg:p-12 border border-brand-blue/30 shadow-2xl shadow-brand-blue/5 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-blue to-green-400"></div>
             
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <h3 className="text-2xl md:text-3xl font-bold text-white flex items-center space-x-3">
                   <Activity className="text-brand-blue w-8 h-8" />
                   <span>{activeScenario ? `Simulation: ${activeScenario.label}` : 'AI Payment Action Plan'}</span>
                </h3>
                <div className="bg-[#252525] px-5 py-3 rounded-xl border border-white/10 text-sm shadow-inner text-center">
                   <span className="text-gray-400">{activeScenario ? 'Simulated Balance:' : 'Current Balance:'}</span>
                   <span className={`${activeScenario ? 'text-red-400' : 'text-[#bbf7d0]'} font-bold text-base ml-2 tracking-tight`}>
                      ₹{activeScenario 
                        ? (activeScenario.effect.type === 'balance_reduction' 
                            ? (parseFloat(user?.user_metadata?.current_balance || 0) - activeScenario.effect.value)
                            : (parseFloat(user?.user_metadata?.current_balance || 0) * (1 - activeScenario.effect.value))
                          ).toLocaleString()
                        : parseFloat(user?.user_metadata?.current_balance || 0).toLocaleString()
                      }
                   </span>
                </div>
             </div>
             
             <p className="text-gray-400 mb-10 max-w-3xl leading-relaxed text-sm md:text-base">
               {activeScenario 
                 ? `This plan shows exactly how your priorities would shift if "${activeScenario.label}" were to happen today. Note the intensified priority scores.`
                 : "Your obligations have been mathematically ranked by our CashPilot engine based on urgency, relationship penalty, flexibility, and cash impact constraints."
               } <strong className="text-white">Pay the items at the top first to avoid severe friction.</strong>
             </p>
             
             <div className="space-y-4">
               {simulationResult.map((o, idx) => (
                 <div key={idx} className={`flex items-center justify-between p-5 rounded-2xl border transition-all ${idx === 0 ? 'bg-red-500/10 border-red-500/30' : idx === 1 ? 'bg-orange-500/10 border-orange-500/30' : 'bg-[#252525] border-white/5 hover:border-brand-blue/20'}`}>
                    <div className="flex items-center space-x-5">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${idx === 0 ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' : idx === 1 ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' : 'bg-[#2c2c2c] text-gray-400'}`}>
                        {idx + 1}
                      </div>
                      <div>
                        <p className="text-white font-semibold text-lg">{o.name}</p>
                        <p className="text-xs text-gray-400 mt-1 flex items-center space-x-2">
                           <span>Due: <span className="text-gray-300 font-medium">{new Date(o.due_date).toLocaleDateString()}</span></span>
                           <span className="text-gray-600">•</span>
                           <span>Penalty: <span className="text-gray-300">{o.penalty || 0}</span></span>
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-6 md:space-x-12">
                       <div className="text-right hidden sm:block">
                         <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">Priority Score</p>
                         <p className={`font-bold text-xl ${idx === 0 ? 'text-red-400' : idx === 1 ? 'text-orange-400' : 'text-brand-blue'}`}>
                           {o.priority_score.toFixed(2)}
                         </p>
                       </div>
                       <div className="text-right w-24">
                         <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">Amount</p>
                         <p className="text-white font-bold text-lg">₹{(parseFloat(o.amount)||0).toLocaleString()}</p>
                       </div>
                    </div>
                 </div>
               ))}
             </div>
          </div>
        </div>
      )}

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
