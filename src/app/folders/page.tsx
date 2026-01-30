"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
import { FolderScreen } from "@/components/features/folder-screen";

export default function FoldersPage() {
    return (
        <DashboardLayout>
            <FolderScreen />
        </DashboardLayout>
    );
}
