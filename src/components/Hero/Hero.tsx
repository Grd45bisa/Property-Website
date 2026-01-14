import React from 'react';
import OptimizedImage from '../OptimizedImage';
import './Hero.css';

const Hero: React.FC = () => {
    return (
        <header className="hero" role="banner">
            {/* Optimized Background Image */}
            <div className="hero__bg-wrapper">
                <OptimizedImage
                    baseName="hero-new"
                    alt="Interior properti mewah dengan virtual tour"
                    className="hero__bg-image"
                    width={1920}
                    height={1080}
                    priority={true}
                />
            </div>

            {/* Overlay */}
            <div className="hero__overlay" aria-hidden="true"></div>

            {/* Container */}
            <div className="hero__container">
                <div className="hero__content">
                    {/* Badge */}
                    <div className="hero__badge">
                        <span className="hero__badge-dot" aria-hidden="true"></span>
                        <span className="hero__badge-text">Virtual Tour 360° Profesional</span>
                    </div>

                    {/* Title */}
                    <h1 className="hero__title">
                        JUAL PROPERTI
                        <br />
                        <span className="hero__title-highlight"> 5X LEBIH CEPAT</span>
                        <span className="hero__title-sub">dengan Virtual Tour Imersif</span>
                    </h1>

                    {/* Description */}
                    <p className="hero__description">
                        Biarkan calon pembeli 'berjalan-jalan' di properti Anda 24/7
                        sebelum survei lokasi. Filter pembeli serius, hemat waktu Anda.
                    </p>

                    {/* CTA Buttons */}
                    <div className="hero__actions">
                        <a href="/demo" className="hero__button hero__button--primary">
                            <span className="material-icons hero__button-icon" aria-hidden="true">
                                play_circle
                            </span>
                            Lihat Demo
                        </a>
                        <a href="#pricing" className="hero__button hero__button--secondary">
                            Cek Paket Harga
                            <span className="material-icons" aria-hidden="true">arrow_forward</span>
                        </a>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Hero;
