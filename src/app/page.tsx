"use client";

import { useState } from "react";
import { LandingPage } from "@/components/LandingPage";
import { AppUI } from "@/components/AppUI";

export default function Home() {
    const [showApp, setShowApp] = useState(false);

    return (
        <div className="w-full min-h-screen">
            {showApp ? (
                <AppUI />
            ) : (
                <LandingPage onGetStarted={() => setShowApp(true)} />
            )}
        </div>
    );
}
