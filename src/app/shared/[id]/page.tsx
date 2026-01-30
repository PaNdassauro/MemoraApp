"use client"

import { use } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { FolderScreen } from "@/components/features/folder-screen"

interface SharedPageProps {
    params: Promise<{ id: string }>
}

export default function SharedPage({ params }: SharedPageProps) {
    const { id } = use(params)

    return (
        <DashboardLayout>
            <FolderScreen parentId={null} ownerId={id} />
        </DashboardLayout>
    )
}
