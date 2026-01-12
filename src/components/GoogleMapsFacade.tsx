import React, { useState, useCallback } from 'react';

interface GoogleMapsFacadeProps {
    lat: number;
    lng: number;
    zoom?: number;
    placeName?: string;
    aspectRatio?: string;
}

/**
 * GoogleMapsFacade - Lightweight facade for Google Maps embeds
 * Shows static map image until clicked, then loads full interactive map
 * This improves Core Web Vitals by avoiding heavy third-party load on page load
 */
const GoogleMapsFacade: React.FC<GoogleMapsFacadeProps> = ({
    lat,
    lng,
    zoom = 15,
    placeName = 'View Location',
    aspectRatio = '16/9',
}) => {
    const [isLoaded, setIsLoaded] = useState(false);

    // Static map thumbnail (no API key needed for this URL pattern)
    const staticMapUrl = `https://maps.google.com/maps?q=${lat},${lng}&z=${zoom}&output=embed`;

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
                    src={staticMapUrl}
                    title={placeName}
                    width="100%"
                    height="100%"
                    style={{ border: 'none' }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                />
            </div>
        );
    }

    return (
        <div
            className="maps-facade"
            style={{
                aspectRatio,
                width: '100%',
                position: 'relative',
                cursor: 'pointer',
                backgroundColor: '#e5e5e5',
                borderRadius: 'var(--radius-xl, 12px)',
                overflow: 'hidden',
            }}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            role="button"
            tabIndex={0}
            aria-label={`Open map: ${placeName}`}
        >
            {/* Placeholder gradient */}
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                }}
            >
                <span
                    className="material-icons"
                    style={{ fontSize: '48px', color: '#4CAF50' }}
                >
                    place
                </span>
                <span style={{ color: '#333', fontWeight: 500 }}>
                    Klik untuk memuat peta
                </span>
            </div>
        </div>
    );
};

export default GoogleMapsFacade;
