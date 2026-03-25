import React, { useState, useRef } from 'react';
import { UploadCloud, File, X, CheckCircle, AlertCircle } from 'lucide-react';
import Button from '../ui/Button';

export default function DocumentUpload() {
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
    formData.append('file', file);

    try {
      // TODO: Replace this URL with your actual backend OCR endpoint URL
      /*
      const response = await fetch('http://localhost:8000/api/ocr/process', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) throw new Error('OCR Processing failed');
      const data = await response.json();
      */

      // Simulating backend OCR processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockData = {
        vendor: "Extracted Vendor Name",
        amount: "₹4,500",
        date: "2024-03-15"
      };

      setOcrResult(mockData);
      setUploadStatus('success');
    } catch (error) {
      console.error(error);
      setUploadStatus('error');
    }
  };

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

          {uploadStatus === 'success' && ocrResult && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-5 animate-fade-in">
              <h4 className="text-green-400 font-semibold mb-3 flex items-center space-x-2">
                <CheckCircle className="w-5 h-5" />
                <span>Extraction Successful!</span>
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Detected Vendor</p>
                  <p className="text-white font-medium">{ocrResult.vendor}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Detected Amount</p>
                  <p className="text-white font-medium">{ocrResult.amount}</p>
                </div>
              </div>
              <Button onClick={removeFile} variant="secondary" className="mt-5 text-sm py-2">
                Upload Another Document
              </Button>
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
