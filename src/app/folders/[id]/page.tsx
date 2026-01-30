"use client";

import * as React from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { FolderScreen } from "@/components/features/folder-screen";

export default function FolderByIdPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = React.use(params);

    return (
        <DashboardLayout>
            <FolderScreen parentId={id} />
        </DashboardLayout>
    );
}
