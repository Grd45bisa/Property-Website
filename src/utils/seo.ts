// SEO Utility Functions

export interface SEOData {
    title: string;
    description: string;
    keywords?: string[];
    image?: string;
    url?: string;
    type?: 'website' | 'article';
}

/**
 * Generate meta tags for SEO
 */
export const generateMetaTags = (data: SEOData): Record<string, string> => {
    const baseUrl = 'https://ruang360.com';
    const defaultImage = `${baseUrl}/og-image.jpg`;

    return {
        title: data.title,
        description: data.description,
        keywords: data.keywords?.join(', ') || '',
        // Open Graph
        'og:title': data.title,
        'og:description': data.description,
        'og:image': data.image || defaultImage,
        'og:url': data.url || baseUrl,
        'og:type': data.type || 'website',
        'og:site_name': 'Ruang360',
        // Twitter
        'twitter:card': 'summary_large_image',
        'twitter:title': data.title,
        'twitter:description': data.description,
        'twitter:image': data.image || defaultImage,
    };
};

/**
 * Schema.org LocalBusiness markup
 */
export const generateLocalBusinessSchema = () => ({
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Ruang360',
    description: 'Jasa virtual tour 360° profesional untuk properti di Indonesia',
    image: 'https://ruang360.com/og-image.jpg',
    url: 'https://ruang360.com',
    telephone: '+6281234567890',
    address: {
        '@type': 'PostalAddress',
        addressLocality: 'Jakarta',
        addressCountry: 'ID',
    },
    priceRange: 'Rp 750.000 - Rp 3.500.000',
    openingHours: 'Mo-Fr 09:00-18:00',
    sameAs: [
        'https://instagram.com/ruang360.id',
        'https://facebook.com/ruang360.id',
    ],
});

/**
 * Schema.org Service markup
 */
export const generateServiceSchema = () => ({
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Virtual Tour 360° Properti',
    provider: {
        '@type': 'LocalBusiness',
        name: 'Ruang360',
    },
    description: 'Layanan pembuatan virtual tour 360° untuk properti. Tingkatkan penjualan properti Anda dengan pengalaman imersif.',
    areaServed: {
        '@type': 'Country',
        name: 'Indonesia',
    },
    hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Paket Virtual Tour',
        itemListElement: [
            {
                '@type': 'Offer',
                itemOffered: {
                    '@type': 'Service',
                    name: 'Paket LITE',
                    description: 'Virtual tour 360° basic untuk properti max 100m²',
                },
                price: '750000',
                priceCurrency: 'IDR',
            },
            {
                '@type': 'Offer',
                itemOffered: {
                    '@type': 'Service',
                    name: 'Paket PRO',
                    description: 'Virtual tour 360° premium dengan hotspots untuk properti max 250m²',
                },
                price: '1500000',
                priceCurrency: 'IDR',
            },
            {
                '@type': 'Offer',
                itemOffered: {
                    '@type': 'Service',
                    name: 'Paket ENTERPRISE',
                    description: 'Virtual tour 360° lengkap dengan drone footage untuk properti unlimited',
                },
                price: '3500000',
                priceCurrency: 'IDR',
            },
        ],
    },
});

/**
 * Schema.org Article markup for blog posts
 */
export const generateArticleSchema = (article: {
    title: string;
    description: string;
    image: string;
    datePublished: string;
    author: string;
    url: string;
}) => ({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    image: article.image,
    datePublished: article.datePublished,
    author: {
        '@type': 'Person',
        name: article.author,
    },
    publisher: {
        '@type': 'Organization',
        name: 'Ruang360',
        logo: {
            '@type': 'ImageObject',
            url: 'https://ruang360.com/logo.png',
        },
    },
    mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': article.url,
    },
});

/**
 * Target keywords for SEO
 */
export const targetKeywords = [
    'jasa virtual tour Indonesia',
    'virtual tour properti Jakarta',
    '360 virtual tour rumah',
    'fotografi properti profesional',
    'virtual tour apartemen',
    'virtual tour villa Bali',
    'jasa foto 360 properti',
    'virtual tour real estate',
];
