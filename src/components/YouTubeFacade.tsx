import React, { useState, useCallback } from 'react';

interface YouTubeFacadeProps {
    videoId: string;
    title?: string;
    thumbnail?: 'default' | 'hqdefault' | 'maxresdefault';
    aspectRatio?: string;
}

/**
 * YouTubeFacade - Lightweight facade for YouTube embeds
 * Loads actual YouTube iframe only when user clicks
 * This improves Core Web Vitals by avoiding heavy third-party load on page load
 */
const YouTubeFacade: React.FC<YouTubeFacadeProps> = ({
    videoId,
    title = 'Play Video',
    thumbnail = 'hqdefault',
    aspectRatio = '16/9',
}) => {
    const [isLoaded, setIsLoaded] = useState(false);

    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/${thumbnail}.jpg`;
    const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`;

    const handleClick = useCallback(() => {
        setIsLoaded(true);
    }, []);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsLoaded(true);
        }
    }, []);

    if (isLoaded) {
        return (
            <div style={{ aspectRatio, width: '100%' }}>
                <iframe
                    src={embedUrl}
                    title={title}
                    width="100%"
                    height="100%"
                    style={{ border: 'none' }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                />
            </div>
        );
    }

    return (
        <div
            className="youtube-facade"
            style={{
                aspectRatio,
                width: '100%',
                position: 'relative',
                cursor: 'pointer',
                backgroundColor: '#000',
                borderRadius: 'var(--radius-xl, 12px)',
                overflow: 'hidden',
            }}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            role="button"
            tabIndex={0}
            aria-label={`Play video: ${title}`}
        >
            {/* Thumbnail */}
            <img
                src={thumbnailUrl}
                alt={title}
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                }}
                loading="lazy"
            />

            {/* Play Button Overlay */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(0, 0, 0, 0.3)',
                    transition: 'background 0.3s',
                }}
                className="youtube-facade__overlay"
            >
                <div
                    style={{
                        width: '68px',
                        height: '48px',
                        backgroundColor: '#ff0000',
                        borderRadius: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'transform 0.2s',
                    }}
                >
                    <svg
                        viewBox="0 0 24 24"
                        width="24"
                        height="24"
                        fill="#fff"
                    >
                        <path d="M8 5v14l11-7z" />
                    </svg>
                </div>
            </div>
        </div>
    );
};

export default YouTubeFacade;
