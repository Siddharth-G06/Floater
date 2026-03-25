import React, { useState, useRef } from 'react';
import { UploadCloud, File, X, CheckCircle, AlertCircle } from 'lucide-react';
import Button from '../ui/Button';
import { supabase } from '../../lib/supabase';

export default function DocumentUpload({ onSuccess }) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle, uploading, success, error
  const [ocrResult, setOcrResult] = useState(null);
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (selectedFile) => {
    if (selectedFile.type.startsWith('image/')) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setUploadStatus('idle');
      setOcrResult(null);
    } else {
      alert("Please upload an image file (receipt, payslip).");
    }
  };

  const removeFile = () => {
    setFile(null);
    setPreview(null);
    setUploadStatus('idle');
    setOcrResult(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setUploadStatus('uploading');
    
    const formData = new FormData();
    formData.append('receipt', file); // Field name must match backend Multer setting

    try {
      const response = await fetch('http://localhost:5000/api/ocr', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) throw new Error('OCR Processing failed');
      const data = await response.json();

      setOcrResult({
        vendor: data.vendor_name || "Unknown Vendor",
        amount: data.amount || 0,
        date: data.date || new Date().toISOString().split('T')[0]
      });
      setUploadStatus('success');
    } catch (error) {
      console.error(error);
      setUploadStatus('error');
    }
  };

  const handleSaveToDatabase = async () => {
    if (!ocrResult) return;
    setUploadStatus('saving');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Authentication required");

      // 1. Ensure user exists in 'public.users' table first (to satisfy Foreign Key constraint)
      // This is the "safe check" without changing database structure
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single();

      if (!existingUser) {
        const { error: userError } = await supabase
          .from('users')
          .insert([{
            id: user.id,
            email: user.email,
            name: user.user_metadata?.business_name || user.email.split('@')[0], // Fallback name
            business_name: user.user_metadata?.business_name || 'My Business'
          }]);
        
        if (userError) throw new Error("Could not sync user to public table: " + userError.message);
      }

      // 2. Insert into transactions
      const { error } = await supabase
        .from('transactions')
        .insert([{
          user_id: user.id,
          amount: parseFloat(ocrResult.amount),
          type: 'expense', // Receipts are typically expenses
          category: 'Uncategorized',
          description: `${ocrResult.vendor} (Extracted via OCR)`,
          date: ocrResult.date,
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;

      setMessage('Transaction saved successfully!');
      setTimeout(() => {
        removeFile();
        setMessage('');
        if (onSuccess) onSuccess();
      }, 2000);
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save transaction: ' + error.message);
      setUploadStatus('success'); // Revert to success so they can try again
    }
  };

  const [message, setMessage] = useState('');

  return (
    <div className="bg-[#1e1e1e] border border-white/5 rounded-2xl p-6 lg:p-8 shadow-2xl">
      <h3 className="text-2xl font-bold text-white mb-2">Upload Transaction Document</h3>
      <p className="text-sm text-gray-400 mb-6">Upload receipts or payslips to auto-extract history.</p>
      
      {!file ? (
        <div 
          className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-colors duration-200 ${
            dragActive ? 'border-brand-blue bg-brand-blue/5' : 'border-gray-600 hover:border-gray-500 bg-[#252525]'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="w-16 h-16 bg-[#2c2c2c] rounded-full flex items-center justify-center mb-4">
            <UploadCloud className="w-8 h-8 text-brand-blue" />
          </div>
          <p className="text-white font-medium mb-1">Click to upload or drag and drop</p>
          <p className="text-xs text-gray-400 text-center">SVG, PNG, JPG, or GIF (max. 5MB)</p>
        </div>
      ) : (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-start bg-[#252525] p-4 rounded-xl border border-white/5">
            {preview ? (
              <img src={preview} alt="Preview" className="w-20 h-20 object-cover rounded-lg border border-gray-700" />
            ) : (
              <div className="w-20 h-20 bg-[#2c2c2c] rounded-lg flex items-center justify-center">
                <File className="w-8 h-8 text-gray-500" />
              </div>
            )}
            
            <div className="ml-4 flex-1">
              <p className="text-white font-medium text-sm truncate max-w-xs">{file.name}</p>
              <p className="text-xs text-gray-400 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              
              {uploadStatus === 'idle' && (
                <div className="mt-3 flex space-x-3">
                  <button onClick={removeFile} className="text-xs text-red-400 hover:text-red-300 transition-colors">
                    Remove
                  </button>
                </div>
              )}
            </div>
            
            {uploadStatus === 'success' && (
              <CheckCircle className="w-6 h-6 text-green-400" />
            )}
            {uploadStatus === 'error' && (
              <AlertCircle className="w-6 h-6 text-red-400" />
            )}
          </div>

          {uploadStatus === 'idle' && (
             <Button onClick={handleUpload}>
               Process Document via OCR
             </Button>
          )}

          {uploadStatus === 'uploading' && (
            <div className="flex items-center justify-center space-x-3 text-brand-blue p-4">
              <div className="w-5 h-5 border-2 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
              <span className="font-medium animate-pulse">Running OCR Analysis...</span>
            </div>
          )}

          {uploadStatus === 'saving' && (
            <div className="flex items-center justify-center space-x-3 text-green-400 p-4">
              <div className="w-5 h-5 border-2 border-green-400 border-t-transparent rounded-full animate-spin"></div>
              <span className="font-medium animate-pulse">Saving to Database...</span>
            </div>
          )}

          {message && (
             <div className="bg-green-500/10 border border-green-500/50 text-green-400 p-3 rounded-lg text-center text-sm font-medium">
               {message}
             </div>
          )}

          {uploadStatus === 'success' && ocrResult && !message && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-5 animate-fade-in">
              <h4 className="text-green-400 font-semibold mb-3 flex items-center space-x-2">
                <CheckCircle className="w-5 h-5" />
                <span>Extraction Successful!</span>
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm mb-5">
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Detected Vendor</p>
                  <p className="text-white font-medium">{ocrResult.vendor}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Detected Amount</p>
                  <p className="text-white font-bold text-lg">₹{ocrResult.amount.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="flex flex-col space-y-2">
                <Button onClick={handleSaveToDatabase} className="bg-green-600 hover:bg-green-700">
                  Accept & Save Transaction
                </Button>
                <button 
                  onClick={removeFile} 
                  className="text-gray-400 hover:text-white text-sm py-2 transition-colors"
                >
                  Discard
                </button>
              </div>
            </div>
          )}

          {uploadStatus === 'error' && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
              <p className="text-red-400 text-sm font-medium">Failed to process document. Please ensure your backend is running.</p>
              <Button onClick={removeFile} variant="secondary" className="mt-4 text-sm py-2">
                Try Again
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
