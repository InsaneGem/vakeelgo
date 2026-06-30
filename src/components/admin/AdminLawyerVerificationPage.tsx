// src/pages/admin/AdminLawyerVerificationPage.tsx
import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { LawyerVerificationPanel } from '@/components/admin/LawyerVerificationPanel';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const AdminLawyerVerificationPage = () => {
    const { role, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && role !== 'admin') {
            navigate('/dashboard');
        }
    }, [role, loading, navigate]);

    return (
        <AdminLayout>
            <div className="max-w-screen-xl mx-auto px-6 py-8">
                {/* <h1 className="text-2xl font-bold mb-6">Lawyer Verification</h1> */}
                {/* Pass any necessary props or logic here */}
                <LawyerVerificationPanel />
            </div>
        </AdminLayout>
    );
};

export default AdminLawyerVerificationPage;