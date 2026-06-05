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

interface CandidateProfile {
  id: string;
  name: string;
  cv_url: string;
  cv_filename: string;
}

export default function MyCVPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [cvData, setCvData] = useState<CandidateProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showCV, setShowCV] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    async function fetchCV() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/signin'); return; }

      // 400 Bad Request වැළැක්වීමට select පේළිය සරල කර ඇත
      const { data, error } = await supabase
        .from('candidates')
        .select('id, cv_url, cv_filename, name')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error("Supabase Error:", error);
      } else {
        setCvData(data);
      }
      setLoading(false);
    }
    fetchCV();
  }, [navigate]);

  const handleUpload = async () => {
    if (!selectedFile) return;
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

      const { data: urlData } = supabase.storage.from('cv-uploads').getPublicUrl(fileName);
      const cvUrl = urlData.publicUrl;

      await supabase.from('candidates').update({ cv_url: cvUrl, cv_filename: selectedFile.name }).eq('id', user.id);

      setCvData((prev) => prev ? { ...prev, cv_url: cvUrl, cv_filename: selectedFile.name } : null);
      setSelectedFile(null);
      setToast({ type: 'success', message: 'CV uploaded successfully!' });
    } catch (err: any) {
      setToast({ type: 'error', message: err.message || 'Upload failed.' });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!cvData?.cv_url || !window.confirm('Are you sure you want to remove your CV?')) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from('candidates').update({ cv_url: null, cv_filename: null }).eq('id', user.id);
      setCvData((prev) => prev ? { ...prev, cv_url: '', cv_filename: '' } : prev);
      setShowCV(false);
      setToast({ type: 'success', message: 'CV removed.' });
    } catch (err: any) {
      setToast({ type: 'error', message: err.message });
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;

  const hasCV = !!(cvData?.cv_url);

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 font-sans">
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-lg text-sm font-medium ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'} text-white`}>
          {toast.message}
          <button onClick={() => setToast(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      <h1 className="text-xl font-semibold text-slate-800 mb-7">My CV</h1>

      {hasCV ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Current CV</p>
            <button
              onClick={() => setShowCV(!showCV)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
            >
              <Eye className="w-4 h-4" /> {showCV ? 'Hide CV' : 'View CV'}
            </button>
          </div>

          {showCV && (
            <div className="mt-4">
              <div className="w-full h-[500px] border border-slate-200 rounded-xl overflow-hidden bg-slate-50 mb-4">
                <iframe src={cvData?.cv_url || ""} className="w-full h-full" title="CV Preview" />
              </div>
              <div className="flex gap-2">
                <a href={cvData?.cv_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-blue-700 bg-blue-50 rounded-lg">
                  <Download className="w-3.5 h-3.5" /> Open in New Tab
                </a>
                <button onClick={handleDelete} className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-red-600 bg-red-50 rounded-lg">
                  <Trash2 className="w-3.5 h-3.5" /> Remove
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600" />
          <p className="text-sm font-semibold text-amber-800">No CV uploaded yet</p>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">{hasCV ? 'Replace CV' : 'Upload CV'}</p>
        <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center cursor-pointer">
          <input ref={fileInputRef} type="file" accept=".pdf,.docx" onChange={(e) => e.target.files?.[0] && setSelectedFile(e.target.files[0])} className="hidden" />
          {selectedFile ? <p className="text-sm font-semibold text-slate-800">{selectedFile.name}</p> : <><Upload className="w-10 h-10 text-slate-300 mx-auto mb-3" /><p className="text-sm">Click to browse</p></>}
        </div>
        {selectedFile && <button onClick={handleUpload} disabled={uploading} className="mt-4 w-full py-3 bg-blue-600 text-white text-sm font-semibold rounded-xl">{uploading ? 'Uploading...' : 'Upload CV'}</button>}
      </div>
    </div>
  );
}