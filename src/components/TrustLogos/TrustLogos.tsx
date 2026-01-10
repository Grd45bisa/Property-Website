import React from 'react';
import './TrustLogos.css';

interface Logo {
    name: string;
    imageUrl?: string;
}

const TrustLogos: React.FC = () => {
    const logos: Logo[] = [
        { name: 'rumah123' },
        { name: '99.co' },
        { name: 'OLX' },
    ];

    return (
        <section className="trust-logos" aria-label="Partner yang mempercayai kami">
            <div className="trust-logos__container">
                <p className="trust-logos__title">Dipercaya oleh agen properti terkemuka</p>
                <div className="trust-logos__list">
                    {logos.map((logo) => (
                        <div key={logo.name} className="trust-logos__item">
                            {logo.imageUrl ? (
                                <img
                                    src={logo.imageUrl}
                                    alt={`Logo ${logo.name}`}
                                    className="trust-logos__image"
                                    loading="lazy"
                                    decoding="async"
                                />
                            ) : (
                                <span className="trust-logos__text">{logo.name}</span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TrustLogos;
