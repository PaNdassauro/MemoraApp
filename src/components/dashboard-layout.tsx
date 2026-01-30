"use client";

import { Sidebar } from "@/components/sidebar";
import { usePhotos } from "@/hooks/usePhotos";

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    // We can fetch global stats here or pass them down
    const { photos } = usePhotos();

    // Calculate categories from real photos (reusing logic for now)
    const categories = photos.reduce((acc: any[], photo) => {
        const category = photo.metadata?.category || "Sem Categoria";
        const existing = acc.find((c: any) => c.name === category);
        if (existing) {
            existing.count++;
        } else {
            acc.push({ name: category, count: 1 });
        }
        return acc;
    }, []);

    return (
        <div className="h-screen flex" style={{ backgroundColor: '#F7F7F7', fontFamily: 'Inter, sans-serif' }}>
            <Sidebar categories={categories} photoCount={photos.length} />
            <main className="flex-1 flex flex-col overflow-hidden max-w-full">
                {children}
            </main>
        </div>
    );
}
