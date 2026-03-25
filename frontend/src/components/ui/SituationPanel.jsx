import React from 'react';
import { Sparkles, ArrowRight, AlertTriangle, TrendingDown } from 'lucide-react';

const SUGGESTED_SCENARIOS = [
  { 
    id: 'client-late', 
    label: 'Major Client Late (15 days)', 
    icon: <AlertTriangle className="w-4 h-4 text-orange-400" />,
    effect: { type: 'balance_reduction', value: 15000, description: 'Simulated 15k delay in receivables' }
  },
  { 
    id: 'sales-drop', 
    label: '15% Monthly Sales Drop', 
    icon: <TrendingDown className="w-4 h-4 text-red-400" />,
    effect: { type: 'balance_percent_reduction', value: 0.15, description: '15% revenue shrinkage model' }
  },
  { 
    id: 'repair-cost', 
    label: 'Unexpected ₹5,000 Repair', 
    icon: <Sparkles className="w-4 h-4 text-blue-400" />,
    effect: { type: 'balance_reduction', value: 5000, description: 'Emergency equipment maintenance' }
  }
];

export default function SituationPanel({ onApplyScenario, activeScenarioId, isSimulating }) {
  return (
    <div className="bg-[#1e1e1e]/50 border border-white/5 rounded-3xl p-8 lg:p-10 shadow-xl backdrop-blur-sm">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-brand-blue/10 rounded-lg text-brand-blue">
            <Sparkles className="w-5 h-5" />
        </div>
        <h3 className="text-xl font-bold text-white">Situation Simulator</h3>
      </div>

      <p className="text-sm text-gray-400 mb-8 leading-relaxed">
        Don't wait for a crisis. Model hypothetical threats to your cash flow and see how your payment priorities should shift to survive.
      </p>

      <div className="space-y-4 mb-8">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Suggested Scenarios</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SUGGESTED_SCENARIOS.map((scenario) => (
            <button
              key={scenario.id}
              onClick={() => onApplyScenario(scenario)}
              disabled={isSimulating}
              className={`flex items-center justify-between p-4 rounded-2xl border transition-all text-left ${
                activeScenarioId === scenario.id 
                ? 'bg-brand-blue/10 border-brand-blue shadow-lg shadow-brand-blue/10' 
                : 'bg-[#252525] border-white/5 hover:border-brand-blue/30'
              }`}
            >
              <div className="flex items-center space-x-3">
                {scenario.icon}
                <span className={`text-sm font-medium ${activeScenarioId === scenario.id ? 'text-brand-blue' : 'text-gray-300'}`}>
                  {scenario.label}
                </span>
              </div>
              <ArrowRight className={`w-4 h-4 ${activeScenarioId === scenario.id ? 'text-brand-blue' : 'text-gray-600'}`} />
            </button>
          ))}
        </div>
      </div>

      <div className="relative group">
         <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 mb-2">Custom Situation</p>
         <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            <div className="relative flex-1">
                <input 
                    type="text" 
                    placeholder="e.g. What if I lose my top customer?" 
                    className="w-full bg-[#252525] border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-blue/50 transition-colors"
                    disabled={isSimulating}
                />
            </div>
            <button 
                className="bg-brand-blue hover:bg-[#0051cc] text-white px-6 py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                disabled={isSimulating}
            >
                Simulate
            </button>
         </div>
         <p className="text-[10px] text-gray-500 mt-3 italic ml-1 font-medium">✨ Pro tip: Try modeling a specific cash shortfall</p>
      </div>
    </div>
  );
}
