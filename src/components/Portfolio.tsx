import React, { useState } from 'react';

interface PortfolioItem {
    id: number;
    title: string;
    type: 'rumah' | 'apartemen' | 'villa';
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
            image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            featured: true,
        },
        {
            id: 2,
            title: 'Jakarta Apartment',
            type: 'apartemen',
            image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        },
        {
            id: 3,
            title: 'Modern House BSD',
            type: 'rumah',
            image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        },
        {
            id: 4,
            title: 'Bali Retreat Villa',
            type: 'villa',
            image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        },
        {
            id: 5,
            title: 'Sudirman Apartment',
            type: 'apartemen',
            image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        },
    ];

    const filteredItems = activeFilter === 'semua'
        ? portfolioItems
        : portfolioItems.filter(item => {
            if (activeFilter === 'villa/hotel') return item.type === 'villa';
            return item.type === activeFilter;
        });

    return (
        <section id="portfolio" className="py-12 sm:py-16 md:py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-8 sm:mb-10">
                    <span className="inline-block text-primary text-xs font-bold uppercase tracking-widest mb-2">
                        Portfolio
                    </span>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
                        Contoh Hasil Karya Kami
                    </h2>
                    <p className="mt-3 text-gray-500 text-sm sm:text-base max-w-2xl mx-auto">
                        Lihat bagaimana virtual tour kami membantu agen properti menjual lebih cepat
                    </p>
                </div>

                {/* Filter Buttons - Horizontal scroll on mobile */}
                <div className="mb-6 sm:mb-8 -mx-4 px-4 sm:mx-0 sm:px-0">
                    <div className="flex sm:justify-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
                        {filters.map((filter) => {
                            const filterKey = filter.toLowerCase();
                            const isActive = activeFilter === filterKey;
                            return (
                                <button
                                    key={filter}
                                    onClick={() => setActiveFilter(filterKey)}
                                    className={`
                                        flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wide
                                        transition-all duration-200 
                                        ${isActive
                                            ? 'bg-primary text-white shadow-md shadow-primary/30'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }
                                    `}
                                >
                                    {filter}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Portfolio Grid - Better mobile layout */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
                    {filteredItems.map((item) => (
                        <div
                            key={item.id}
                            className={`
                                relative group overflow-hidden rounded-xl sm:rounded-2xl 
                                shadow-md hover:shadow-xl transition-shadow duration-300
                                ${item.featured ? 'sm:col-span-2' : ''}
                            `}
                        >
                            {/* Image */}
                            <div className="relative overflow-hidden">
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    loading="lazy"
                                    className={`
                                        w-full object-cover transform group-hover:scale-110 
                                        transition-transform duration-700 ease-out
                                        ${item.featured ? 'h-52 sm:h-64 lg:h-80' : 'h-48 sm:h-52 lg:h-56'}
                                    `}
                                />

                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                                {/* Play Button - Center */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition-transform duration-300">
                                        <span className="material-icons text-primary text-2xl sm:text-3xl ml-1">play_arrow</span>
                                    </div>
                                </div>
                            </div>

                            {/* Content Overlay - Bottom */}
                            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                                <div className="flex items-end justify-between">
                                    <div>
                                        <h3 className="text-white font-bold text-base sm:text-lg drop-shadow-md">
                                            {item.title}
                                        </h3>
                                        <div className="flex items-center gap-1 mt-1">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-white/20 backdrop-blur-sm text-white/90 capitalize">
                                                {item.type}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Arrow Icon */}
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                                        <span className="material-icons text-white text-lg sm:text-xl">arrow_forward</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* View All Button */}
                <div className="mt-8 sm:mt-10 text-center">
                    <button className="inline-flex items-center gap-2 px-6 py-3 rounded-full border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:border-primary hover:text-primary transition-colors duration-200">
                        Lihat Semua Proyek
                        <span className="material-icons text-lg">east</span>
                    </button>
                </div>
            </div>

            {/* Custom scrollbar hide */}
            <style>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </section>
    );
};

export default Portfolio;
