import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';

export default function AddPaymentForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    dueDate: '',
    paymentType: '',
    delayed: 'No',
    impact: 'Low',
    isMsme: false,
    recurring: false
  });
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Auto-fill logic based on Payment Type
  useEffect(() => {
    if (formData.paymentType === 'Rent' || formData.paymentType === 'Salary') {
      setFormData(prev => ({
        ...prev,
        delayed: 'No',
        impact: 'High',
        recurring: true // bonus recurring suggestion
      }));
    } else if (formData.paymentType === 'Vendor') {
      setFormData(prev => ({
        ...prev,
        impact: 'Medium'
      }));
    }
  }, [formData.paymentType]);

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value
    }));
  };

  const paymentTypes = [
    { value: 'Rent', label: 'Rent' },
    { value: 'Salary', label: 'Salary' },
    { value: 'Vendor', label: 'Vendor' },
    { value: 'Loan', label: 'Loan' },
    { value: 'Subscription', label: 'Subscription' },
    { value: 'Other', label: 'Other' },
  ];

  const mapToDatabase = (userId) => {
    let relationship_importance = 'low';
    if (['Rent', 'Salary', 'Loan'].includes(formData.paymentType)) {
      relationship_importance = 'high';
    } else if (formData.paymentType === 'Vendor') {
      relationship_importance = 'medium';
    }

    const flexibility_score = formData.delayed === 'Yes' ? 0.7 : 0.2;

    let penalty = 100;
    if (formData.impact === 'High') penalty = 1000;
    else if (formData.impact === 'Medium') penalty = 500;

    return {
      user_id: userId,
      name: formData.name,
      amount: parseFloat(formData.amount),
      due_date: formData.dueDate,
      relationship_importance,
      flexibility_score,
      penalty,
      is_msme: formData.isMsme,
      status: 'pending',
      created_at: new Date().toISOString()
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be logged in to add a payment.");

      const dbPayload = mapToDatabase(user.id);

      const { error } = await supabase
        .from('obligations')
        .insert([dbPayload]);

      if (error) throw error;

      setMessage('success');
      setFormData({
        name: '', amount: '', dueDate: '', paymentType: '',
        delayed: 'No', impact: 'Low', isMsme: false, recurring: false
      });
      setShowAdvanced(false);
      
      if (onSuccess) onSuccess();

    } catch (err) {
      setMessage(`error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#1e1e1e] border border-white/5 rounded-2xl p-6 lg:p-8 shadow-2xl relative overflow-hidden">
      <h3 className="text-2xl font-bold text-white mb-6">Add Upcoming Payment</h3>
      
      {message === 'success' && (
        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/50 text-green-400 text-sm rounded-lg font-medium">
          ✅ Payment added successfully!
        </div>
      )}
      
      {message.startsWith('error') && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 text-red-400 text-sm rounded-lg font-medium">
          {message.replace('error: ', '❌ ')}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input 
            label="Payment Name" id="name"
            placeholder="e.g., Rent, Salary, Supplier"
            value={formData.name} onChange={handleChange} required
          />
          <Input 
            label="Amount (₹)" id="amount" type="number"
            placeholder="Enter amount in ₹"
            value={formData.amount} onChange={handleChange} required min="1"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select 
            label="Payment Type" id="paymentType"
            options={paymentTypes}
            value={formData.paymentType} onChange={handleChange} required
          />
          <Input 
            label="Due Date" id="dueDate" type="date"
            placeholder=""
            value={formData.dueDate} onChange={handleChange} required
          />
        </div>

        {/* Suggestion for Rent/Salary */}
        {(formData.paymentType === 'Rent' || formData.paymentType === 'Salary') && (
          <div className="flex items-center space-x-3 p-3 bg-brand-blue/10 rounded-lg border border-brand-blue/20 mt-2">
            <input 
              type="checkbox" id="recurring" 
              checked={formData.recurring} onChange={handleChange}
              className="w-4 h-4 text-brand-blue bg-transparent border-gray-600 rounded focus:ring-brand-blue"
            />
            <label htmlFor="recurring" className="text-sm text-brand-blue font-medium cursor-pointer">
              Set as a recurring monthly payment
            </label>
          </div>
        )}

        <button 
          type="button" 
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm font-medium text-gray-400 hover:text-white transition-colors flex items-center space-x-1 mt-4 mb-2"
        >
          <span>{showAdvanced ? '− Hide' : '+ Show'} Optional Details</span>
        </button>

        {showAdvanced && (
          <div className="space-y-5 p-5 bg-[#252525] rounded-xl border border-white/5 animate-fade-in">
            <div className="flex flex-col space-y-2">
              <span className="text-sm text-gray-400">Can this payment be delayed?</span>
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="radio" name="delayed" id="delayed" value="Yes" 
                    checked={formData.delayed === 'Yes'} onChange={handleChange} 
                    className="text-brand-blue focus:ring-brand-blue bg-[#2c2c2c] border-gray-600" />
                  <span className="text-sm text-white">Yes</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="radio" name="delayed" id="delayed" value="No" 
                    checked={formData.delayed === 'No'} onChange={handleChange} 
                    className="text-brand-blue focus:ring-brand-blue bg-[#2c2c2c] border-gray-600" />
                  <span className="text-sm text-white">No</span>
                </label>
              </div>
            </div>

            {formData.delayed === 'Yes' && (
              <Select 
                label="If delayed, what is the impact?" id="impact"
                options={[
                  { value: 'High', label: 'High' },
                  { value: 'Medium', label: 'Medium' },
                  { value: 'Low', label: 'Low' },
                ]}
                value={formData.impact} onChange={handleChange}
              />
            )}

            <div className="flex items-center space-x-3 pt-2">
              <input 
                type="checkbox" id="isMsme" 
                checked={formData.isMsme} onChange={handleChange}
                className="w-4 h-4 text-brand-blue bg-[#2c2c2c] border-gray-600 rounded focus:ring-brand-blue"
              />
              <label htmlFor="isMsme" className="text-sm text-gray-300 font-medium cursor-pointer">
                Is this an MSME supplier? (Priority compliance)
              </label>
            </div>
          </div>
        )}

        <div className="pt-4">
          <Button type="submit" disabled={loading} className="py-4 text-base">
            {loading ? 'Processing...' : 'Add Payment'}
          </Button>
        </div>
      </form>
    </div>
  );
}
