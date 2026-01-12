import React from 'react';

interface OptimizedImageProps {
    baseName: string;
    alt: string;
    className?: string;
    width?: number | string;
    height?: number | string;
    priority?: boolean;
    style?: React.CSSProperties;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
    baseName,
    alt,
    className,
    width,
    height,
    priority = false,
    style
}) => {
    // Simple static mapping based on user request to use existing public files
    let src = '';

    if (baseName === 'hero-new') {
        src = '/Hero/photo_hero.avif';
    } else if (baseName.startsWith('portfolio-')) {
        // Map portfolio-1 to photo1.avif, etc.
        const id = baseName.split('-')[1];
        src = `/portofolio/photo${id}.avif`;
    } else {
        // Fallback or generic path if needed
        src = `/images/${baseName}.jpg`;
    }

    return (
        <img
            src={src}
            alt={alt}
            className={className}
            width={width}
            height={height}
            loading={priority ? "eager" : "lazy"}
            decoding={priority ? "async" : "async"}
            {...(priority ? { fetchPriority: "high" } : {})}
            style={style}
        />
    );
};

export default OptimizedImage;
