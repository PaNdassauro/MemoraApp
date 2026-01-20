import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';

interface MainLayoutProps {
    children: ReactNode;
    currentView: string;
    onViewChange: (view: string) => void;
}

export function MainLayout({ children, currentView, onViewChange }: MainLayoutProps) {
    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar currentView={currentView} onViewChange={onViewChange} />

            {/* Main Content Area */}
            <main className="ml-64 min-h-screen">
                {children}
            </main>
        </div>
    );
}
