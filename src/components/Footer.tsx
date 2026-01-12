import React from 'react';

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();
    const whatsappNumber = '6281234567890';
    const whatsappMessage = encodeURIComponent('Halo, saya tertarik dengan layanan virtual tour properti');

    return (
        <>
            {/* Footer Section */}
            <footer className="bg-gray-800 text-white py-12 relative overflow-hidden">
                {/* Decorative Blob */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-primary rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />

                <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
                    <h2 className="text-xl md:text-2xl font-medium mb-8 text-gray-200">
                        Siap membuat listing Anda terjual lebih cepat? Konsultasi gratis.
                    </h2>
                    <a
                        href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-primary hover:bg-primary-dark text-white text-base md:text-lg px-8 py-4 rounded-lg font-bold shadow-2xl hover:shadow-green-500/30 transition transform hover:-translate-y-1 inline-flex items-center gap-3 w-full sm:w-auto justify-center"
                    >
                        <span className="material-icons">chat</span>
                        CHAT KAMI SEKARANG
                    </a>
                    <p className="mt-8 text-sm text-gray-500">
                        © {currentYear} Ruang360. All rights reserved.
                    </p>
                </div>
            </footer>

            {/* WhatsApp Floating Button */}
            <div className="fixed bottom-6 right-6 z-50">
                <a
                    href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-primary hover:bg-primary-dark text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 animate-pulse-green"
                    aria-label="Chat via WhatsApp"
                >
                    <span className="material-icons text-3xl">chat</span>
                </a>
            </div>
        </>
    );
};

export default Footer;
