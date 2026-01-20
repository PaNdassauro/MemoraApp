import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Folder, Search, Lock, ArrowRight, Star } from "lucide-react";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";

interface LandingPageProps {
    onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
    return (
        <div className="min-h-screen" style={{ fontFamily: 'Inter, sans-serif' }}>
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-[#E0C7A0] via-[#F7F7F7] to-[#E0C7A0] py-20 px-6 overflow-hidden">
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute top-10 left-10 w-64 h-64 bg-[#AF8B5F] rounded-full blur-3xl"></div>
                    <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#D35400] rounded-full blur-3xl"></div>
                </div>

                <div className="max-w-6xl mx-auto relative z-10">
                    {/* Logo */}
                    <div className="flex items-center gap-2 mb-12">
                        <div className="w-10 h-10 bg-[#AF8B5F] rounded-lg flex items-center justify-center">
                            <Folder className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-2xl" style={{ fontFamily: 'Poppins, sans-serif', color: '#2C3E50' }}>
                            Memora
                        </h1>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-5xl mb-6" style={{
                                fontFamily: 'Poppins, sans-serif',
                                fontWeight: 700,
                                color: '#2C3E50',
                                lineHeight: '1.2'
                            }}>
                                Memora: Seu Bibliotecário de Memórias
                            </h2>
                            <p className="text-xl mb-4" style={{ color: '#7F8C8D', lineHeight: '1.6' }}>
                                Finalmente, suas fotos organizadas pela IA.
                            </p>
                            <p className="text-lg mb-8" style={{ color: '#7F8C8D', lineHeight: '1.6' }}>
                                Liberte suas memórias do caos digital. O Memora as organiza, categoriza e torna-as instantaneamente pesquisáveis.
                            </p>
                            <Button
                                onClick={onGetStarted}
                                className="text-lg px-8 py-6"
                                style={{ backgroundColor: '#AF8B5F', color: 'white' }}
                            >
                                Começar Agora
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </div>

                        <div className="relative">
                            <div className="rounded-2xl overflow-hidden shadow-2xl border-4" style={{ borderColor: '#AF8B5F' }}>
                                <ImageWithFallback
                                    src="https://images.unsplash.com/photo-1627353802139-9820d31b6a7c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxub3N0YWxnaWMlMjBwaG90byUyMGFsYnVtJTIwbWVtb3JpZXN8ZW58MXx8fHwxNzY4OTE2OTg1fDA&ixlib=rb-4.1.0&q=80&w=1080"
                                    alt="Organized Photo Memories"
                                    className="w-full h-96 object-cover"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 px-6 bg-[#F7F7F7]">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-4xl text-center mb-16" style={{
                        fontFamily: 'Poppins, sans-serif',
                        fontWeight: 600,
                        color: '#2C3E50'
                    }}>
                        Recursos Inteligentes
                    </h2>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <Card className="p-8 bg-white hover:shadow-lg transition-shadow" style={{ borderColor: '#E0C7A0' }}>
                            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: '#E0C7A0' }}>
                                <Folder className="w-8 h-8" style={{ color: '#AF8B5F' }} />
                            </div>
                            <h3 className="text-2xl mb-4" style={{
                                fontFamily: 'Poppins, sans-serif',
                                fontWeight: 600,
                                color: '#2C3E50'
                            }}>
                                Organização Inteligente
                            </h3>
                            <p style={{ color: '#7F8C8D', lineHeight: '1.6' }}>
                                A IA do Memora categoriza cada foto automaticamente, criando uma biblioteca intuitiva e organizada sem nenhum esforço.
                            </p>
                        </Card>

                        {/* Feature 2 */}
                        <Card className="p-8 bg-white hover:shadow-lg transition-shadow" style={{ borderColor: '#E0C7A0' }}>
                            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: '#E0C7A0' }}>
                                <Search className="w-8 h-8" style={{ color: '#AF8B5F' }} />
                            </div>
                            <h3 className="text-2xl mb-4" style={{
                                fontFamily: 'Poppins, sans-serif',
                                fontWeight: 600,
                                color: '#2C3E50'
                            }}>
                                Busca Semântica
                            </h3>
                            <p style={{ color: '#7F8C8D', lineHeight: '1.6' }}>
                                Encontre qualquer memória digitando o que você sente ou lembra, não apenas palavras-chave. A IA entende o contexto.
                            </p>
                        </Card>

                        {/* Feature 3 */}
                        <Card className="p-8 bg-white hover:shadow-lg transition-shadow" style={{ borderColor: '#E0C7A0' }}>
                            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: '#E0C7A0' }}>
                                <Lock className="w-8 h-8" style={{ color: '#AF8B5F' }} />
                            </div>
                            <h3 className="text-2xl mb-4" style={{
                                fontFamily: 'Poppins, sans-serif',
                                fontWeight: 600,
                                color: '#2C3E50'
                            }}>
                                Privacidade e Segurança
                            </h3>
                            <p style={{ color: '#7F8C8D', lineHeight: '1.6' }}>
                                Suas memórias são suas. Armazenadas com segurança máxima e acessíveis apenas por você, sempre.
                            </p>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-20 px-6" style={{ backgroundColor: '#E0C7A0' }}>
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-4xl text-center mb-16" style={{
                        fontFamily: 'Poppins, sans-serif',
                        fontWeight: 600,
                        color: '#2C3E50'
                    }}>
                        O Que Nossos Usuários Dizem
                    </h2>

                    <div className="grid md:grid-cols-2 gap-8">
                        <Card className="p-8 bg-white">
                            <div className="flex gap-1 mb-4">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="w-5 h-5 fill-current" style={{ color: '#D35400' }} />
                                ))}
                            </div>
                            <p className="mb-4 text-lg" style={{ color: '#2C3E50', lineHeight: '1.6' }}>
                                "Finalmente encontrei uma forma de organizar minhas 10 mil fotos! O Memora fez em minutos o que eu levaria meses para fazer."
                            </p>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full" style={{ backgroundColor: '#AF8B5F' }}></div>
                                <div>
                                    <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, color: '#2C3E50' }}>
                                        Maria Silva
                                    </p>
                                    <p className="text-sm" style={{ color: '#7F8C8D' }}>Fotógrafa</p>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-8 bg-white">
                            <div className="flex gap-1 mb-4">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="w-5 h-5 fill-current" style={{ color: '#D35400' }} />
                                ))}
                            </div>
                            <p className="mb-4 text-lg" style={{ color: '#2C3E50', lineHeight: '1.6' }}>
                                "A busca semântica é incrível! Consigo encontrar fotos específicas só descrevendo o que lembro. Mudou completamente minha relação com minhas memórias."
                            </p>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full" style={{ backgroundColor: '#AF8B5F' }}></div>
                                <div>
                                    <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, color: '#2C3E50' }}>
                                        João Santos
                                    </p>
                                    <p className="text-sm" style={{ color: '#7F8C8D' }}>Designer</p>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Final CTA Section */}
            <section className="py-20 px-6 bg-gradient-to-r from-[#AF8B5F] to-[#D35400]">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl mb-6" style={{
                        fontFamily: 'Poppins, sans-serif',
                        fontWeight: 700,
                        color: 'white'
                    }}>
                        Transforme seu álbum de fotos hoje
                    </h2>
                    <p className="text-xl mb-8" style={{ color: '#F7F7F7', lineHeight: '1.6' }}>
                        Junte-se a milhares de usuários que já organizaram suas memórias com o Memora.
                    </p>
                    <Button
                        onClick={onGetStarted}
                        className="text-lg px-10 py-6"
                        style={{ backgroundColor: 'white', color: '#AF8B5F' }}
                    >
                        Começar Gratuitamente
                        <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-6" style={{ backgroundColor: '#2C3E50' }}>
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-4 gap-8 mb-8">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 bg-[#AF8B5F] rounded-lg flex items-center justify-center">
                                    <Folder className="w-5 h-5 text-white" />
                                </div>
                                <h3 style={{ fontFamily: 'Poppins, sans-serif', color: 'white' }}>
                                    Memora
                                </h3>
                            </div>
                            <p className="text-sm" style={{ color: '#E0C7A0' }}>
                                Seu bibliotecário inteligente de memórias
                            </p>
                        </div>

                        <div>
                            <h4 className="mb-4" style={{ fontFamily: 'Poppins, sans-serif', color: 'white' }}>
                                Produto
                            </h4>
                            <ul className="space-y-2">
                                <li><a href="#" className="text-sm hover:underline" style={{ color: '#E0C7A0' }}>Recursos</a></li>
                                <li><a href="#" className="text-sm hover:underline" style={{ color: '#E0C7A0' }}>Preços</a></li>
                                <li><a href="#" className="text-sm hover:underline" style={{ color: '#E0C7A0' }}>FAQ</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="mb-4" style={{ fontFamily: 'Poppins, sans-serif', color: 'white' }}>
                                Empresa
                            </h4>
                            <ul className="space-y-2">
                                <li><a href="#" className="text-sm hover:underline" style={{ color: '#E0C7A0' }}>Sobre</a></li>
                                <li><a href="#" className="text-sm hover:underline" style={{ color: '#E0C7A0' }}>Blog</a></li>
                                <li><a href="#" className="text-sm hover:underline" style={{ color: '#E0C7A0' }}>Contato</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="mb-4" style={{ fontFamily: 'Poppins, sans-serif', color: 'white' }}>
                                Legal
                            </h4>
                            <ul className="space-y-2">
                                <li><a href="#" className="text-sm hover:underline" style={{ color: '#E0C7A0' }}>Termos de Uso</a></li>
                                <li><a href="#" className="text-sm hover:underline" style={{ color: '#E0C7A0' }}>Privacidade</a></li>
                                <li><a href="#" className="text-sm hover:underline" style={{ color: '#E0C7A0' }}>Cookies</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t pt-8" style={{ borderColor: '#7F8C8D' }}>
                        <p className="text-center text-sm" style={{ color: '#E0C7A0' }}>
                            © 2026 Memora. Todos os direitos reservados.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
