"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
import { FolderScreen } from "@/components/features/folder-screen";

export default function FolderByIdPage({ params }: { params: { id: string } }) {
    return (
        <DashboardLayout>
            <FolderScreen parentId={params.id} />
        </DashboardLayout>
    );
}
