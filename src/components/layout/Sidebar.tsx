import {
    Images,
    FolderHeart,
    Star,
    Trash2,
    Settings,
    HardDrive,
    Sparkles
} from 'lucide-react';

interface SidebarProps {
    currentView: string;
    onViewChange: (view: string) => void;
}

const navItems = [
    { id: 'all', label: 'Todas as Fotos', icon: Images },
    { id: 'albums', label: 'Álbuns', icon: FolderHeart },
    { id: 'favorites', label: 'Favoritos', icon: Star },
    { id: 'trash', label: 'Lixeira', icon: Trash2 },
];

export function Sidebar({ currentView, onViewChange }: SidebarProps) {
    return (
        <aside className="w-64 h-screen glass-dark fixed left-0 top-0 flex flex-col">
            {/* Logo */}
            <div className="p-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                        <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white tracking-tight">Memora</h1>
                        <p className="text-xs text-slate-400">Intelligent Assets</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentView === item.id;

                    return (
                        <button
                            key={item.id}
                            onClick={() => onViewChange(item.id)}
                            className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left
                transition-all duration-200 group
                ${isActive
                                    ? 'bg-white/10 text-white'
                                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                                }
              `}
                        >
                            <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-400' : 'group-hover:text-indigo-400'}`} />
                            <span className="font-medium">{item.label}</span>
                        </button>
                    );
                })}
            </nav>

            {/* Storage Info */}
            <div className="p-4 border-t border-white/10">
                <div className="bg-white/5 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-slate-400 mb-3">
                        <HardDrive className="w-4 h-4" />
                        <span className="text-sm font-medium">Armazenamento</span>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                            style={{ width: '35%' }}
                        />
                    </div>
                    <p className="text-xs text-slate-500 mt-2">3.5 GB de 10 GB usados</p>
                </div>
            </div>

            {/* Settings */}
            <div className="p-4 border-t border-white/10">
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-all duration-200">
                    <Settings className="w-5 h-5" />
                    <span className="font-medium">Configurações</span>
                </button>
            </div>
        </aside>
    );
}
