import { useState, useRef, useCallback } from 'react';
import { Plus, Upload, X, Image, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useUpload } from '../../hooks/useUpload';
import type { UploadProgress } from '../../types';

interface UploadButtonProps {
    onUploadComplete?: () => void;
}

export function UploadButton({ onUploadComplete }: UploadButtonProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [previews, setPreviews] = useState<{ file: File; url: string }[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { uploadFiles, uploads, isUploading, clearCompleted } = useUpload();

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files).filter(
            file => file.type.startsWith('image/')
        );

        if (files.length > 0) {
            addPreviews(files);
        }
    }, []);

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            addPreviews(files);
        }
    }, []);

    const addPreviews = (files: File[]) => {
        const newPreviews = files.map(file => ({
            file,
            url: URL.createObjectURL(file)
        }));
        setPreviews(prev => [...prev, ...newPreviews]);
    };

    const removePreview = (index: number) => {
        setPreviews(prev => {
            const newPreviews = [...prev];
            URL.revokeObjectURL(newPreviews[index].url);
            newPreviews.splice(index, 1);
            return newPreviews;
        });
    };

    const handleUpload = async () => {
        if (previews.length === 0) return;

        const files = previews.map(p => p.file);
        await uploadFiles(files);

        // Clear previews after upload starts
        previews.forEach(p => URL.revokeObjectURL(p.url));
        setPreviews([]);

        // Notify parent when complete
        if (onUploadComplete) {
            onUploadComplete();
        }
    };

    const handleCloseModal = () => {
        if (!isUploading) {
            previews.forEach(p => URL.revokeObjectURL(p.url));
            setPreviews([]);
            clearCompleted();
            setIsModalOpen(false);
        }
    };

    const getStatusIcon = (status: UploadProgress['status']) => {
        switch (status) {
            case 'complete':
                return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'error':
                return <AlertCircle className="w-4 h-4 text-red-500" />;
            case 'uploading':
            case 'processing':
                return <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />;
            default:
                return <Image className="w-4 h-4 text-slate-400" />;
        }
    };

    const getStatusText = (status: UploadProgress['status']) => {
        switch (status) {
            case 'complete':
                return 'Concluído';
            case 'error':
                return 'Erro';
            case 'uploading':
                return 'Enviando...';
            case 'processing':
                return 'Processando IA...';
            default:
                return 'Aguardando';
        }
    };

    return (
        <>
            {/* Floating Action Button */}
            <button
                onClick={() => setIsModalOpen(true)}
                className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 hover:scale-110 transition-all duration-300 flex items-center justify-center z-50"
            >
                <Plus className="w-6 h-6" />
            </button>

            {/* Upload Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl fade-in">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-slate-100">
                            <div>
                                <h2 className="text-xl font-semibold text-slate-800">Upload de Fotos</h2>
                                <p className="text-sm text-slate-500">As imagens serão processadas pela IA automaticamente</p>
                            </div>
                            <button
                                onClick={handleCloseModal}
                                disabled={isUploading}
                                className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 overflow-y-auto max-h-[60vh]">
                            {/* Drop Zone */}
                            <div
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                                className={`upload-zone rounded-2xl p-8 text-center cursor-pointer ${isDragging ? 'dragging' : ''}`}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                                <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-4">
                                    <Upload className="w-8 h-8 text-indigo-500" />
                                </div>
                                <p className="text-slate-700 font-medium mb-1">
                                    Arraste suas fotos aqui
                                </p>
                                <p className="text-sm text-slate-500">
                                    ou clique para selecionar
                                </p>
                            </div>

                            {/* Previews */}
                            {previews.length > 0 && (
                                <div className="mt-6">
                                    <h3 className="text-sm font-medium text-slate-700 mb-3">
                                        Fotos selecionadas ({previews.length})
                                    </h3>
                                    <div className="grid grid-cols-4 gap-3">
                                        {previews.map((preview, index) => (
                                            <div key={index} className="relative aspect-square rounded-xl overflow-hidden group">
                                                <img
                                                    src={preview.url}
                                                    alt={preview.file.name}
                                                    className="w-full h-full object-cover"
                                                />
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        removePreview(index);
                                                    }}
                                                    className="absolute top-1 right-1 p-1 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Upload Progress */}
                            {uploads.length > 0 && (
                                <div className="mt-6">
                                    <h3 className="text-sm font-medium text-slate-700 mb-3">
                                        Progresso do Upload
                                    </h3>
                                    <div className="space-y-2">
                                        {uploads.map((upload, index) => (
                                            <div key={index} className="bg-slate-50 rounded-xl p-3">
                                                <div className="flex items-center gap-3">
                                                    {getStatusIcon(upload.status)}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-slate-700 truncate">
                                                            {upload.file.name}
                                                        </p>
                                                        <p className="text-xs text-slate-500">
                                                            {getStatusText(upload.status)}
                                                            {upload.error && ` - ${upload.error}`}
                                                        </p>
                                                    </div>
                                                    <span className="text-sm font-medium text-slate-600">
                                                        {upload.progress}%
                                                    </span>
                                                </div>
                                                <div className="mt-2 w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-300 ${upload.status === 'error' ? 'bg-red-500' :
                                                                upload.status === 'complete' ? 'bg-green-500' :
                                                                    'bg-indigo-500'
                                                            }`}
                                                        style={{ width: `${upload.progress}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-100 bg-slate-50">
                            <button
                                onClick={handleCloseModal}
                                disabled={isUploading}
                                className="px-5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-200 transition-colors disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleUpload}
                                disabled={previews.length === 0 || isUploading}
                                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium hover:shadow-lg hover:shadow-indigo-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isUploading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Processando...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-4 h-4" />
                                        Fazer Upload
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
