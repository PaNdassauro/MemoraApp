"use client";

import { PhotoBrowser } from "./photo-browser";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HomeScreen() {
    return (
        <div className="flex flex-col h-full">
            {/* Header - We can keep a minimal header here if we want Profile/Global Search, 
                or just let PhotoBrowser handle its own header.
                PhotoBrowser has a nice header with Search/Upload.
                The previous HomeScreen had a Profile icon.
                Let's reuse PhotoBrowser but maybe wrap it if we want the Profile icon? 
                Actually PhotoBrowser header is good.
                
                But wait, PhotoBrowser header doesn't have Profile.
                Let's render a wrapper header or modify PhotoBrowser.
                For now, let's keep it simple.
            */}
            <header className="border-b p-4 flex items-center justify-between bg-white" style={{ borderColor: '#E0C7A0' }}>
                <h1 className="text-xl font-medium text-[#2C3E50]">Início</h1>
                <Button variant="ghost" className="rounded-full p-2">
                    <User className="w-6 h-6" style={{ color: '#7F8C8D' }} />
                </Button>
            </header>

            <div className="flex-1 overflow-hidden">
                {/* folderId={null} means 'root' in strict mode, but usePhotos(undefined) means ALL. 
                    PhotoBrowser pass folderId to usePhotos.
                    If we pass undefined (no prop), usePhotos gets undefined -> fetches ALL.
                    Perfect for Home.
                */}
                <PhotoBrowser title="Todas as Fotos" />
            </div>
        </div>
    );
}
