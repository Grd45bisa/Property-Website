import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Portfolio.css';

interface PortfolioItem {
    id: number;
    title: string;
    type: 'rumah' | 'apartemen' | 'villa' | 'komersial';
    typeLabel: string;
    location: string;
    image: string;
    featured?: boolean;
}

const Portfolio: React.FC = () => {
    const [activeFilter, setActiveFilter] = useState<string>('semua');

    const filters = ['Semua', 'Rumah', 'Apartemen', 'Villa/Hotel'];

    const portfolioItems: PortfolioItem[] = [
        {
            id: 1,
            title: 'Luxury Villa Canggu',
            type: 'villa',
            typeLabel: 'Villa',
            location: 'Canggu, Bali',
            image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            featured: true,
        },
        {
            id: 2,
            title: 'Jakarta Apartment',
            type: 'apartemen',
            typeLabel: 'Apartment',
            location: 'Sudirman, Jakarta',
            image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        },
        {
            id: 3,
            title: 'Modern House BSD',
            type: 'rumah',
            typeLabel: 'House',
            location: 'BSD, Tangerang',
            image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        },
        {
            id: 4,
            title: 'Bali Retreat Villa',
            type: 'villa',
            typeLabel: 'Villa',
            location: 'Ubud, Bali',
            image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        },
        {
            id: 5,
            title: 'Boutique Cafe',
            type: 'komersial',
            typeLabel: 'Commercial',
            location: 'Kemang, Jakarta',
            image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        },
    ];

    const filteredItems = activeFilter === 'semua'
        ? portfolioItems
        : portfolioItems.filter(item => {
            if (activeFilter === 'villa/hotel') return item.type === 'villa';
            return item.type === activeFilter;
        });

    // Get type badge color class
    const getTypeBadgeClass = (type: string): string => {
        switch (type) {
            case 'villa': return 'portfolio__type-badge--villa';
            case 'apartemen': return 'portfolio__type-badge--apartment';
            case 'rumah': return 'portfolio__type-badge--house';
            case 'komersial': return 'portfolio__type-badge--commercial';
            default: return '';
        }
    };

    return (
        <section id="portfolio" className="portfolio" aria-labelledby="portfolio-title">
            <div className="portfolio__container">
                {/* Header */}
                <header className="portfolio__header">
                    <span className="portfolio__label">Portfolio</span>
                    <h2 id="portfolio-title" className="portfolio__title">
                        Contoh Hasil Karya Kami
                    </h2>
                    <p className="portfolio__description">
                        Lihat bagaimana virtual tour kami membantu agen properti menjual lebih cepat
                    </p>
                </header>

                {/* Filters */}
                <div className="portfolio__filters" role="tablist" aria-label="Filter kategori portfolio">
                    {filters.map((filter) => {
                        const filterKey = filter.toLowerCase();
                        const isActive = activeFilter === filterKey;
                        return (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filterKey)}
                                className={`portfolio__filter ${isActive ? 'portfolio__filter--active' : ''}`}
                                role="tab"
                                aria-selected={isActive}
                                aria-controls="portfolio-grid"
                            >
                                {filter}
                            </button>
                        );
                    })}
                </div>

                {/* Grid */}
                <div id="portfolio-grid" className="portfolio__grid" role="tabpanel">
                    {filteredItems.map((item) => (
                        <article
                            key={item.id}
                            className={`portfolio__card ${item.featured ? 'portfolio__card--featured' : ''}`}
                        >
                            <div className="portfolio__image-wrapper">
                                <img
                                    src={item.image}
                                    alt={`Virtual tour ${item.title}`}
                                    className="portfolio__image"
                                    loading="lazy"
                                    decoding="async"
                                />
                                <div className="portfolio__overlay" aria-hidden="true"></div>

                                {/* Location Badge - Top Left */}
                                <div className="portfolio__location-badge">
                                    <span className="material-icons portfolio__location-icon" aria-hidden="true">
                                        place
                                    </span>
                                    <span className="portfolio__location-text">{item.location}</span>
                                </div>

                                {/* Type Badge - Top Right */}
                                <div className={`portfolio__type-badge ${getTypeBadgeClass(item.type)}`}>
                                    {item.typeLabel}
                                </div>
                            </div>

                            <div className="portfolio__content">
                                <h3 className="portfolio__card-title">{item.title}</h3>
                            </div>
                        </article>
                    ))}
                </div>

                {/* View All */}
                <div className="portfolio__view-all">
                    <Link to="/portfolio" className="portfolio__button" aria-label="Lihat semua proyek">
                        Lihat Semua Proyek
                        <span className="material-icons portfolio__button-icon" aria-hidden="true">
                            east
                        </span>
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default Portfolio;
