'use client';

import { useState } from 'react';
import { Upload, X, FileText, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface ResumeUploadProps {
    onFileSelect: (file: File | null) => void;
    initialUrl?: string;
}

export default function ResumeUpload({ onFileSelect, initialUrl }: ResumeUploadProps) {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState(initialUrl || '');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        // Frontend validation
        const allowedExtensions = ['.pdf', '.doc', '.docx'];
        const fileExtension = selectedFile.name.slice(selectedFile.name.lastIndexOf('.')).toLowerCase();
        if (!allowedExtensions.includes(fileExtension)) {
            toast.error('Invalid file type. Only PDF, DOC, and DOCX are allowed.');
            return;
        }

        if (selectedFile.size > 5 * 1024 * 1024) {
            toast.error('File too large. Maximum 5MB allowed.');
            return;
        }

        setFile(selectedFile);
        setPreview(selectedFile.name);
        onFileSelect(selectedFile);
        toast.success('Resume selected!');
    };

    const removeFile = () => {
        setFile(null);
        setPreview('');
        onFileSelect(null);
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700">Upload Resume (PDF, DOCX)</label>
                {preview && (
                    <button
                        onClick={removeFile}
                        type="button"
                        className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1"
                    >
                        <X size={12} /> Remove
                    </button>
                )}
            </div>

            {!preview ? (
                <div className="relative group">
                    <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 bg-white border-slate-200 group-hover:border-ink-400 group-hover:bg-ink-50">
                        <div className="flex flex-col items-center">
                            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-ink-100 group-hover:text-ink-600 transition-colors">
                                <Upload size={20} className="text-slate-500 group-hover:text-ink-600" />
                            </div>
                            <p className="text-sm font-medium text-slate-700">Click or drag to upload</p>
                            <p className="text-xs text-slate-400 mt-1">Maximum file size 5MB</p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-xl animate-fade-in text-emerald-900 shadow-sm transition-all duration-200 hover:shadow-md">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600">
                        <FileText size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{preview}</p>
                        <p className="text-xs text-emerald-600 flex items-center gap-1">
                            <CheckCircle size={10} /> Ready to submit
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
