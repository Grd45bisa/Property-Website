import React from 'react';

interface PricingFeature {
    text: string;
    included: boolean;
}

interface PricingTier {
    name: string;
    price: string;
    priceNote: string;
    description: string;
    features: PricingFeature[];
    bonuses?: string[];
    popular?: boolean;
    ctaText: string;
}

const Pricing: React.FC = () => {
    const whatsappNumber = '6281234567890';

    const tiers: PricingTier[] = [
        {
            name: 'LITE',
            price: 'Rp 750.000',
            priceNote: '/properti',
            description: 'Cocok untuk properti kecil dan first-timer',
            features: [
                { text: '1 properti (max 100m²)', included: true },
                { text: '10-15 foto berkualitas tinggi', included: true },
                { text: 'Virtual tour 360° basic', included: true },
                { text: 'Hosting 1 tahun', included: true },
                { text: 'Revisi 1x', included: true },
                { text: 'Delivery 3-5 hari', included: true },
                { text: 'Floor plan', included: false },
                { text: 'Video highlight', included: false },
            ],
            ctaText: 'Pilih LITE',
        },
        {
            name: 'PRO',
            price: 'Rp 1.500.000',
            priceNote: '/properti',
            description: 'Best value untuk agen profesional',
            popular: true,
            features: [
                { text: '1 properti (max 250m²)', included: true },
                { text: '20-30 foto 120MP', included: true },
                { text: 'Virtual tour 360° premium + hotspots', included: true },
                { text: 'Floor plan 2D', included: true },
                { text: 'Hosting 2 tahun', included: true },
                { text: 'Revisi 3x', included: true },
                { text: 'Delivery 2-3 hari', included: true },
            ],
            bonuses: ['Video highlight 30 detik'],
            ctaText: 'Pilih PRO',
        },
        {
            name: 'ENTERPRISE',
            price: 'Rp 3.500.000',
            priceNote: '/properti',
            description: 'Solusi lengkap untuk properti premium',
            features: [
                { text: '1 properti (unlimited size)', included: true },
                { text: '40+ foto 120MP', included: true },
                { text: 'Virtual tour 360° + interactive hotspots', included: true },
                { text: 'Floor plan 2D & 3D', included: true },
                { text: 'Drone footage', included: true },
                { text: 'Hosting 3 tahun', included: true },
                { text: 'Revisi unlimited', included: true },
                { text: 'Delivery 1-2 hari', included: true },
            ],
            bonuses: ['Video cinematic 1 menit', 'Social media content pack'],
            ctaText: 'Pilih ENTERPRISE',
        },
    ];

    const handleWhatsApp = (tierName: string) => {
        const message = encodeURIComponent(`Halo, saya tertarik dengan paket ${tierName} untuk virtual tour properti.`);
        window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
    };

    return (
        <section id="pricing" className="py-12 sm:py-16 md:py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-10 sm:mb-12">
                    <span className="inline-block text-primary text-xs font-bold uppercase tracking-widest mb-2">
                        Harga
                    </span>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                        Pilih Paket yang Sesuai
                    </h2>
                    <p className="text-gray-500 text-sm sm:text-base max-w-2xl mx-auto">
                        Investasi kecil untuk hasil maksimal. Semua paket termasuk shooting profesional di lokasi.
                    </p>
                </div>

                {/* Pricing Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                    {tiers.map((tier) => (
                        <div
                            key={tier.name}
                            className={`
                                relative bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl
                                ${tier.popular
                                    ? 'ring-2 ring-primary scale-[1.02] md:scale-105'
                                    : 'hover:scale-[1.02]'
                                }
                            `}
                        >
                            {/* Popular Badge */}
                            {tier.popular && (
                                <div className="absolute top-0 right-0">
                                    <div className="bg-primary text-white text-[10px] sm:text-xs font-bold uppercase tracking-wide px-3 sm:px-4 py-1 sm:py-1.5 rounded-bl-xl shadow-lg">
                                        Paling Laris
                                    </div>
                                </div>
                            )}

                            {/* Card Header */}
                            <div className={`p-5 sm:p-6 ${tier.popular ? 'bg-primary/5' : ''}`}>
                                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
                                    {tier.name}
                                </h3>
                                <p className="text-xs sm:text-sm text-gray-500 mb-4">
                                    {tier.description}
                                </p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl sm:text-4xl font-extrabold text-gray-900">
                                        {tier.price}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                        {tier.priceNote}
                                    </span>
                                </div>
                            </div>

                            {/* Features */}
                            <div className="p-5 sm:p-6 pt-0 sm:pt-0">
                                <ul className="space-y-2.5 sm:space-y-3 mb-6">
                                    {tier.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-start gap-2.5 sm:gap-3">
                                            <span className={`material-icons text-base sm:text-lg mt-0.5 flex-shrink-0 ${feature.included ? 'text-primary' : 'text-gray-300'
                                                }`}>
                                                {feature.included ? 'check_circle' : 'cancel'}
                                            </span>
                                            <span className={`text-xs sm:text-sm ${feature.included ? 'text-gray-700' : 'text-gray-400 line-through'
                                                }`}>
                                                {feature.text}
                                            </span>
                                        </li>
                                    ))}
                                </ul>

                                {/* Bonuses */}
                                {tier.bonuses && tier.bonuses.length > 0 && (
                                    <div className="mb-6 p-3 bg-primary/5 rounded-lg border border-primary/20">
                                        <div className="text-[10px] sm:text-xs font-bold text-primary uppercase tracking-wide mb-2">
                                            🎁 Bonus
                                        </div>
                                        {tier.bonuses.map((bonus, idx) => (
                                            <div key={idx} className="flex items-center gap-2 text-xs sm:text-sm text-gray-700">
                                                <span className="material-icons text-primary text-sm">star</span>
                                                {bonus}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* CTA Button */}
                                <button
                                    onClick={() => handleWhatsApp(tier.name)}
                                    className={`
                                        w-full py-3 sm:py-3.5 rounded-xl font-bold text-sm sm:text-base transition-all duration-200 flex items-center justify-center gap-2
                                        ${tier.popular
                                            ? 'bg-primary hover:bg-primary-dark text-white shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40'
                                            : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                                        }
                                    `}
                                >
                                    <span className="material-icons text-lg">chat</span>
                                    {tier.ctaText}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom Note */}
                <div className="mt-10 sm:mt-12 text-center">
                    <p className="text-xs sm:text-sm text-gray-500 mb-4">
                        Butuh paket custom atau multiple properti? Hubungi kami untuk penawaran khusus.
                    </p>
                    <a
                        href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Halo, saya butuh penawaran custom untuk virtual tour.')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-primary hover:text-primary-dark font-semibold text-sm transition-colors"
                    >
                        <span className="material-icons text-lg">support_agent</span>
                        Konsultasi Gratis
                        <span className="material-icons text-sm">arrow_forward</span>
                    </a>
                </div>
            </div>
        </section>
    );
};

export default Pricing;
