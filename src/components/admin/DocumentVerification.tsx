import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { CheckCircle, XCircle, Eye, Clock, FileText, Search } from 'lucide-react';
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
export const DocumentVerification = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewDoc, setViewDoc] = useState<Document | null>(null);
  const [viewUrl, setViewUrl] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const { toast } = useToast();
  useEffect(() => {
    fetchDocuments();
  }, []);
  const fetchDocuments = async () => {
    const { data, error } = await supabase
      .from('lawyer_documents')
      .select('*')
      .order('uploaded_at', { ascending: false });
    if (!error && data) {
      // Enrich with lawyer names
      const userIds = [...new Set(data.map((d: any) => d.lawyer_user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', userIds);
      const enriched = data.map((doc: any) => {
        const profile = profiles?.find(p => p.id === doc.lawyer_user_id);
        return { ...doc, lawyer_name: profile?.full_name || 'Unknown', lawyer_email: profile?.email || '' };
      });
      setDocuments(enriched);
    }
    setLoading(false);
  };
  const handleView = async (doc: Document) => {
    setViewDoc(doc);
    setAdminNotes(doc.admin_notes || '');
    // Get signed URL for private bucket
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
      toast({ title: `Document ${status}` });
      setViewDoc(null);
      fetchDocuments();
    } else {
      toast({ variant: 'destructive', title: 'Failed to update', description: error.message });
    }
  };
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Verified</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500/10 text-red-600 border-red-500/20">Rejected</Badge>;
      default:
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">Pending</Badge>;
    }
  };
  const filtered = documents.filter(d => {
    const matchesFilter = filter === 'all' || d.status === filter;
    const matchesSearch = d.lawyer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.document_name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Document Verification
          </CardTitle>
          <div className="flex gap-2">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lawyer</TableHead>
                  <TableHead>Document</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{doc.lawyer_name}</p>
                        <p className="text-xs text-muted-foreground">{doc.lawyer_email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{doc.document_name}</TableCell>
                    <TableCell className="text-sm">{DOCUMENT_TYPE_LABELS[doc.document_type] || doc.document_type}</TableCell>
                    <TableCell>{getStatusBadge(doc.status)}</TableCell>
                    <TableCell className="text-xs">{new Date(doc.uploaded_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleView(doc)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {doc.status === 'pending' && (
                          <>
                            <Button variant="ghost" size="sm" className="text-green-600" onClick={() => updateStatus(doc.id, 'verified')}>
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-600" onClick={() => updateStatus(doc.id, 'rejected')}>
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No documents found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
      {/* View Document Dialog */}
      <Dialog open={!!viewDoc} onOpenChange={() => setViewDoc(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Document</DialogTitle>
            <DialogDescription>
              {viewDoc?.lawyer_name} — {DOCUMENT_TYPE_LABELS[viewDoc?.document_type || ''] || viewDoc?.document_type}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Preview */}
            {viewUrl && (
              <div className="border rounded-lg overflow-hidden">
                {viewDoc?.document_name.toLowerCase().endsWith('.pdf') ? (
                  <iframe src={viewUrl} className="w-full h-[400px]" title="Document preview" />
                ) : (
                  <img src={viewUrl} alt="Document" className="w-full max-h-[400px] object-contain" />
                )}
              </div>
            )}
            {!viewUrl && (
              <div className="border rounded-lg p-8 text-center text-muted-foreground">
                Unable to load preview.
                <Button variant="link" onClick={() => viewUrl && window.open(viewUrl, '_blank')}>Open in new tab</Button>
              </div>
            )}
            {/* Admin notes */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Admin Notes</label>
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add notes about this document..."
                rows={3}
              />
            </div>
            {/* Status info */}
            <div className="flex items-center gap-2 text-sm">
              <span>Current status:</span> {getStatusBadge(viewDoc?.status || 'pending')}
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setViewDoc(null)}>Close</Button>
            {viewDoc?.status !== 'rejected' && (
              <Button variant="destructive" onClick={() => viewDoc && updateStatus(viewDoc.id, 'rejected')}>
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
            )}
            {viewDoc?.status !== 'verified' && (
              <Button onClick={() => viewDoc && updateStatus(viewDoc.id, 'verified')} className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="h-4 w-4 mr-2" />
                Verify
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};