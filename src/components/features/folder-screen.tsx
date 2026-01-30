import { toast } from "sonner"; // Assuming sonner is installed as per layout.tsx

// ...

export function FolderScreen({ parentId = null }: FolderScreenProps) {
    const { folders, loading, error, createFolder } = useFolders(parentId);
    // ...
    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) return;
        setIsCreating(true);
        try {
            await createFolder(newFolderName);
            setIsCreateModalOpen(false);
            setNewFolderName("");
            toast.success("Pasta criada com sucesso!");
        } catch (e: any) {
            console.error(e);
            toast.error("Erro ao criar pasta: " + (e.message || "Erro desconhecido"));
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="flex flex-col h-full">
            <header className="border-b p-6 flex items-center justify-between gap-4" style={{ backgroundColor: 'white', borderColor: '#E0C7A0' }}>
                {/* ... header content ... */}
            </header>

            {/* Content - Native Scroll */}
            <div className="flex-1 overflow-y-auto p-6">
                {/* ... content ... */}
                {loading ? (
                    // ...
                ): folders.length === 0 ? (
                // ...
                ) : (
                    // ... folders grid ...
                 )}

                <div className="mt-8 border-t pt-8">
                    <PhotoBrowser
                        folderId={parentId}
                        hideHeader={false}
                        title="Arquivos nesta pasta"
                        scrollable={false}
                    />
                </div>
            </div>

            {/* Dialog ... */}
        </div>
    );
}
