import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import {
  FileText,
  Upload,
  Trash2,
  Download,
  Eye,
  CheckCircle,
  AlertCircle,
  X,
} from 'lucide-react';
import type { DragEvent, ChangeEvent } from 'react';

interface CandidateCV {
  id: string;
  cv_url: string;
  cv_filename: string;
  name: string;
  updated_at: string;
}

export default function MyCVPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [cvData, setCvData] = useState<CandidateCV | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // ===== Fetch existing CV =====
  useEffect(() => {
    async function fetchCV() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/signin'); return; }

      const { data } = await supabase
        .from('candidates')
        .select('id, cv_url, cv_filename, name, updated_at')
        .eq('id', user.id)
        .single();

      if (data) setCvData(data);
      setLoading(false);
    }
    fetchCV();
  }, [navigate]);

  // ===== Toast auto-dismiss =====
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  // ===== Drag handlers =====
  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) validateAndSet(file);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndSet(file);
  };

  const validateAndSet = (file: File) => {
    const allowed = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (!allowed.includes(file.type)) {
      setToast({ type: 'error', message: 'Only PDF or DOCX files are accepted.' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setToast({ type: 'error', message: 'File size must be under 5MB.' });
      return;
    }
    setSelectedFile(file);
  };

  // ===== Upload CV =====
  const handleUpload = async () => {
    if (!selectedFile || !cvData) return;
    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('cv-uploads')
        .upload(fileName, selectedFile, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public or signed URL
      const { data: urlData } = await supabase.storage
        .from('cv-uploads')
        .getPublicUrl(fileName);

      const cvUrl = urlData.publicUrl;

      const { error: dbError } = await supabase
        .from('candidates')
        .update({ cv_url: cvUrl, cv_filename: selectedFile.name })
        .eq('id', user.id);

      if (dbError) throw dbError;

      setCvData((prev) =>
        prev ? { ...prev, cv_url: cvUrl, cv_filename: selectedFile.name } : prev
      );
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setToast({ type: 'success', message: 'CV uploaded successfully!' });
    } catch (err: any) {
      setToast({ type: 'error', message: err.message || 'Upload failed.' });
    } finally {
      setUploading(false);
    }
  };

  // ===== Delete CV =====
  const handleDelete = async () => {
    if (!cvData?.cv_url) return;
    if (!window.confirm('Are you sure you want to remove your CV?')) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('candidates')
        .update({ cv_url: null, cv_filename: null })
        .eq('id', user.id);

      setCvData((prev) =>
        prev ? { ...prev, cv_url: '', cv_filename: '' } : prev
      );
      setToast({ type: 'success', message: 'CV removed.' });
    } catch (err: any) {
      setToast({ type: 'error', message: err.message });
    }
  };

  // ===== Helpers =====
  const formatDate = (iso: string) =>
    iso
      ? new Date(iso).toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      : '—';

  const fileExt = (name: string) => name?.split('.').pop()?.toUpperCase() || 'FILE';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const hasCV = !!(cvData?.cv_url);

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 font-sans">

      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-lg text-sm font-medium transition-all ${
            toast.type === 'success'
              ? 'bg-green-600 text-white'
              : 'bg-red-600 text-white'
          }`}
        >
          {toast.type === 'success'
            ? <CheckCircle className="w-4 h-4 flex-shrink-0" />
            : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
          {toast.message}
          <button onClick={() => setToast(null)}>
            <X className="w-4 h-4 ml-1 opacity-70 hover:opacity-100" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="mb-7">
        <h1 className="text-xl font-semibold text-slate-800">My CV</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage the CV attached to your candidate profile
        </p>
      </div>

      {/* Current CV card */}
      {hasCV ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
            Current CV
          </p>

          <div className="flex items-center gap-4">
            {/* File icon */}
            <div className="w-14 h-14 rounded-xl bg-blue-50 border border-blue-100 flex flex-col items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6 text-blue-600" />
              <span className="text-[9px] font-bold text-blue-500 mt-0.5">
                {fileExt(cvData?.cv_filename || '')}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">
                {cvData?.cv_filename || 'My CV'}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Last updated: {formatDate(cvData?.updated_at || '')}
              </p>
              <p className="text-xs text-slate-400">
                Attached to: <span className="font-medium text-slate-600">{cvData?.name}</span>
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <a
                href={cvData?.cv_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
              >
                <Eye className="w-3.5 h-3.5" /> View
              </a>
              <a
                href={cvData?.cv_url}
                download
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
              >
                <Download className="w-3.5 h-3.5" /> Download
              </a>
              <button
                onClick={handleDelete}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition"
              >
                <Trash2 className="w-3.5 h-3.5" /> Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-800">No CV uploaded yet</p>
            <p className="text-xs text-amber-600 mt-0.5">
              Upload your CV below to increase your visibility to recruiters.
            </p>
          </div>
        </div>
      )}

      {/* Upload section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
          {hasCV ? 'Replace CV' : 'Upload CV'}
        </p>

        {/* Drag & drop zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            dragActive
              ? 'border-blue-500 bg-blue-50'
              : selectedFile
              ? 'border-green-400 bg-green-50'
              : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx"
            onChange={handleFileChange}
            className="hidden"
          />

          {selectedFile ? (
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-slate-800">{selectedFile.name}</p>
                <p className="text-xs text-slate-400">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB — ready to upload
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="ml-2 p-1 hover:bg-red-50 rounded-lg"
              >
                <X className="w-4 h-4 text-red-400" />
              </button>
            </div>
          ) : (
            <>
              <Upload className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-600">
                Drag & drop your CV here
              </p>
              <p className="text-xs text-slate-400 mt-1">or click to browse</p>
              <p className="text-xs text-slate-300 mt-3">PDF or DOCX · Max 5MB</p>
            </>
          )}
        </div>

        {/* Upload button */}
        {selectedFile && (
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="mt-4 w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition"
          >
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                {hasCV ? 'Replace CV' : 'Upload CV'}
              </>
            )}
          </button>
        )}
      </div>

      {/* Tips */}
      <div className="mt-5 p-4 bg-slate-50 rounded-xl border border-slate-100">
        <p className="text-xs font-semibold text-slate-600 mb-2">Tips for a strong CV</p>
        <ul className="text-xs text-slate-500 space-y-1 list-disc list-inside">
          <li>Keep it to 1–2 pages maximum</li>
          <li>Include your latest skills and technologies</li>
          <li>Upload as PDF for best compatibility</li>
          <li>Ensure your contact details are up to date</li>
        </ul>
      </div>
    </div>
  );
}
