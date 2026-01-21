// Photo entity with AI metadata
export interface Photo {
    id: string;
    created_at: string;
    user_id: string;
    storage_url: string;
    file_path: string;  // Path in storage bucket for signed URL generation
    file_name: string;
    metadata: AIMetadata | null;
    embedding: number[] | null;
}

// AI generated metadata structure
export interface AIMetadata {
    category: string;
    tags: string[];
    description: string;
    colors?: string[];
    objects?: string[];
    confidence?: number;
}

// Upload progress state
export interface UploadProgress {
    file: File;
    progress: number;
    status: 'pending' | 'uploading' | 'processing' | 'complete' | 'error';
    error?: string;
}

// Navigation item for sidebar
export interface NavItem {
    id: string;
    label: string;
    icon: string;
    path: string;
    count?: number;
}

// Storage bucket info
export interface StorageInfo {
    used: number;
    total: number;
    unit: 'MB' | 'GB';
}

// Re-export briefing types (Casamentos, Fornecedores, Mídias)
export * from './briefing';

