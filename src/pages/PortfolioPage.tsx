import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from './../components/Navbar/Navbar';
import Footer from './../components/Footer/Footer';
import './PortfolioPage.css';

interface PortfolioItem {
    id: number;
    title: string;
    type: 'rumah' | 'apartemen' | 'villa' | 'komersial';
    typeLabel: string;
    location: string;
    image: string;
    featured?: boolean;
    date: string;
    views: string;
}

const PortfolioPage: React.FC = () => {
    const [activeFilter, setActiveFilter] = useState<string>('semua');

    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const filters = ['Semua', 'Rumah', 'Apartemen', 'Villa/Hotel', 'Komersial'];

    // Extended portfolio data
    const allPortfolioItems: PortfolioItem[] = [
        {
            id: 1,
            title: 'Luxury Villa Canggu',
            type: 'villa',
            typeLabel: 'Villa',
            location: 'Canggu, Bali',
            image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            date: 'Jan 2024',
            views: '2.5k'
        },
        {
            id: 2,
            title: 'Jakarta Apartment',
            type: 'apartemen',
            typeLabel: 'Apartment',
            location: 'Sudirman, Jakarta',
            image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            date: 'Dec 2023',
            views: '1.8k'
        },
        {
            id: 3,
            title: 'Modern House BSD',
            type: 'rumah',
            typeLabel: 'House',
            location: 'BSD, Tangerang',
            image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            date: 'Dec 2023',
            views: '3.2k'
        },
        {
            id: 4,
            title: 'Bali Retreat Villa',
            type: 'villa',
            typeLabel: 'Villa',
            location: 'Ubud, Bali',
            image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            date: 'Nov 2023',
            views: '1.5k'
        },
        {
            id: 5,
            title: 'Boutique Cafe',
            type: 'komersial',
            typeLabel: 'Commercial',
            location: 'Kemang, Jakarta',
            image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            date: 'Nov 2023',
            views: '4.1k'
        },
        {
            id: 6,
            title: 'Penthouse Menteng',
            type: 'apartemen',
            typeLabel: 'Apartment',
            location: 'Menteng, Jakarta',
            image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            date: 'Oct 2023',
            views: '2.9k'
        },
        {
            id: 7,
            title: 'Minimalist House',
            type: 'rumah',
            typeLabel: 'House',
            location: 'Pondok Indah, Jakarta',
            image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            date: 'Oct 2023',
            views: '2.1k'
        },
        {
            id: 8,
            title: 'Beachfront Villa',
            type: 'villa',
            typeLabel: 'Villa',
            location: 'Seminyak, Bali',
            image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            date: 'Sep 2023',
            views: '3.8k'
        },
        {
            id: 9,
            title: 'Co-Working Space',
            type: 'komersial',
            typeLabel: 'Commercial',
            location: 'Senopati, Jakarta',
            image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            date: 'Sep 2023',
            views: '5.2k'
        },
        {
            id: 10,
            title: 'Industrial Office',
            type: 'komersial',
            typeLabel: 'Commercial',
            location: 'Sudirman, Jakarta',
            image: 'https://images.unsplash.com/photo-1497215842964-222b430dc094?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            date: 'Aug 2023',
            views: '1.9k'
        },
        {
            id: 11,
            title: 'Garden Residence',
            type: 'rumah',
            typeLabel: 'House',
            location: 'Bogor, Jawa Barat',
            image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            date: 'Aug 2023',
            views: '1.4k'
        },
        {
            id: 12,
            title: 'Skyline Apartment',
            type: 'apartemen',
            typeLabel: 'Apartment',
            location: 'Surabaya, Jawa Timur',
            image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            date: 'Jul 2023',
            views: '2.7k'
        }
    ];

    const filteredItems = activeFilter === 'semua'
        ? allPortfolioItems
        : allPortfolioItems.filter(item => {
            if (activeFilter === 'villa/hotel') return item.type === 'villa';
            return item.type === activeFilter.toLowerCase();
        });



    return (
        <div className="page-wrapper">
            <Navbar />

            <main className="portfolio-page">
                {/* Header (Replaced with Hero Section) */}
                <section className="portfolio-hero">
                    <div className="portfolio-hero__content">
                        <h1 className="portfolio-hero__title">
                            Jelajahi Portofolio
                            <span className="portfolio-hero__title-highlight">Virtual Tour Kami</span>
                        </h1>
                        <p className="portfolio-hero__text">
                            Temukan beragam proyek virtual tour 360° yang telah kami wujudkan untuk berbagai industri. Lihat bagaimana kami mengubah ruang fisik menjadi pengalaman digital yang imersif.
                        </p>
                    </div>

                    <div className="portfolio-hero__preview">
                        <iframe
                            src="/tour/40469154-0b3c-4c82-b246-2283b80f74a3"
                            width="100%"
                            height="100%"
                            frameBorder="0"
                            allowFullScreen
                            allow="gyroscope; accelerometer; fullscreen"
                            title="Virtual Tour Preview"
                            style={{ border: 0, borderRadius: 'inherit' }}
                        ></iframe>
                    </div>
                </section>

                <div className="portfolio-page__container">
                    {/* Filters */}
                    <div className="portfolio-page__filters" role="tablist">
                        {filters.map((filter) => {
                            const filterKey = filter.toLowerCase();
                            const isActive = activeFilter === filterKey;
                            return (
                                <button
                                    key={filter}
                                    onClick={() => setActiveFilter(filterKey)}
                                    className={`portfolio-page__filter ${isActive ? 'portfolio-page__filter--active' : ''}`}
                                    role="tab"
                                    aria-selected={isActive}
                                >
                                    {filter}
                                </button>
                            );
                        })}
                    </div>

                    {/* Grid */}
                    <div className="portfolio-page__grid">
                        {filteredItems.map((item) => (
                            <Link to="/demo" key={item.id} className="portfolio-page__card">
                                <div className="portfolio-page__image-wrapper">
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        className="portfolio-page__image"
                                        loading="lazy"
                                    />
                                    <div className="portfolio-page__overlay"></div>

                                    <div className="portfolio-page__badges">
                                        <div className="portfolio-page__badge">
                                            <span className="material-icons portfolio-page__badge-icon">place</span>
                                            {item.location}
                                        </div>
                                        <div className="portfolio-page__badge" style={{ backgroundColor: 'rgba(34, 197, 94, 0.8)' }}>
                                            {item.typeLabel}
                                        </div>
                                    </div>
                                </div>

                                <div className="portfolio-page__content">
                                    <h3 className="portfolio-page__card-title">{item.title}</h3>
                                    <div className="portfolio-page__card-meta">
                                        <div className="portfolio-page__meta-item">
                                            <span className="material-icons portfolio-page__meta-icon">calendar_today</span>
                                            {item.date}
                                        </div>
                                        <div className="portfolio-page__meta-item">
                                            <span className="material-icons portfolio-page__meta-icon">visibility</span>
                                            {item.views} views
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* CTA */}
                    <div className="portfolio-page__cta">
                        <h2 className="portfolio-page__cta-title">Siap Membuat Virtual Tour Anda?</h2>
                        <p className="portfolio-page__cta-text">
                            Konsultasikan kebutuhan properti Anda sekarang dan dapatkan penawaran spesial untuk paket pertama.
                        </p>
                        <a
                            href={`https://wa.me/6281234567890?text=${encodeURIComponent('Halo, saya ingin konsultasi tentang pembuatan virtual tour.')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="portfolio-page__cta-button"
                        >
                            <span className="material-icons">chat</span>
                            Hubungi Kami
                        </a>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default PortfolioPage;
