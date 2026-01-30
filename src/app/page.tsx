"use client";

import { useState } from "react";
import { LandingPage } from "@/components/LandingPage";
import { DashboardLayout } from "@/components/dashboard-layout";
import { HomeScreen } from "@/components/features/home-screen";

export default function Home() {
    const [showApp, setShowApp] = useState(false);

    return (
        <div className="w-full min-h-screen">
            {showApp ? (
                <DashboardLayout>
                    <HomeScreen />
                </DashboardLayout>
            ) : (
                <LandingPage onGetStarted={() => setShowApp(true)} />
            )}
        </div>
    );
}
