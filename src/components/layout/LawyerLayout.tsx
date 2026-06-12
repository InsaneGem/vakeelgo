// import { ReactNode } from 'react';
import { ReactNode, useEffect } from 'react';
import { expireOldConsultations } from '@/lib/consultationExpiry';
import { LawyerNavbar } from './LawyerNavbar';
import { LawyerFooter } from './LawyerFooter';
interface LawyerLayoutProps {
  children: ReactNode;
  showLawyerFooter?: boolean;
}
export const LawyerLayout = ({ children, showLawyerFooter = true }: LawyerLayoutProps) => {
  useEffect(() => {
    expireOldConsultations();

    const interval = setInterval(() => {
      expireOldConsultations();
    }, 30000);

    return () => clearInterval(interval);
  }, []);
  return (
    <div className="min-h-screen flex flex-col">
      <LawyerNavbar />
      {/* <main className="flex-1 pt-16"> */}
      <main className="flex-1 pt-16">
        {children}
      </main>
      {showLawyerFooter && <LawyerFooter />}
    </div>
  );
};