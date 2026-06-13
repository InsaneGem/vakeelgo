import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { DocumentVerification } from '@/components/admin/DocumentVerification';

interface DocumentVerification {
    id: string;
    user_id: string;
    document_type: string;
    status: string;
    file_url: string;
    created_at: string;
    user_name?: string;
}

const AdminDocumentVerificationPage = () => {
    const { role, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && role !== 'admin') {
            navigate('/dashboard');
        }
    }, [role, loading, navigate]);

    return (
        <AdminLayout>
            <DocumentVerification />
        </AdminLayout>
    );
};

export default AdminDocumentVerificationPage;