import React, { useState } from 'react';
// Link removed as it is no longer used in standard view
import OptimizedImage from '../OptimizedImage';
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
            image: 'portfolio-1',
            featured: true,
        },
        {
            id: 2,
            title: 'Jakarta Apartment',
            type: 'apartemen',
            typeLabel: 'Apartment',
            location: 'Sudirman, Jakarta',
            image: 'portfolio-2',
        },
        {
            id: 3,
            title: 'Modern House BSD',
            type: 'rumah',
            typeLabel: 'House',
            location: 'BSD, Tangerang',
            image: 'portfolio-3',
        },
        {
            id: 4,
            title: 'Bali Retreat Villa',
            type: 'villa',
            typeLabel: 'Villa',
            location: 'Ubud, Bali',
            image: 'portfolio-4',
        },
        {
            id: 5,
            title: 'Boutique Cafe',
            type: 'komersial',
            typeLabel: 'Commercial',
            location: 'Kemang, Jakarta',
            image: 'portfolio-5',
        },
    ];

    const filteredItems = activeFilter === 'semua'
        ? portfolioItems
        : portfolioItems.filter(item => {
            if (activeFilter === 'villa/hotel') return item.type === 'villa';
            return item.type === activeFilter;
        });

    // Get type badge color class (Unused in new layout but keeping if needed later, or commenting out)
    /* 
    const getTypeBadgeClass = (type: string): string => {
        switch (type) {
            case 'villa': return 'portfolio__type-badge--villa';
            case 'apartemen': return 'portfolio__type-badge--apartment';
            case 'rumah': return 'portfolio__type-badge--house';
            case 'komersial': return 'portfolio__type-badge--commercial';
            default: return '';
        }
    };
    */

    return (
        <section id="portfolio" className="portfolio" aria-labelledby="portfolio-title">
            <div className="portfolio__container">
                {/* Header */}
                <div className="portfolio__header-group">
                    <h2 className="portfolio__title">Contoh Hasil Karya Kami</h2>
                </div>

                {/* Filters */}
                <div className="portfolio__filters">
                    {filters.map((filter) => {
                        const filterKey = filter.toLowerCase();
                        const isActive = activeFilter === filterKey;
                        return (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filterKey)}
                                className={`portfolio__filter ${isActive ? 'portfolio__filter--active' : ''}`}
                            >
                                {filter}
                            </button>
                        );
                    })}
                </div>

                {/* Grid */}
                <div className="portfolio__grid">
                    {filteredItems.map((item, index) => {
                        // Logic to mimic the user's specific layout (First item span 2, Second item tall, others short)
                        // ONLY applies when showing "Semua" (id 1,2,3,4,5).
                        // For simplicity in filtered views, we might default to standard grid, but let's try to preserve the "First is big" rule if it's the featured one.

                        // User snippet logic translation:
                        // Item 1: md:col-span-2, h-64 md:h-80
                        // Item 2: h-64 md:h-80
                        // Item 3,4,5: h-48

                        let cardClass = "portfolio__card group";
                        // Using index to recreate the strict layout from snippet
                        if (index === 0) {
                            cardClass += " portfolio__card--large"; // Span 2, Tall
                        } else if (index === 1) {
                            cardClass += " portfolio__card--tall"; // Span 1, Tall
                        } else {
                            cardClass += " portfolio__card--short"; // Span 1, Short
                        }

                        return (
                            <article key={item.id} className={cardClass}>
                                <OptimizedImage
                                    baseName={item.image}
                                    alt={item.title}
                                    className="portfolio__image transform group-hover:scale-105 transition duration-500"
                                    width={index === 0 ? 800 : 400}
                                    height={index < 2 ? 600 : 300}
                                />
                                <div className="portfolio__overlay"></div>

                                <div className="portfolio__content">
                                    {/* Show Title on larger cards or all cards? Snippet shows title on 1, 2, 5. 3 and 4 only have 'Lihat Tour'.
                                        I will consistently show titles for better UX, or follow snippet exactly? 
                                        Snippet: Item 3 (Modern House) and 4 (Bali Retreat) have NO title, only play button.
                                        I will show Title for all to be safe, or just follow design? 
                                        Let's show text-sm for all. */}

                                    {(index === 0 || index === 1 || index === 4) && (
                                        <h3 className={`font-bold text-white ${index === 0 ? 'text-lg' : 'text-sm'}`}>{item.title}</h3>
                                    )}

                                    <div className="portfolio__meta flex items-center text-white/80 text-xs mt-1 gap-1">
                                        <span className="material-icons text-sm">play_arrow</span> Lihat Tour
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>

                {/* View More Button */}
                <div className="portfolio__cta">
                    <a href="/portfolio" className="portfolio__cta-button">
                        Lihat Selengkapnya
                        <span className="material-icons">arrow_forward</span>
                    </a>
                </div>
            </div>
        </section>
    );
};

export default Portfolio;
