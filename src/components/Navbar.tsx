import React, { useState } from 'react';

const Navbar: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center gap-2">
                        <span className="material-icons text-primary text-3xl">view_in_ar</span>
                        <span className="font-bold text-xl tracking-tight text-gray-900">Ruang360</span>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-8">
                        <a
                            href="#portfolio"
                            className="text-sm font-medium text-gray-600 hover:text-primary transition"
                        >
                            Portfolio
                        </a>
                        <a
                            href="#pricing"
                            className="text-sm font-medium text-gray-600 hover:text-primary transition"
                        >
                            Harga
                        </a>
                        <a
                            href="#process"
                            className="text-sm font-medium text-gray-600 hover:text-primary transition"
                        >
                            Cara Kerja
                        </a>
                        <a
                            href="https://wa.me/6281234567890"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-primary hover:bg-primary-dark text-white px-5 py-2 rounded-md text-sm font-bold transition shadow-lg flex items-center gap-2"
                        >
                            <span className="material-icons text-sm">chat</span>
                            Hubungi Kami
                        </a>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="text-gray-500 hover:text-gray-900 focus:outline-none p-2"
                            aria-label="Toggle menu"
                        >
                            <span className="material-icons text-2xl">
                                {isMenuOpen ? 'close' : 'menu'}
                            </span>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden pb-4 border-t border-gray-100">
                        <div className="flex flex-col space-y-3 pt-4">
                            <a
                                href="#portfolio"
                                onClick={() => setIsMenuOpen(false)}
                                className="text-sm font-medium text-gray-600 hover:text-primary transition px-2 py-2"
                            >
                                Portfolio
                            </a>
                            <a
                                href="#pricing"
                                onClick={() => setIsMenuOpen(false)}
                                className="text-sm font-medium text-gray-600 hover:text-primary transition px-2 py-2"
                            >
                                Harga
                            </a>
                            <a
                                href="#process"
                                onClick={() => setIsMenuOpen(false)}
                                className="text-sm font-medium text-gray-600 hover:text-primary transition px-2 py-2"
                            >
                                Cara Kerja
                            </a>
                            <a
                                href="https://wa.me/6281234567890"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-primary hover:bg-primary-dark text-white px-4 py-3 rounded-md text-sm font-bold transition shadow-lg flex items-center justify-center gap-2 mx-2"
                            >
                                <span className="material-icons text-sm">chat</span>
                                Hubungi Kami via WhatsApp
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
