// import { useState, useEffect, useRef } from 'react';
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { supabase } from '@/integrations/supabase/client';
// import { useToast } from '@/hooks/use-toast';
// import { FileText, Upload, Trash2, Loader2, CheckCircle, Clock, XCircle, Eye } from 'lucide-react';

// interface LawyerDocument {
//   id: string;
//   document_name: string;
//   document_type: string;
//   storage_path: string;
//   file_size_bytes: number | null;
//   status: string;
//   admin_notes: string | null;
//   uploaded_at: string;
// }

// const DOCUMENT_TYPES = [
//   { value: 'bar_certificate', label: 'Bar Council Certificate' },
//   { value: 'degree', label: 'Law Degree' },
//   { value: 'id_proof', label: 'ID Proof (Aadhar/Passport)' },
//   { value: 'experience_certificate', label: 'Experience Certificate' },
//   { value: 'other', label: 'Other Document' },
// ];

// interface LawyerDocumentsProps {
//   userId: string;
// }

// export const LawyerDocuments = ({ userId }: LawyerDocumentsProps) => {
//   const [documents, setDocuments] = useState<LawyerDocument[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [uploading, setUploading] = useState(false);
//   const [selectedType, setSelectedType] = useState('bar_certificate');
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const { toast } = useToast();

//   useEffect(() => {
//     fetchDocuments();
//   }, [userId]);

//   const fetchDocuments = async () => {
//     const { data, error } = await supabase
//       .from('lawyer_documents')
//       .select('*')
//       .eq('lawyer_user_id', userId)
//       .order('uploaded_at', { ascending: false });

//     if (!error && data) {
//       setDocuments(data as LawyerDocument[]);
//     }
//     setLoading(false);
//   };

//   const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     // Validate: PDF, images, max 10MB
//     const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
//     if (!allowedTypes.includes(file.type)) {
//       toast({ variant: 'destructive', title: 'Invalid file', description: 'Upload PDF or image files only.' });
//       return;
//     }
//     if (file.size > 10 * 1024 * 1024) {
//       toast({ variant: 'destructive', title: 'File too large', description: 'Maximum 10MB per file.' });
//       return;
//     }

//     setUploading(true);
//     try {
//       const fileExt = file.name.split('.').pop();
//       const fileName = `${Date.now()}_${selectedType}.${fileExt}`;
//       const storagePath = `${userId}/${fileName}`;

//       const { error: uploadError } = await supabase.storage
//         .from('lawyer-documents')
//         .upload(storagePath, file);

//       if (uploadError) throw uploadError;

//       // Insert record
//       const { error: insertError } = await supabase
//         .from('lawyer_documents')
//         .insert({
//           lawyer_user_id: userId,
//           document_name: file.name,
//           document_type: selectedType,
//           storage_path: storagePath,
//           file_size_bytes: file.size,
//         });

//       if (insertError) throw insertError;

//       toast({ title: '✅ Document uploaded!', description: 'It will be reviewed by admin.' });
//       fetchDocuments();
//     } catch (error: any) {
//       toast({ variant: 'destructive', title: 'Upload failed', description: error.message });
//     } finally {
//       setUploading(false);
//       if (fileInputRef.current) fileInputRef.current.value = '';
//     }
//   };

//   const handleDelete = async (doc: LawyerDocument) => {
//     if (!confirm(`Delete "${doc.document_name}"?`)) return;

//     try {
//       await supabase.storage.from('lawyer_documents').remove([doc.storage_path]);
//       await supabase.from('lawyer_documents').delete().eq('id', doc.id);
//       toast({ title: 'Document deleted' });
//       fetchDocuments();
//     } catch (error: any) {
//       toast({ variant: 'destructive', title: 'Delete failed', description: error.message });
//     }
//   };

//   const getStatusBadge = (status: string) => {
//     switch (status) {
//       case 'verified':
//         return <Badge className="bg-green-500/10 text-green-600 border-green-500/20 gap-1"><CheckCircle className="h-3 w-3" />Verified</Badge>;
//       case 'rejected':
//         return <Badge className="bg-red-500/10 text-red-600 border-red-500/20 gap-1"><XCircle className="h-3 w-3" />Rejected</Badge>;
//       default:
//         return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 gap-1"><Clock className="h-3 w-3" />Pending</Badge>;
//     }
//   };

//   const formatFileSize = (bytes: number | null) => {
//     if (!bytes) return 'Unknown';
//     if (bytes < 1024) return `${bytes} B`;
//     if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
//     return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
//   };

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle className="flex items-center gap-2">
//           <FileText className="h-5 w-5" />
//           Verification Documents
//         </CardTitle>
//         <CardDescription>
//           Upload your credentials for admin verification. Accepted: PDF, JPG, PNG (max 10MB each).
//         </CardDescription>
//       </CardHeader>
//       <CardContent className="space-y-4">
//         {/* Upload Section */}
//         <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3 p-4 border border-dashed rounded-lg">
//           <div className="space-y-1 flex-1">
//             <p className="text-sm font-medium">Document Type</p>
//             <Select value={selectedType} onValueChange={setSelectedType}>
//               <SelectTrigger className="w-full">
//                 <SelectValue />
//               </SelectTrigger>
//               <SelectContent>
//                 {DOCUMENT_TYPES.map(t => (
//                   <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>
//           {/* 2. INSERT THE RED MANDATORY MESSAGE DIRECTLY HERE: */}
//           <div className="w-full text-xs font-semibold text-destructive mt-1 sm:hidden">
//             * Mandatory to upload: Bar Council Number, Law Degree, ID Proof.
//           </div>

//           <div>
//             <Button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="gap-2">
//               {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
//               {uploading ? 'Uploading...' : 'Upload File'}
//             </Button>
//             <input ref={fileInputRef} type="file" accept=".pdf,image/*" className="hidden" onChange={handleUpload} />
//           </div>
//         </div>
//         {/* 3. ALSO ADD IT HERE SO IT REMAINS CLEAN ON WIDER/DESKTOP SCREENS */}
//         <div className="hidden sm:block text-xs font-semibold text-destructive px-1">
//           * Mandatory to upload: Bar Council Number, Law Degree, ID Proof.
//         </div>

//         {/* Documents List */}
//         {loading ? (
//           <div className="text-center py-8 text-muted-foreground">Loading documents...</div>
//         ) : documents.length === 0 ? (
//           <div className="text-center py-8 text-muted-foreground">
//             <FileText className="h-12 w-12 mx-auto mb-2 opacity-30" />
//             <p>No documents uploaded yet</p>
//             <p className="text-xs">Upload your bar certificate, degree, and ID proof for verification</p>
//           </div>
//         ) : (
//           <div className="space-y-3">
//             {documents.map((doc) => (
//               <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
//                 <div className="flex items-center gap-3 min-w-0">
//                   <FileText className="h-8 w-8 text-muted-foreground shrink-0" />
//                   <div className="min-w-0">
//                     <p className="text-sm font-medium truncate">{doc.document_name}</p>
//                     <div className="flex items-center gap-2 text-xs text-muted-foreground">
//                       <span>{DOCUMENT_TYPES.find(t => t.value === doc.document_type)?.label || doc.document_type}</span>
//                       <span>•</span>
//                       <span>{formatFileSize(doc.file_size_bytes)}</span>
//                     </div>
//                     {doc.admin_notes && (
//                       <p className="text-xs text-muted-foreground mt-1 italic">Note: {doc.admin_notes}</p>
//                     )}
//                   </div>
//                 </div>
//                 <div className="flex items-center gap-2 shrink-0">
//                   {getStatusBadge(doc.status)}
//                   {doc.status === 'pending' && (
//                     <Button variant="ghost" size="sm" onClick={() => handleDelete(doc)} className="text-destructive hover:text-destructive">
//                       <Trash2 className="h-4 w-4" />
//                     </Button>
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   );
// };


//04-06-2026

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FileText, Upload, Trash2, Loader2, CheckCircle, Clock, XCircle } from 'lucide-react';

interface LawyerDocument {
  id: string;
  document_name: string;
  document_type: string;
  storage_path: string;
  file_size_bytes: number | null;
  status: string;
  admin_notes: string | null;
  uploaded_at: string;
}

const DOCUMENT_TYPES = [
  { value: 'bar_certificate', label: 'Bar Council Certificate' },
  { value: 'degree', label: 'Law Degree' },
  { value: 'id_proof', label: 'ID Proof (Aadhar/Passport)' },
  { value: 'experience_certificate', label: 'Experience Certificate' },
  { value: 'other', label: 'Other Document' },
];

interface LawyerDocumentsProps {
  userId: string;
}

export const LawyerDocuments = ({ userId }: LawyerDocumentsProps) => {
  const [documents, setDocuments] = useState<LawyerDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedType, setSelectedType] = useState('bar_certificate');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchDocuments();
  }, [userId]);

  const fetchDocuments = async () => {
    const { data, error } = await supabase
      .from('lawyer_documents')
      .select('*')
      .eq('lawyer_user_id', userId)
      .order('uploaded_at', { ascending: false });

    if (!error && data) {
      setDocuments(data as LawyerDocument[]);
    }
    setLoading(false);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({ variant: 'destructive', title: 'Invalid file', description: 'Upload PDF or image files only.' });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({ variant: 'destructive', title: 'File too large', description: 'Maximum 10MB per file.' });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${selectedType}.${fileExt}`;
      const storagePath = `${userId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('lawyer-documents')
        .upload(storagePath, file);

      if (uploadError) throw uploadError;

      const { error: insertError } = await supabase
        .from('lawyer_documents')
        .insert({
          lawyer_user_id: userId,
          document_name: file.name,
          document_type: selectedType,
          storage_path: storagePath,
          file_size_bytes: file.size,
        });

      if (insertError) throw insertError;

      toast({ title: '✅ Document uploaded!', description: 'It will be reviewed by admin.' });
      fetchDocuments();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Upload failed', description: error.message });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (doc: LawyerDocument) => {
    if (!confirm(`Delete "${doc.document_name}"?`)) return;

    try {
      await supabase.storage.from('lawyer_documents').remove([doc.storage_path]);
      await supabase.from('lawyer_documents').delete().eq('id', doc.id);
      toast({ title: 'Document deleted' });
      fetchDocuments();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Delete failed', description: error.message });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20 gap-1 py-0.5 px-2 text-[10px] sm:text-xs font-medium"><CheckCircle className="h-3 w-3" />Verified</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500/10 text-red-600 border-red-500/20 gap-1 py-0.5 px-2 text-[10px] sm:text-xs font-medium"><XCircle className="h-3 w-3" />Rejected</Badge>;
      default:
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 gap-1 py-0.5 px-2 text-[10px] sm:text-xs font-medium"><Clock className="h-3 w-3" />Pending</Badge>;
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Card className="border-border">

      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[20px]">
          <FileText className="h-4 w-4" />
          Verification Documents
        </CardTitle>
        <CardDescription className="text-[11px] sm:text-xs text-muted-foreground">
          Upload your credentials for admin verification. Accepted: PDF, JPG, PNG (max 10MB each).
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0 space-y-3.5">
        {/* Upload Section */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 p-3 sm:p-4 bg-muted/20 border border-dashed border-border rounded-xl">
          <div className="space-y-1.5 flex-1">
            <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground">Document Type</p>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full h-9 text-xs sm:text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DOCUMENT_TYPES.map(t => (
                  <SelectItem key={t.value} value={t.value} className="text-xs sm:text-sm">{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full text-[11px] font-medium text-destructive mt-0.5 sm:hidden">
            * Mandatory to upload: Bar Council Number, Law Degree, ID Proof.
          </div>

          <div className="shrink-0">
            <Button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="gap-2 h-9 text-xs sm:text-sm w-full sm:w-auto px-4">
              {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
              {uploading ? 'Uploading...' : 'Upload File'}
            </Button>
            <input ref={fileInputRef} type="file" accept=".pdf,image/*" className="hidden" onChange={handleUpload} />
          </div>
        </div>

        <div className="hidden sm:block text-[11px] font-medium text-destructive px-1">
          * Mandatory to upload: Bar Council Number, Law Degree, ID Proof.
        </div>

        {/* Documents List */}
        {loading ? (
          <div className="text-center py-6 text-xs sm:text-sm text-muted-foreground flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground/60" /> Loading documents...
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-6 sm:py-8 border rounded-xl bg-muted/10 border-border/60">
            <FileText className="h-8 w-8 sm:h-10 sm:w-10 mx-auto mb-2 opacity-25" />
            <p className="text-xs font-medium text-foreground">No documents uploaded yet</p>
            <p className="text-[11px] text-muted-foreground px-4 mt-0.5">Upload your bar certificate, degree, and ID proof for verification</p>
          </div>
        ) : (
          <div className="space-y-2">
            {documents.map((doc) => (
              <div key={doc.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 sm:p-3 border border-border bg-card rounded-xl gap-2.5 sm:gap-4">
                <div className="flex items-start gap-2.5 min-w-0">
                  <FileText className="h-7 w-7 text-muted-foreground/70 shrink-0 mt-0.5" />
                  <div className="min-w-0 space-y-0.5">
                    <p className="text-xs sm:text-sm font-semibold truncate text-foreground pr-2">{doc.document_name}</p>
                    <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11px] text-muted-foreground font-medium">
                      <span>{DOCUMENT_TYPES.find(t => t.value === doc.document_type)?.label || doc.document_type}</span>
                      <span>•</span>
                      <span>{formatFileSize(doc.file_size_bytes)}</span>
                    </div>
                    {doc.admin_notes && (
                      <p className="text-[11px] text-destructive/90 bg-destructive/5 rounded px-2 py-0.5 mt-1 border border-destructive/10 inline-block font-medium">
                        Note: {doc.admin_notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-border/40">
                  <div className="sm:hidden text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Status</div>
                  <div className="flex items-center gap-1.5">
                    {getStatusBadge(doc.status)}
                    {doc.status === 'pending' && (
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(doc)} className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-lg">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};