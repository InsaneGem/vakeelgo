// import { ReactNode } from 'react';
import { ReactNode, useEffect } from 'react';
import { expireOldConsultations } from '@/lib/consultationExpiry';
import { ClientNavbar } from './ClientNavbar';
import { ClientFooter } from './ClientFooter';


interface ClientLayoutProps {
  children: ReactNode;
  showClientFooter?: boolean;
}
export const ClientLayout = ({ children, showClientFooter = true }: ClientLayoutProps) => {


  useEffect(() => {
    expireOldConsultations();

    const interval = setInterval(() => {
      expireOldConsultations();
    }, 30000);

    return () => clearInterval(interval);
  }, []);
  return (
    <div className="min-h-screen flex flex-col">
      <ClientNavbar />
      <main className="flex-1 pt-16">
        {children}
      </main>
      {showClientFooter && <ClientFooter />}
    </div>
  );
};