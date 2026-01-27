import { useState, useRef } from 'react';
import { CloudArrowUpIcon, XMarkIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { uploadUserFile } from '../services/userImportService';
import type { ImportResult } from '../types/ImportResult';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
}

export default function UploadModal({ isOpen, onClose, onUploadSuccess }: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setIsLoading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleSuccessClose = () => {
    resetState();
    onUploadSuccess();
    onClose();
  };

  const validateFile = (file: File): boolean => {
    if (!file.name.endsWith('.xlsx')) {
      setError('Chỉ chấp nhận file định dạng .xlsx');
      return false;
    }
    return true;
  };

  const handleFileSelect = (selectedFile: File) => {
    setError(null);
    setResult(null);
    if (validateFile(selectedFile)) {
      setFile(selectedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const importResult = await uploadUserFile(file);
      setResult(importResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleClose} />

        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 z-10">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Upload file người dùng</h3>
            <button
              onClick={handleClose}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-4">
            {!result ? (
              <>
                {/* Drop Zone */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`
                    border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
                    ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
                    ${file ? 'bg-green-50 border-green-300' : ''}
                  `}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx"
                    onChange={handleInputChange}
                    className="hidden"
                  />

                  {!file ? (
                    <div className="space-y-2">
                      <CloudArrowUpIcon className="w-10 h-10 mx-auto text-gray-400" />
                      <p className="text-gray-600">Kéo thả file vào đây hoặc <span className="text-blue-600">chọn file</span></p>
                      <p className="text-xs text-gray-400">Chỉ chấp nhận file .xlsx</p>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircleIcon className="w-6 h-6 text-green-600" />
                      <span className="font-medium text-gray-800">{file.name}</span>
                      <span className="text-sm text-gray-500">({(file.size / 1024).toFixed(2)} KB)</span>
                    </div>
                  )}
                </div>

                {/* Error */}
                {error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                    <ExclamationCircleIcon className="w-5 h-5" />
                    <span>{error}</span>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Result Stats */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="p-4 bg-gray-50 border rounded-lg text-center">
                    <p className="text-2xl font-bold text-gray-800">{result.totalRows}</p>
                    <p className="text-sm text-gray-500">Tổng số dòng</p>
                  </div>
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                    <p className="text-2xl font-bold text-green-600">{result.successCount}</p>
                    <p className="text-sm text-green-600">Thành công</p>
                  </div>
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-center">
                    <p className="text-2xl font-bold text-red-600">{result.errorCount}</p>
                    <p className="text-sm text-red-600">Lỗi</p>
                  </div>
                </div>

                {/* Success Message */}
                {result.errorCount === 0 && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
                    <CheckCircleIcon className="w-5 h-5" />
                    <span>Import thành công! Tất cả {result.successCount} người dùng đã được tạo.</span>
                  </div>
                )}

                {/* Error Details */}
                {result.errorDetails && result.errorDetails.length > 0 && (
                  <div className="border border-red-200 rounded-lg overflow-hidden">
                    <div className="px-4 py-2 bg-red-50 border-b border-red-200">
                      <h4 className="font-medium text-red-800">Chi tiết lỗi ({result.errorDetails.length})</h4>
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      <ul className="divide-y divide-red-100">
                        {result.errorDetails.map((detail, index) => (
                          <li key={index} className="px-4 py-2 text-sm text-red-700">{detail}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
            {!result ? (
              <>
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleUpload}
                  disabled={!file || isLoading}
                  className={`
                    px-4 py-2 text-sm font-medium text-white rounded-md
                    ${!file || isLoading ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}
                  `}
                >
                  {isLoading ? 'Đang tải...' : 'Tải lên'}
                </button>
              </>
            ) : (
              <button
                onClick={handleSuccessClose}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Đóng
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
