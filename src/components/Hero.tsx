import React from 'react';

const Hero: React.FC = () => {
    return (
        <header className="relative hero-bg min-h-[500px] sm:min-h-[550px] md:min-h-[600px] lg:min-h-[650px] flex items-center">
            {/* Gradient overlay - Bottom to Top (mobile) & Left to Right (desktop) */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-black/0 to-transparent md:bg-gradient-to-r md:from-black/20 md:via-black/10 md:to-black/0"></div>

            {/* Container - Centered on mobile, Left on desktop */}
            <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
                <div className="max-w-xl lg:max-w-2xl text-white text-center md:text-left mx-auto md:mx-0">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 mb-4 sm:mb-6">
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                        <span className="text-xs font-medium text-white">Virtual Tour 360° Profesional</span>
                    </div>

                    {/* Headline */}
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight mb-3 sm:mb-4 md:mb-6 leading-tight">
                        JUAL PROPERTI<br />
                        <span className="text-primary">5X LEBIH CEPAT</span><br />
                        <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white/90">dengan Virtual Tour Imersif</span>
                    </h1>

                    {/* Description */}
                    <p className="text-sm sm:text-base md:text-lg mb-5 sm:mb-6 md:mb-8 text-white/90 leading-relaxed max-w-md mx-auto md:mx-0 md:max-w-lg">
                        Biarkan calon pembeli 'berjalan-jalan' di properti Anda 24/7 sebelum survei lokasi.
                        Filter pembeli serius, hemat waktu Anda.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center md:justify-start">
                        <a
                            href="#portfolio"
                            className="bg-white text-gray-900 hover:bg-gray-100 px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-3.5 rounded-lg font-bold transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-2 text-sm sm:text-base"
                        >
                            <span className="material-icons text-primary text-lg sm:text-xl">play_circle</span>
                            Lihat Demo
                        </a>
                        <a
                            href="#pricing"
                            className="bg-white/15 backdrop-blur-sm border border-white/30 text-white hover:bg-white/25 px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-3.5 rounded-lg font-bold transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
                        >
                            Cek Paket Harga
                            <span className="material-icons text-lg">arrow_forward</span>
                        </a>
                    </div>

                    {/* Stats */}
                    <div className="mt-6 sm:mt-8 md:mt-10 flex gap-4 sm:gap-6 md:gap-8 justify-center md:justify-start">
                        <div>
                            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white">50+</div>
                            <div className="text-[10px] sm:text-xs md:text-sm text-white/70">Properti</div>
                        </div>
                        <div className="w-px bg-white/30"></div>
                        <div>
                            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white">100+</div>
                            <div className="text-[10px] sm:text-xs md:text-sm text-white/70">Klien Puas</div>
                        </div>
                        <div className="w-px bg-white/30"></div>
                        <div>
                            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white">5x</div>
                            <div className="text-[10px] sm:text-xs md:text-sm text-white/70">Lebih Cepat</div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Hero;
