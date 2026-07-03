
import { ReactNode } from 'react';
import { AdminNavbar } from './AdminNavbar';
import { AdminSidebar } from './AdminSidebar';

interface AdminLayoutProps {
    children: ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
    return (
        <div className="min-h-screen flex flex-col w-full max-w-[100vw] overflow-x-hidden">
            <AdminNavbar />

            <div className="flex flex-1 pt-16 w-full min-w-0">
                {/* <aside className="w-64 hidden md:block border-r border-gray-200">
                    <AdminSidebar />
                </aside> */}

                <main className="flex-1 min-w-0 w-full p-0 sm:p-6 bg-gray-50 overflow-x-hidden">
                    {children}
                </main>
            </div>
        </div>
    );
};
