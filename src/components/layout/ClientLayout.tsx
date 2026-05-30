import { ReactNode } from 'react';
import { ClientNavbar } from './ClientNavbar';
import { ClientFooter } from './ClientFooter';


interface ClientLayoutProps {
  children: ReactNode;
  showClientFooter?: boolean;
}
export const ClientLayout = ({ children, showClientFooter = true }: ClientLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <ClientNavbar />
      {/* <main className="flex-1 pt-16"> */}
      <main className="flex-1 pt-16">
        {children}
      </main>
      {showClientFooter && <ClientFooter />}
    </div>
  );
};