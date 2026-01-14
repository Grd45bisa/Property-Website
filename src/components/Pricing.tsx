import React from 'react';
import './Pricing.css'; // Import the new CSS file

interface PricingFeature {
    text: string;
    included: boolean;
}

interface PricingTier {
    name: string;
    price: string;
    originalPrice?: string;
    priceNote?: string;
    description?: string;
    features: PricingFeature[];
    bonuses?: string[];
    popular?: boolean;
    buttonText?: string; // Optional, since some might not have it
    showButton?: boolean;
}

const WhatsAppIcon = () => (
    <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
    >
        <path d="M24 0v24H0V0z" fill="none" />
        <path d="M12.593 23.258l-.011.002-.071.035-.02.004-.014-.004-.071-.035q-.016-.005-.024.005l-.004.01-.017.428.005.02.01.013.104.074.015.004.012-.004.104-.074.012-.016.004-.017-.017-.427q-.004-.016-.017-.018m.265-.113-.013.002-.185.093-.01.01-.003.011.018.43.005.012.008.007.201.093q.019.005.029-.008l.004-.014-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014-.034.614q.001.018.017.024l.015-.002.201-.093.01-.008.004-.011.017-.43-.003-.012-.01-.01z" opacity="0" />
        <path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10a9.96 9.96 0 0 1-4.863-1.26l-.305-.178-3.032.892a1.01 1.01 0 0 1-1.28-1.145l.026-.109.892-3.032A9.96 9.96 0 0 1 2 12C2 6.477 6.477 2 12 2m0 2a8 8 0 0 0-6.759 12.282c.198.312.283.696.216 1.077l-.039.163-.441 1.501 1.501-.441c.433-.128.883-.05 1.24.177A8 8 0 1 0 12 4M9.102 7.184a.7.7 0 0 1 .684.075c.504.368.904.862 1.248 1.344l.327.474.153.225a.71.71 0 0 1-.046.864l-.075.076-.924.686a.23.23 0 0 0-.067.291c.21.38.581.947 1.007 1.373.427.426 1.02.822 1.426 1.055.088.05.194.034.266-.031l.038-.045.601-.915a.71.71 0 0 1 .973-.158l.543.379c.54.385 1.059.799 1.47 1.324a.7.7 0 0 1 .089.703c-.396.924-1.399 1.711-2.441 1.673l-.159-.01-.191-.018-.108-.014-.238-.04c-.924-.174-2.405-.698-3.94-2.232-1.534-1.535-2.058-3.016-2.232-3.94l-.04-.238-.025-.208-.013-.175-.004-.075c-.038-1.044.753-2.047 1.678-2.443" />
    </svg>
);

const Pricing: React.FC = () => {
    const whatsappNumber = '6281234567890';

    const tiers: PricingTier[] = [
        {
            name: 'STARTER',
            originalPrice: 'Rp 1.500.000',
            price: 'Rp 899.000',
            features: [
                { text: 'Max 10 Titik (Spot)', included: true },
                { text: 'Resolusi 120MP Ultra HD', included: true },
                { text: 'Tombol WhatsApp', included: true },
                { text: 'Hosting Gratis 6 Bulan', included: true },
            ],
            showButton: false,
        },
        {
            name: 'PRO',
            originalPrice: 'Rp 3.000.000',
            price: 'Rp 1.999.000',
            popular: true,
            features: [
                { text: 'Max 20 Titik (Spot)', included: true },
                { text: 'Resolusi 120MP Ultra HD', included: true },
                { text: 'Tombol WhatsApp & Menu', included: true },
                { text: 'Upload Google Street View', included: true },
                { text: 'Hosting Gratis 1 Tahun', included: true },
                { text: 'Prioritas Editing', included: true },
            ],
            showButton: false,
        },
        {
            name: 'BUSINESS',
            price: 'Hubungi Kami',
            features: [
                { text: 'Unlimited Titik', included: true },
                { text: 'White Label (Tanpa Logo Kami)', included: true },
                { text: 'Custom Navigasi & Fitur', included: true },
                { text: 'Prioritas Support', included: true },
                { text: 'Hosting Gratis 1 Tahun', included: true },
                { text: 'Custom Domain', included: true },
            ],
            showButton: true,
            buttonText: 'Konsultasi via WA',
        },
    ];

    const handleWhatsApp = (tierName: string) => {
        const message = encodeURIComponent(`Halo, saya tertarik dengan paket ${tierName} untuk virtual tour properti.`);
        window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
    };

    return (
        <section id="pricing" className="pricing-section">
            {/* Background Decoration */}
            <div className="pricing-bg-decoration">
                <div className="pricing-blob-blue" />
                <div className="pricing-blob-green" />
            </div>

            <div className="pricing-container">
                {/* Section Header */}
                <div className="pricing-header">
                    <span className="pricing-badge">
                        Penawaran Spesial
                    </span>
                    <h2 className="pricing-title">
                        Investasi Terbaik untuk Properti Anda
                    </h2>
                    <p className="pricing-subtitle">
                        Tingkatkan nilai jual properti dengan visual 360° yang memukau.
                        Tanpa biaya tersembunyi, satu kali bayar.
                    </p>
                </div>

                {/* Pricing Cards */}
                <div className="pricing-grid">
                    {tiers.map((tier) => (
                        <div
                            key={tier.name}
                            className={`pricing-card ${tier.popular ? 'pricing-card--popular' : 'pricing-card--default'}`}
                        >
                            {tier.popular && (
                                <div className="pricing-popular-badge-wrapper">
                                    <span className="pricing-popular-badge">
                                        <span className="material-icons" style={{ fontSize: '14px' }}>local_fire_department</span>
                                        Paling Laris
                                    </span>
                                </div>
                            )}

                            {/* Card Header */}
                            <div className="pricing-card-header">
                                <h3 className={`pricing-tier-name ${tier.popular ? 'pricing-tier-name--highlight' : ''}`}>
                                    {tier.name}
                                </h3>

                                {tier.originalPrice && (
                                    <div className="pricing-original-price">
                                        {tier.originalPrice}
                                    </div>
                                )}

                                <div className={`pricing-price ${tier.name === 'BUSINESS' ? 'pricing-price--text' : 'pricing-price--large'}`}>
                                    {tier.price}
                                </div>
                            </div>

                            {/* Features */}
                            <div className="pricing-features-container">
                                <ul className="pricing-features-list">
                                    {tier.features.map((feature, idx) => (
                                        <li key={idx} className="pricing-feature-item">
                                            <div className={`pricing-check-icon ${tier.popular ? 'pricing-check-icon--active' : 'pricing-check-icon--inactive'}`}>
                                                <span className="material-icons" style={{ fontSize: '12px', fontWeight: 'bold' }}>check</span>
                                            </div>
                                            <span className="pricing-feature-text">
                                                {feature.text}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Button */}
                            {tier.showButton ? (
                                <button
                                    onClick={() => handleWhatsApp(tier.name)}
                                    className="pricing-button"
                                >
                                    <WhatsAppIcon />
                                    {tier.buttonText}
                                </button>
                            ) : (
                                <div className="pricing-slot-text">
                                    Slot Terbatas
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Pricing;
