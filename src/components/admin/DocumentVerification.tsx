// import { useState, useEffect } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { Input } from '@/components/ui/input';
// import { Textarea } from '@/components/ui/textarea';
// import { supabase } from '@/integrations/supabase/client';
// import { useToast } from '@/hooks/use-toast';
// import {
//   Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
// } from '@/components/ui/table';
// import {
//   Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
// } from '@/components/ui/dialog';
// import {
//   Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
// } from '@/components/ui/select';
// import { CheckCircle, XCircle, Eye, Clock, FileText, Search } from 'lucide-react';
// interface Document {
//   id: string;
//   lawyer_user_id: string;
//   document_name: string;
//   document_type: string;
//   storage_path: string;
//   file_size_bytes: number | null;
//   status: string;
//   admin_notes: string | null;
//   uploaded_at: string;
//   reviewed_at: string | null;
//   lawyer_name?: string;
//   lawyer_email?: string;
// }
// const DOCUMENT_TYPE_LABELS: Record<string, string> = {
//   bar_certificate: 'Bar Certificate',
//   degree: 'Law Degree / Degree Certificate',
//   id_proof: 'ID Proof (Passport)',
//   adhar_card: 'Aadhar Card',
//   pan_card: 'PAN Card',
//   college_passout_certificate: 'College Passout Certificate',
//   experience_certificate: 'Experience Certificate',
//   other: 'Other',
// };
// export const DocumentVerification = () => {
//   const [documents, setDocuments] = useState<Document[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [filter, setFilter] = useState('pending');
//   const [searchTerm, setSearchTerm] = useState('');
//   const [viewDoc, setViewDoc] = useState<Document | null>(null);
//   const [viewUrl, setViewUrl] = useState<string | null>(null);
//   const [adminNotes, setAdminNotes] = useState('');
//   const { toast } = useToast();
//   useEffect(() => {
//     fetchDocuments();
//   }, []);
//   const fetchDocuments = async () => {
//     const { data, error } = await supabase
//       .from('lawyer_documents')
//       .select('*')
//       .order('uploaded_at', { ascending: false });
//     if (!error && data) {
//       // Enrich with lawyer names
//       const userIds = [...new Set(data.map((d: any) => d.lawyer_user_id))];
//       const { data: profiles } = await supabase
//         .from('profiles')
//         .select('id, full_name, email')
//         .in('id', userIds);
//       const enriched = data.map((doc: any) => {
//         const profile = profiles?.find(p => p.id === doc.lawyer_user_id);
//         return { ...doc, lawyer_name: profile?.full_name || 'Unknown', lawyer_email: profile?.email || '' };
//       });
//       setDocuments(enriched);
//     }
//     setLoading(false);
//   };
//   const handleView = async (doc: Document) => {
//     setViewDoc(doc);
//     setAdminNotes(doc.admin_notes || '');
//     // Get signed URL for private bucket
//     const { data, error } = await supabase.storage
//       .from('lawyer-documents')
//       .createSignedUrl(doc.storage_path, 300); // 5 min
//     if (!error && data) {
//       setViewUrl(data.signedUrl);
//     } else {
//       setViewUrl(null);
//     }
//   };
//   const updateStatus = async (docId: string, status: 'verified' | 'rejected') => {
//     const { data: { user } } = await supabase.auth.getUser();

//     const { error } = await supabase
//       .from('lawyer_documents')
//       .update({
//         status,
//         admin_notes: adminNotes.trim() || null,
//         reviewed_at: new Date().toISOString(),
//         reviewed_by: user?.id,
//       })
//       .eq('id', docId);
//     if (!error) {
//       toast({ title: `Document ${status}` });
//       setViewDoc(null);
//       fetchDocuments();
//     } else {
//       toast({ variant: 'destructive', title: 'Failed to update', description: error.message });
//     }
//   };
//   const getStatusBadge = (status: string) => {
//     switch (status) {
//       case 'verified':
//         return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Verified</Badge>;
//       case 'rejected':
//         return <Badge className="bg-red-500/10 text-red-600 border-red-500/20">Rejected</Badge>;
//       default:
//         return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">Pending</Badge>;
//     }
//   };
//   const filtered = documents.filter(d => {
//     const matchesFilter = filter === 'all' || d.status === filter;
//     const matchesSearch = d.lawyer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       d.document_name.toLowerCase().includes(searchTerm.toLowerCase());
//     return matchesFilter && matchesSearch;
//   });
//   return (

//     <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
//       <div className="px-5 sm:px-7 py-6 bg-slate-900 text-white">

//         {/* TITLE ROW */}
//         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

//           <div className="flex items-start gap-3">
//             <div className="h-10 w-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
//               <FileText className="h-5 w-5 text-white" />
//             </div>

//             <div>
//               <h2 className="text-lg font-bold text-white">Document Verification</h2>
//               <p className="text-sm text-slate-400">Verify lawyer documents</p>
//             </div>
//           </div>

//         </div>

//         {/* SEARCH + FILTER ROW */}
//         <div className="grid grid-cols-1 sm:grid-cols-[1fr_160px] gap-2 mt-5">

//           <div className="relative">
//             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
//             <input
//               placeholder="Search..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="w-full h-10 rounded-xl bg-white border border-slate-200 pl-9 pr-3 text-sm text-slate-900"
//             />
//           </div>

//           <Select value={filter} onValueChange={setFilter}>
//             <SelectTrigger className="h-10 rounded-xl bg-white border border-slate-200 text-sm">
//               <SelectValue />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="all">All</SelectItem>
//               <SelectItem value="pending">Pending</SelectItem>
//               <SelectItem value="verified">Verified</SelectItem>
//               <SelectItem value="rejected">Rejected</SelectItem>
//             </SelectContent>
//           </Select>

//         </div>
//       </div>




//       <div className="p-4 sm:p-6">
//         {loading ? (
//           <div className="text-center py-8 text-muted-foreground">Loading...</div>
//         ) : (
//           <div className="overflow-x-auto">
//             {/* <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>Lawyer</TableHead>
//                   <TableHead>Document</TableHead>
//                   <TableHead>Type</TableHead>
//                   <TableHead>Status</TableHead>
//                   <TableHead>Uploaded</TableHead>
//                   <TableHead className="text-right">Actions</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {filtered.map((doc) => (
//                   <TableRow key={doc.id}>
//                     <TableCell>
//                       <div>
//                         <p className="font-medium">{doc.lawyer_name}</p>
//                         <p className="text-xs text-muted-foreground">{doc.lawyer_email}</p>
//                       </div>
//                     </TableCell>
//                     <TableCell className="text-sm">{doc.document_name}</TableCell>
//                     <TableCell className="text-sm">{DOCUMENT_TYPE_LABELS[doc.document_type] || doc.document_type}</TableCell>
//                     <TableCell>{getStatusBadge(doc.status)}</TableCell>
//                     <TableCell className="text-xs">{new Date(doc.uploaded_at).toLocaleDateString()}</TableCell>
//                     <TableCell className="text-right">
//                       <div className="flex justify-end gap-1">
//                         <Button variant="ghost" size="sm" onClick={() => handleView(doc)}>
//                           <Eye className="h-4 w-4" />
//                         </Button>
//                         {doc.status === 'pending' && (
//                           <>
//                             <Button variant="ghost" size="sm" className="text-green-600" onClick={() => updateStatus(doc.id, 'verified')}>
//                               <CheckCircle className="h-4 w-4" />
//                             </Button>
//                             <Button variant="ghost" size="sm" className="text-red-600" onClick={() => updateStatus(doc.id, 'rejected')}>
//                               <XCircle className="h-4 w-4" />
//                             </Button>
//                           </>
//                         )}
//                       </div>
//                     </TableCell>
//                   </TableRow>
//                 ))}
//                 {filtered.length === 0 && (
//                   <TableRow>
//                     <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
//                       No documents found
//                     </TableCell>
//                   </TableRow>
//                 )}
//               </TableBody>
//             </Table> */}

//             <div className="space-y-3">
//               {filtered.map((doc) => (
//                 <div key={doc.id} className="group rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all duration-200 p-4">

//                   <div className="flex justify-between">
//                     <div>
//                       <p className="font-bold text-slate-900">{doc.document_name}</p>
//                       <p className="text-xs text-slate-500">{doc.lawyer_name}</p>
//                       <p className="text-xs text-slate-400">{doc.lawyer_email}</p>
//                     </div>

//                     <div>{getStatusBadge(doc.status)}</div>
//                   </div>

//                   <div className="flex gap-2 mt-3">
//                     <Button size="sm" variant="outline" onClick={() => handleView(doc)}>
//                       <Eye className="h-4 w-4 mr-1" /> View
//                     </Button>

//                     {doc.status === 'pending' && (
//                       <>
//                         <Button size="sm" className="bg-green-600 text-white" onClick={() => updateStatus(doc.id, 'verified')}>
//                           Verify
//                         </Button>

//                         <Button size="sm" variant="destructive" onClick={() => updateStatus(doc.id, 'rejected')}>
//                           Reject
//                         </Button>
//                       </>
//                     )}
//                   </div>

//                 </div>
//               ))}
//             </div>
//           </div>
//         )}
//       </div>
//       {/* View Document Dialog */}
//       <Dialog open={!!viewDoc} onOpenChange={() => setViewDoc(null)}>
//         <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
//           <DialogHeader>
//             <DialogTitle>Review Document</DialogTitle>
//             <DialogDescription>
//               {viewDoc?.lawyer_name} — {DOCUMENT_TYPE_LABELS[viewDoc?.document_type || ''] || viewDoc?.document_type}
//             </DialogDescription>
//           </DialogHeader>
//           <div className="space-y-4">
//             {/* Preview */}
//             {viewUrl && (
//               <div className="border rounded-lg overflow-hidden">
//                 {viewDoc?.document_name.toLowerCase().endsWith('.pdf') ? (
//                   <iframe src={viewUrl} className="w-full h-[400px]" title="Document preview" />
//                 ) : (
//                   <img src={viewUrl} alt="Document" className="w-full max-h-[400px] object-contain" />
//                 )}
//               </div>
//             )}
//             {!viewUrl && (
//               <div className="border rounded-lg p-8 text-center text-muted-foreground">
//                 Unable to load preview.
//                 <Button variant="link" onClick={() => viewUrl && window.open(viewUrl, '_blank')}>Open in new tab</Button>
//               </div>
//             )}
//             {/* Admin notes */}
//             <div className="space-y-2">
//               <label className="text-sm font-medium">Admin Notes</label>
//               <Textarea
//                 value={adminNotes}
//                 onChange={(e) => setAdminNotes(e.target.value)}
//                 placeholder="Add notes about this document..."
//                 rows={3}
//               />
//             </div>
//             {/* Status info */}
//             <div className="flex items-center gap-2 text-sm">
//               <span>Current status:</span> {getStatusBadge(viewDoc?.status || 'pending')}
//             </div>
//           </div>
//           <DialogFooter className="gap-2">
//             <Button variant="outline" onClick={() => setViewDoc(null)}>Close</Button>
//             {viewDoc?.status !== 'rejected' && (
//               <Button variant="destructive" onClick={() => viewDoc && updateStatus(viewDoc.id, 'rejected')}>
//                 <XCircle className="h-4 w-4 mr-2" />
//                 Reject
//               </Button>
//             )}
//             {viewDoc?.status !== 'verified' && (
//               <Button onClick={() => viewDoc && updateStatus(viewDoc.id, 'verified')} className="bg-green-600 hover:bg-green-700">
//                 <CheckCircle className="h-4 w-4 mr-2" />
//                 Verify
//               </Button>
//             )}
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// };


import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Shield, Clock, XCircle, CheckCircle, User, GraduationCap,
  Briefcase, Mail, Eye, Search, Filter, RefreshCw, Loader2,
  FileText, ChevronLeft, ChevronRight, Sparkles, ArrowLeft, Ban, ZoomIn, ZoomOut, RotateCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Document {
  id: string;
  lawyer_user_id: string;
  document_name: string;
  document_type: string;
  storage_path: string;
  file_size_bytes: number | null;
  status: string;
  admin_notes: string | null;
  uploaded_at: string;
  reviewed_at: string | null;
  lawyer_name?: string;
  lawyer_email?: string;
}

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  bar_certificate: 'Bar Certificate',
  degree: 'Law Degree / Degree Certificate',
  id_proof: 'ID Proof (Passport)',
  adhar_card: 'Aadhar Card',
  pan_card: 'PAN Card',
  college_passout_certificate: 'College Passout Certificate',
  experience_certificate: 'Experience Certificate',
  other: 'Other',
};

// ─── Status Design System Configuration ───────────────────────────────────────
const STATUS_CONFIG = {
  verified: {
    label: 'Verified',
    icon: CheckCircle,
    pill: 'bg-emerald-50 text-emerald-700 border border-emerald-200 ring-1 ring-emerald-100',
    dot: 'bg-emerald-500',
  },
  rejected: {
    label: 'Rejected',
    icon: XCircle,
    pill: 'bg-red-50 text-red-700 border border-red-200 ring-1 ring-red-100',
    dot: 'bg-red-500',
  },
  pending: {
    label: 'Pending',
    icon: Clock,
    pill: 'bg-amber-50 text-amber-700 border border-amber-200 ring-1 ring-amber-100',
    dot: 'bg-amber-400',
  },
} as const;

function StatusPill({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold tracking-wide', cfg.pill)}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  );
}

// ─── Stat counter chip for premium header ─────────────────────────────────────
function StatChip({ count, label, color }: { count: number; label: string; color: string }) {
  return (
    <div className={cn('flex flex-col items-center justify-center rounded-xl px-4 py-2.5 min-w-[72px]', color)}>
      <span className="text-xl font-bold leading-none">{count}</span>
      <span className="text-[10px] font-medium uppercase tracking-widest mt-0.5 opacity-75">{label}</span>
    </div>
  );
}

export const DocumentVerification = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewDoc, setViewDoc] = useState<Document | null>(null);
  const [viewUrl, setViewUrl] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  // ─── ADD THESE NEW ZOOM LINES HERE ───────────────────
  const [zoomScale, setZoomScale] = useState<number>(1);
  const handleZoomIn = () => setZoomScale(prev => Math.min(prev + 0.2, 2.4));
  const handleZoomOut = () => setZoomScale(prev => Math.max(prev - 0.2, 0.6));
  const handleZoomReset = () => setZoomScale(1);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 5;

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, filter, documents]);

  const fetchDocuments = async () => {
    setRefreshing(true);
    try {
      const { data, error } = await supabase
        .from('lawyer_documents')
        .select('*')
        .order('uploaded_at', { ascending: false });

      if (!error && data) {
        const userIds = [...new Set(data.map((d: any) => d.lawyer_user_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', userIds);

        const enriched = data.map((doc: any) => {
          const profile = profiles?.find(p => p.id === doc.lawyer_user_id);
          return {
            ...doc,
            lawyer_name: profile?.full_name || 'Unknown',
            lawyer_email: profile?.email || ''
          };
        });
        setDocuments(enriched);
      }
    } catch (err) {
      console.error('Error fetching documents:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleView = async (doc: Document) => {
    setViewDoc(doc);
    setAdminNotes(doc.admin_notes || '');
    const { data, error } = await supabase.storage
      .from('lawyer-documents')
      .createSignedUrl(doc.storage_path, 300); // 5 min

    if (!error && data) {
      setViewUrl(data.signedUrl);
    } else {
      setViewUrl(null);
    }
  };

  const updateStatus = async (docId: string, status: 'verified' | 'rejected') => {
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from('lawyer_documents')
      .update({
        status,
        admin_notes: adminNotes.trim() || null,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user?.id,
      })
      .eq('id', docId);

    if (!error) {
      toast({ title: `Document ${status === 'verified' ? 'Approved ✅' : 'Rejected ❌'}` });
      setViewDoc(null);
      fetchDocuments();
    } else {
      toast({ variant: 'destructive', title: 'Failed to update', description: error.message });
    }
  };

  // ── Derived Data & Counters ───────────────────────────────────────────────────
  const filtered = documents.filter(d => {
    const matchesFilter = filter === 'all' || d.status === filter;
    const matchesSearch =
      d.lawyer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.document_name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const displayedDocuments = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const pendingCount = documents.filter(d => d.status === 'pending').length;
  const verifiedCount = documents.filter(d => d.status === 'verified').length;
  const rejectedCount = documents.filter(d => d.status === 'rejected').length;

  // ── Loading state skeleton match ──────────────────────────────────────────────
  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-slate-100 animate-pulse" />
          <div className="space-y-1.5">
            <div className="h-4 w-40 bg-slate-100 rounded animate-pulse" />
            <div className="h-3 w-56 bg-slate-100 rounded animate-pulse" />
          </div>
        </div>
        <div className="p-6 space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-slate-50 rounded-xl animate-pulse border border-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {/* ── Premium Gradient Header ────────────────────────────────────────── */}
        <div className="px-5 sm:px-7 py-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 h-60 w-60 rounded-full bg-blue-500 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-60 w-60 rounded-full bg-indigo-500 blur-3xl" />
          </div>
          <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.04]" />

          {/* Action Row */}
          <div className="relative flex items-center justify-between w-full mb-4 z-50">
            <button
              onClick={() => navigate(-1)}
              className="hidden md:flex items-center gap-2 text-slate-300 hover:text-white transition-colors text-sm font-medium"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>

            <button
              onClick={fetchDocuments}
              disabled={refreshing}
              className={cn(
                'absolute top-0 right-0 sm:-top-1 sm:right-0 h-9 w-9 rounded-xl bg-white/10 border border-white/20',
                'flex items-center justify-center hover:bg-white/20 transition-colors disabled:opacity-50'
              )}
              title="Refresh Data"
            >
              <RefreshCw className={cn('h-4 w-4 text-white', refreshing && 'animate-spin')} />
            </button>
          </div>

          <div className="relative flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            {/* Title block */}
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-sm">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-bold tracking-tight text-white">Document Verification</h2>
                  {pendingCount > 0 && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-400 text-amber-950">
                      <Sparkles className="h-2.5 w-2.5" />
                      {pendingCount} pending review
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-400 mt-0.5">Review, verify and audit lawyer legal documentation</p>
              </div>
            </div>

            {/* Stat chips */}
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <StatChip count={verifiedCount} label="Verified" color="bg-emerald-500/15 text-emerald-300" />
              <StatChip count={pendingCount} label="Pending" color="bg-amber-500/15 text-amber-300" />
              <StatChip count={rejectedCount} label="Rejected" color="bg-red-500/15 text-red-300" />
            </div>
          </div>

          {/* ── Search + Filter bar ──────────────────────────────────────────── */}
          <div className="relative grid grid-cols-1 sm:grid-cols-[1fr_200px] gap-2.5 mt-5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by lawyer name or document title…"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className={cn(
                  'w-full h-10 rounded-xl bg-white/10 border border-white/20 pl-9 pr-4 text-sm text-white placeholder:text-slate-400',
                  'focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/15 transition-all'
                )}
              />
            </div>

            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="h-10 rounded-xl bg-white/10 border border-white/20 text-white text-sm focus:ring-2 focus:ring-white/30">
                <Filter className="h-3.5 w-3.5 mr-1.5 opacity-60" />
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Documents</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* ── Document Item List ──────────────────────────────────────────────── */}
        <div className="p-4 sm:p-6">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                <FileText className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-slate-600 font-medium">No documents found</p>
              <p className="text-slate-400 text-sm mt-1">
                {searchTerm || filter !== 'all' ? 'Try adjusting your search filters.' : 'New legal uploads will show here.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3 pr-2">
              {displayedDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className={cn(
                    'group relative rounded-xl border border-slate-200 bg-white hover:border-slate-300',
                    'shadow-sm hover:shadow-md transition-all duration-200',
                    doc.status === 'pending' && 'bg-amber-50/30'
                  )}
                >
                  <div className="p-4 md:p-5">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

                      {/* Left: Metadata and Avatars */}
                      <div className="flex items-start gap-3.5 flex-1 min-w-0">
                        <div className="relative flex-shrink-0">
                          <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                            <AvatarFallback className="bg-gradient-to-br from-slate-700 to-slate-900 text-white font-bold text-sm">
                              {doc.lawyer_name?.charAt(0) || 'D'}
                            </AvatarFallback>
                          </Avatar>
                        </div>

                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-slate-900 text-base tracking-tight truncate max-w-[200px] sm:max-w-xs">

                              {doc.lawyer_name}
                            </h3>
                            <StatusPill status={doc.status} />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-500 font-medium">
                            <span className="flex items-center gap-1.5 truncate">
                              <User className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />

                              Doc ID:
                              {doc.id}
                            </span>
                            <span className="flex items-center gap-1.5 truncate">
                              <Mail className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                              {doc.lawyer_email}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Briefcase className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                              Type: <span className="text-slate-700 font-semibold">{DOCUMENT_TYPE_LABELS[doc.document_type] || doc.document_type}</span>
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                              Uploaded: <span className="text-slate-700 font-semibold">{new Date(doc.uploaded_at).toLocaleDateString()}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Verification Action triggers */}
                      <div className="flex flex-wrap gap-2 lg:flex-nowrap lg:items-center">
                        <button
                          onClick={() => handleView(doc)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Review
                        </button>

                        {doc.status === 'pending' && (
                          <>
                            <button
                              onClick={() => updateStatus(doc.id, 'verified')}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm"
                            >
                              <CheckCircle className="h-3.5 w-3.5" /> Approve
                            </button>
                            <button
                              onClick={() => updateStatus(doc.id, 'rejected')}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-red-200 bg-red-50 text-red-600 hover:bg-red-100/70 transition-colors"
                            >
                              <XCircle className="h-3.5 w-3.5" /> Reject
                            </button>
                          </>
                        )}
                      </div>

                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Pagination controls ────────────────────────────────────────── */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-100 pt-5 mt-5">
              <p className="text-xs text-slate-500 font-medium">
                Showing Page <span className="font-semibold text-slate-800">{page}</span> of <span className="font-semibold text-slate-800">{totalPages}</span>
              </p>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="h-8 px-2.5 rounded-lg border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4 mr-0.5" /> Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="h-8 px-2.5 rounded-lg border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-40"
                >
                  Next <ChevronRight className="h-4 w-4 ml-0.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Premium Dialog Backdrop Modal Preview Layout ────────────────────── */}
      {/* MODIFY THIS EXISTING LINE */}
      <Dialog open={!!viewDoc} onOpenChange={() => { setViewDoc(null); handleZoomReset(); }}>
        <DialogContent className="sm:max-w-2xl w-[94vw] max-w-full rounded-2xl p-0 overflow-hidden border-none shadow-2xl gap-0 bg-white flex flex-col my-auto max-h-[92vh] [&>button]:text-white [&>button]:hover:text-white">

          {/* Header Section */}
          <DialogHeader className="px-5 sm:px-6 py-4 sm:py-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white relative flex-shrink-0">

            <DialogTitle className="text-sm sm:text-base font-bold tracking-tight flex items-center gap-2">
              <FileText className="h-4 w-4 opacity-70 flex-shrink-0" />
              <span className="truncate">Review Secure Attachment</span>
            </DialogTitle>
            <DialogDescription className="text-[11px] sm:text-xs text-slate-400 mt-0.5 truncate">
              Owner: {viewDoc?.lawyer_name}
            </DialogDescription>
          </DialogHeader>

          {/* Content Container with Hidden Scrollbar */}
          <ScrollArea className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 sm:py-5 scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="space-y-4 sm:space-y-5">

              {/* File Frame Preview Wrapper */}
              {/* ─── REPLACE FROM HERE ────────────────────────────────────────── */}
              {viewUrl ? (
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-inner bg-slate-50 p-3 space-y-3">

                  {/* File Info + Actions */}
                  <div className="flex items-center justify-between bg-white border border-slate-200 rounded-lg px-3 py-2">
                    {/* <div className="text-xs text-slate-600 font-medium truncate">
                      {viewDoc?.document_name}
                    </div> */}

                    <div className="flex gap-2">
                      {/* VIEW BUTTON */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(viewUrl, '_blank')}
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View
                      </Button>

                      {/* DOWNLOAD BUTTON */}
                      <Button
                        size="sm"
                        onClick={() => {
                          const a = document.createElement('a');
                          a.href = viewUrl;
                          a.download = viewDoc?.document_name || 'document';
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                        }}
                      >
                        Download
                      </Button>
                    </div>
                  </div>

                  {/* PREVIEW AREA */}
                  {viewDoc?.document_name.toLowerCase().endsWith('.pdf') ? (
                    <div className="border rounded-lg bg-white p-3 text-center text-slate-500 text-sm">
                      PDF Document Preview Available
                    </div>
                  ) : (
                    <div className="border rounded-lg overflow-hidden bg-white flex justify-center">
                      <img
                        src={viewUrl}
                        alt="Document"
                        className="max-h-[420px] object-contain"
                      />
                    </div>
                  )}

                </div>
              ) : (
                <div className="border border-dashed border-slate-200 rounded-xl p-6 sm:p-8 text-center text-slate-400 bg-slate-50">
                  <p className="text-xs sm:text-sm font-medium mb-2">
                    Direct secure rendering is unavailable.
                  </p>

                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => viewUrl && window.open(viewUrl, '_blank')}
                    className="text-blue-600 font-semibold p-0 h-auto text-xs sm:text-sm"
                  >
                    Open raw asset in secure tab
                  </Button>
                </div>
              )}

              {/* Audit Notes Form Input */}
              <div className="space-y-1.5">
                <Label className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
                  Audit Review & Decision Notes
                </Label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Provide precise confirmation logs or clear rejection instructions to the applicant..."
                  rows={3}
                  className="text-xs sm:text-sm rounded-xl border-slate-200 focus:ring-slate-900 resize-none p-3 min-h-[80px] scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none]"
                />
              </div>

              {/* Status Badge Metadata Row */}
              <div className="flex items-center gap-2 text-[11px] sm:text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-100 rounded-xl p-3">
                <span>Current Status Flag:</span>
                <StatusPill status={viewDoc?.status || 'pending'} />
              </div>
            </div>
          </ScrollArea>

          {/* Responsive Dialog Actions Footer */}
          <DialogFooter className="px-5 sm:px-6 py-3 sm:py-4 bg-slate-50 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2 justify-end flex-shrink-0">
            {/* <Button
              variant="outline"
              onClick={() => setViewDoc(null)}
              className="h-9 text-xs sm:text-sm font-semibold rounded-xl border-slate-200 bg-white text-slate-700 hover:bg-slate-50 w-full sm:w-auto"
            >
              Close
            </Button> */}

            {viewDoc?.status !== 'rejected' && (
              <Button
                variant="destructive"
                onClick={() => viewDoc && updateStatus(viewDoc.id, 'rejected')}
                className="h-9 text-xs sm:text-sm font-semibold rounded-xl px-4 w-full sm:w-auto flex items-center justify-center gap-1.5"
              >
                <XCircle className="h-4 w-4" /> Reject
              </Button>
            )}

            {viewDoc?.status !== 'verified' && (
              <Button
                onClick={() => viewDoc && updateStatus(viewDoc.id, 'verified')}
                className="h-9 text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-4 shadow-sm w-full sm:w-auto flex items-center justify-center gap-1.5"
              >
                <CheckCircle className="h-4 w-4" /> Approve
              </Button>
            )}

            <Button
              variant="outline"
              onClick={() => {
                if (viewDoc?.lawyer_user_id) {
                  navigate(`/admin/AdminLawyerDetailsPage/${viewDoc.lawyer_user_id}`);
                }
              }}
              className="h-9 text-xs sm:text-sm font-semibold rounded-xl border-slate-200 bg-white text-slate-700 hover:bg-slate-50 w-full sm:w-auto"
            >
              <Eye className="h-3.5 w-3.5" />
              View Lawyer
            </Button>
          </DialogFooter>

        </DialogContent>
      </Dialog >
    </>
  );
};