import "@/styles/tailwind.css";
import "@/styles/fonts.css";
import "./globals.css";
import type { Metadata } from "next";

import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
    title: "Memora - Intelligent Asset Manager",
    description: "Memora App",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>
                {children}
                <Toaster />
            </body>
        </html>
    );
}
