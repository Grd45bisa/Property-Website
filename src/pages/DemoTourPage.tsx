import React, { useEffect, useRef, useState } from 'react';
import './DemoTourPage.css';

// Declare pannellum on window
declare global {
    interface Window {
        pannellum: any;
    }
}

interface Room {
    id: string;
    name: string;
    image: string;
    hotSpots: HotSpot[];
}

interface HotSpot {
    pitch: number;
    yaw: number;
    type: 'info' | 'scene';
    text: string;
    targetRoomId?: string;
    icon?: 'arrow' | 'door' | 'info'; // Default: arrow for scene, info for info
}

const DemoTourPage: React.FC = () => {
    const viewerRef = useRef<HTMLDivElement>(null);
    const pannellumInstance = useRef<any>(null);

    const [currentRoomId, setCurrentRoomId] = useState('living-room');
    const [isLoading, setIsLoading] = useState(true);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [activeInfoCard, setActiveInfoCard] = useState<string | null>(null);
    const [isRoomSelectorOpen, setIsRoomSelectorOpen] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);
    const [isGyroEnabled, setIsGyroEnabled] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const isGyroEnabledRef = useRef(false);

    const whatsappNumber = '6281234567890';
    const propertyTitle = 'Luxury Villa Canggu - 4BR';

    // Sample rooms data
    const rooms: Room[] = [
        {
            id: 'living-room',
            name: 'Living Room',
            image: 'https://pannellum.org/images/alma.jpg',
            hotSpots: [
                { pitch: -5, yaw: 120, type: 'info', text: 'Lantai Marmer Italia Premium', icon: 'info' },
                { pitch: 10, yaw: -30, type: 'info', text: 'AC 2 PK Daikin Inverter', icon: 'info' },
                { pitch: -15, yaw: 180, type: 'scene', text: 'Ke Dapur', targetRoomId: 'kitchen', icon: 'door' },
            ],
        },
        {
            id: 'kitchen',
            name: 'Kitchen',
            image: 'https://pannellum.org/images/cerro-toco-0.jpg',
            hotSpots: [
                { pitch: 0, yaw: 90, type: 'info', text: 'Kitchen Set Full Granit', icon: 'info' },
                { pitch: -10, yaw: -90, type: 'info', text: 'Kompor Tanam 4 Tungku', icon: 'info' },
                { pitch: -5, yaw: 0, type: 'scene', text: 'Ke Living Room', targetRoomId: 'living-room', icon: 'arrow' },
                { pitch: -5, yaw: 180, type: 'scene', text: 'Ke Master Bedroom', targetRoomId: 'master-bedroom', icon: 'door' },
            ],
        },
        {
            id: 'master-bedroom',
            name: 'Master Bedroom',
            image: 'https://pannellum.org/images/bma-1.jpg',
            hotSpots: [
                { pitch: 5, yaw: 60, type: 'info', text: 'Walk-in Closet 6m²', icon: 'info' },
                { pitch: -10, yaw: -60, type: 'info', text: 'King Size Bed Frame', icon: 'info' },
                { pitch: 0, yaw: 150, type: 'scene', text: 'Ke Kitchen', targetRoomId: 'kitchen', icon: 'arrow' },
                { pitch: 0, yaw: -150, type: 'scene', text: 'Ke Bathroom', targetRoomId: 'bathroom', icon: 'door' },
            ],
        },
        {
            id: 'bathroom',
            name: 'Bathroom',
            image: 'https://pannellum.org/images/jfk.jpg',
            hotSpots: [
                { pitch: -20, yaw: 45, type: 'info', text: 'Bathtub Jacuzzi', icon: 'info' },
                { pitch: 0, yaw: -90, type: 'info', text: 'Rain Shower Grohe', icon: 'info' },
                { pitch: 5, yaw: 180, type: 'scene', text: 'Ke Master Bedroom', targetRoomId: 'master-bedroom', icon: 'arrow' },
            ],
        },
    ];

    const currentRoom = rooms.find(r => r.id === currentRoomId) || rooms[0];



    // Detect Mobile
    useEffect(() => {
        const checkMobile = () => {
            const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
            if (/android/i.test(userAgent)) {
                setIsMobile(true);
                return;
            }
            if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
                setIsMobile(true);
                return;
            }
            setIsMobile(false);
        };
        checkMobile();
    }, []);

    useEffect(() => {
        const initViewer = () => {
            if (!viewerRef.current || !window.pannellum) return;

            if (pannellumInstance.current) {
                pannellumInstance.current.destroy();
            }

            // Always start with transition active when room changes
            // But we handle initial load differently below

            const hotSpots = currentRoom.hotSpots.map(hs => ({
                pitch: hs.pitch,
                yaw: hs.yaw,
                type: 'custom',
                cssClass: hs.type === 'scene' ? 'custom-hotspot custom-hotspot--scene' : 'custom-hotspot custom-hotspot--info',
                createTooltipFunc: (hotSpotDiv: HTMLElement) => {
                    const icon = document.createElement('span');
                    icon.className = 'material-icons hotspot-icon';

                    // Icon mapping based on icon type
                    const iconType = hs.icon || (hs.type === 'scene' ? 'arrow' : 'info');
                    switch (iconType) {
                        case 'door':
                            icon.textContent = 'meeting_room'; // Door icon
                            break;
                        case 'arrow':
                            icon.textContent = 'north'; // Arrow up (like 3DVista)
                            break;
                        case 'info':
                        default:
                            icon.textContent = 'info';
                            break;
                    }

                    // All icons white for clean look - handled by CSS class .hotspot-icon
                    icon.style.fontSize = hs.type === 'scene' ? '24px' : '22px';
                    hotSpotDiv.appendChild(icon);

                    const tooltip = document.createElement('div');
                    tooltip.className = 'hotspot-tooltip';
                    tooltip.textContent = hs.text;
                    hotSpotDiv.appendChild(tooltip);
                },
                clickHandlerFunc: () => {
                    if (hs.type === 'scene' && hs.targetRoomId) {
                        // Start transition effect: zoom in/fade out
                        setIsTransitioning(true);

                        // Small delay to allow fade/zoom effect to start before destroying viewer
                        setTimeout(() => {
                            setCurrentRoomId(hs.targetRoomId!);
                            setActiveInfoCard(null);
                        }, 400);
                    } else if (hs.type === 'info') {
                        setActiveInfoCard(activeInfoCard === hs.text ? null : hs.text);
                    }
                },
            }));

            pannellumInstance.current = window.pannellum.viewer(viewerRef.current, {
                type: 'equirectangular',
                panorama: currentRoom.image,
                autoLoad: true,
                showControls: false,
                showFullscreenCtrl: false,
                showZoomCtrl: false,
                mouseZoom: true,
                draggable: true,
                friction: 0.15,
                hfov: 100, // Initial FOV
                minHfov: 50,
                maxHfov: 120,
                pitch: 0,
                yaw: 0,
                hotSpots: hotSpots,
                preview: isLoading ? undefined : currentRoom.image // Optimize preview if possible
            });

            pannellumInstance.current.on('load', () => {
                // Scene loaded: Fade in
                setIsLoading(false);
                setIsTransitioning(false);

                // Disable right-click context menu on viewer
                if (viewerRef.current) {
                    viewerRef.current.addEventListener('contextmenu', (e) => {
                        e.preventDefault();
                    });
                }

                // Persist Gyro state if enabled
                if (isGyroEnabledRef.current && pannellumInstance.current) {
                    pannellumInstance.current.startOrientation();
                }
            });

            // On error
            pannellumInstance.current.on('error', () => {
                setIsLoading(false);
                setIsTransitioning(false);
            });
        };

        if (!window.pannellum) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css';
            document.head.appendChild(link);

            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js';
            script.async = true;
            script.onload = initViewer;
            document.body.appendChild(script);
        } else {
            initViewer();
        }

        return () => {
            if (pannellumInstance.current) {
                pannellumInstance.current.destroy();
            }
        };
    }, [currentRoomId]);

    // Smooth zoom effects
    const handleZoomIn = () => {
        if (pannellumInstance.current) {
            const currentHfov = pannellumInstance.current.getHfov();
            pannellumInstance.current.setHfov(Math.max(currentHfov - 20, 50), 1000); // 1000ms smooth zoom
        }
    };

    const handleZoomOut = () => {
        if (pannellumInstance.current) {
            const currentHfov = pannellumInstance.current.getHfov();
            pannellumInstance.current.setHfov(Math.min(currentHfov + 20, 120), 1000);
        }
    };

    const handleFullscreen = () => {
        setIsMaximized(!isMaximized);
        // Optional: Trigger resize if necessary
        setTimeout(() => {
            if (pannellumInstance.current) {
                pannellumInstance.current.resize();
            }
        }, 300);
    };

    const handleGyroToggle = () => {
        if (!pannellumInstance.current) return;

        if (!isGyroEnabled) {
            // Enabling Gyro
            if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
                // iOS 13+ requires permission
                (DeviceOrientationEvent as any).requestPermission()
                    .then((permissionState: string) => {
                        if (permissionState === 'granted') {
                            pannellumInstance.current.startOrientation();
                            setIsGyroEnabled(true);
                            isGyroEnabledRef.current = true;
                        }
                    })
                    .catch(console.error);
            } else {
                // Non-iOS or older devices
                pannellumInstance.current.startOrientation();
                setIsGyroEnabled(true);
                isGyroEnabledRef.current = true;
            }
        } else {
            // Disabling Gyro
            pannellumInstance.current.stopOrientation();
            setIsGyroEnabled(false);
            isGyroEnabledRef.current = false;
        }
    };

    const handlePrevRoom = () => {
        const currentIndex = rooms.findIndex(r => r.id === currentRoomId);
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : rooms.length - 1;
        setIsTransitioning(true);
        setTimeout(() => setCurrentRoomId(rooms[prevIndex].id), 400);
    };

    const handleNextRoom = () => {
        const currentIndex = rooms.findIndex(r => r.id === currentRoomId);
        const nextIndex = currentIndex < rooms.length - 1 ? currentIndex + 1 : 0;
        setIsTransitioning(true);
        setTimeout(() => setCurrentRoomId(rooms[nextIndex].id), 400);
    };

    return (
        <div className={`demo-page ${isMaximized ? 'demo-page--maximized' : ''}`}>
            {/* Viewer */}
            <div
                ref={viewerRef}
                className={`demo-page__viewer ${isTransitioning ? 'demo-page__viewer--zooming' : ''}`}
                style={{
                    transition: 'transform 0.6s cubic-bezier(0.2, 0, 0.2, 1), opacity 0.4s ease',
                    transform: isTransitioning ? 'scale(1.4)' : 'scale(1)',
                    opacity: isTransitioning ? 0 : 1
                }}
                onTouchEnd={() => {
                    if (isGyroEnabledRef.current && pannellumInstance.current) {
                        pannellumInstance.current.startOrientation();
                    }
                }}
            />

            {/* Transition/Loading Overlay - Cinematic Black Fade */}
            <div className={`demo-page__transition-overlay ${(isLoading || isTransitioning) ? 'demo-page__transition-overlay--active' : ''}`} />

            {/* Info Card Popup */}
            {activeInfoCard && (
                <div className="info-card" onClick={() => setActiveInfoCard(null)}>
                    <div className="info-card__content" onClick={(e) => e.stopPropagation()}>
                        <button
                            className="info-card__close"
                            onClick={() => setActiveInfoCard(null)}
                            aria-label="Tutup"
                        >
                            <span className="material-icons">close</span>
                        </button>
                        <div className="info-card__icon">
                            <span className="material-icons">info</span>
                        </div>
                        <h3 className="info-card__title">Detail Informasi</h3>
                        <p className="info-card__text">{activeInfoCard}</p>
                    </div>
                </div>
            )}

            {/* Logo */}
            <div className="demo-page__logo">
                <div className="demo-page__logo-inner">
                    <span className="material-icons demo-page__logo-icon">view_in_ar</span>
                    <span className="demo-page__logo-text">Client Name</span>
                </div>
            </div>

            {/* Title */}
            <div className="demo-page__title">
                <div className="demo-page__title-inner">
                    <h1 className="demo-page__title-text">{propertyTitle}</h1>
                    <p className="demo-page__title-room">{currentRoom.name}</p>
                </div>
            </div>

            {/* Navigation Arrows */}
            <button onClick={handlePrevRoom} className="demo-page__nav-arrow demo-page__nav-arrow--left" aria-label="Previous room">
                <span className="material-icons demo-page__nav-arrow-icon">chevron_left</span>
            </button>
            <button onClick={handleNextRoom} className="demo-page__nav-arrow demo-page__nav-arrow--right" aria-label="Next room">
                <span className="material-icons demo-page__nav-arrow-icon">chevron_right</span>
            </button>

            {/* Controls */}
            <div className="demo-page__controls">
                <button onClick={handleZoomIn} className="demo-page__control-btn" aria-label="Zoom in">
                    <span className="material-icons demo-page__control-icon">add</span>
                </button>
                <button onClick={handleZoomOut} className="demo-page__control-btn" aria-label="Zoom out">
                    <span className="material-icons demo-page__control-icon">remove</span>
                </button>
            </div>

            {/* Gyro Button - Stacked above Fullscreen - Mobile Only */}
            {isMobile && (
                <button
                    onClick={handleGyroToggle}
                    className={`demo-page__gyro-btn demo-page__gyro-btn--stacked ${isGyroEnabled ? 'active' : ''}`}
                    aria-label={isGyroEnabled ? "Turn off Gyroscope" : "Turn on Gyroscope"}
                >
                    <span className="material-icons demo-page__control-icon">screen_rotation</span>
                </button>
            )}

            {/* Fullscreen Button - Separate */}
            <button
                onClick={handleFullscreen}
                className="demo-page__fullscreen-btn"
                aria-label={isMaximized ? "Exit Fullscreen" : "Fullscreen"}
            >
                <span className="material-icons demo-page__control-icon">
                    {isMaximized ? 'fullscreen_exit' : 'fullscreen'}
                </span>
            </button>

            {/* WhatsApp Button */}
            <a
                href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Halo, saya tertarik dengan properti "${propertyTitle}"`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="demo-page__whatsapp"
            >
                <span className="material-icons demo-page__whatsapp-icon">chat</span>
                <span className="demo-page__whatsapp-text">Tanya Agen Ini</span>
            </a>

            {/* Back Button */}


            {/* Room Selector - Collapsible */}
            <div className={`demo-page__room-selector ${isRoomSelectorOpen ? 'demo-page__room-selector--open' : ''}`}>
                {/* Toggle Button - Shows current room */}
                <button
                    className="demo-page__room-toggle"
                    onClick={() => setIsRoomSelectorOpen(!isRoomSelectorOpen)}
                >
                    <span className="demo-page__room-toggle-label">
                        <span className="material-icons">meeting_room</span>
                        {currentRoom.name}
                    </span>
                    <span className={`material-icons demo-page__room-toggle-arrow ${isRoomSelectorOpen ? 'rotated' : ''}`}>
                        expand_less
                    </span>
                </button>

                {/* Room List - Collapsible */}
                <div className={`demo-page__room-list ${isRoomSelectorOpen ? 'demo-page__room-list--open' : ''}`}>
                    {rooms.map((room) => (
                        <button
                            key={room.id}
                            onClick={() => {
                                setCurrentRoomId(room.id);
                                setIsRoomSelectorOpen(false);
                            }}
                            className={`demo-page__room-btn ${currentRoomId === room.id ? 'demo-page__room-btn--active' : ''}`}
                        >
                            <span className="material-icons demo-page__room-btn-icon">
                                {room.id === currentRoomId ? 'radio_button_checked' : 'radio_button_unchecked'}
                            </span>
                            {room.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Hotspot Styles */}
            <style>{`
                /* Hide Pannellum about message */
                .pnlm-about-msg {
                    display: none !important;
                }
                
                /* Override Pannellum default hotspot transitions - NO DELAY */
                .pnlm-hotspot-base {
                    transition: none !important;
                }
                .pnlm-pointer {
                    transition: none !important;
                }
                .pnlm-hotspot {
                    transition: none !important;
                }
                
                .custom-hotspot {
                    width: 44px;
                    height: 44px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: transform 0.15s ease;
                }
                .custom-hotspot:hover { transform: scale(1.15); }
                .custom-hotspot--info {
                    background: rgba(0, 0, 0, 0.6);
                    border-radius: 50%;
                    border: 2px solid rgba(255, 255, 255, 0.6);
                }
                .custom-hotspot--scene {
                    background: rgba(34, 197, 94, 0.4);
                    border-radius: 50%;
                    border: 2px solid #22c55e;
                    animation: pulse-scene 2s infinite;
                }
                @keyframes pulse-scene {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
                    50% { box-shadow: 0 0 0 10px rgba(34, 197, 94, 0); }
                }
                .hotspot-tooltip {
                    position: absolute;
                    bottom: 100%;
                    left: 50%;
                    transform: translateX(-50%) translateY(5px);
                    background: rgba(0, 0, 0, 0.9);
                    color: white;
                    padding: 8px 14px;
                    border-radius: 8px;
                    font-size: 13px;
                    font-weight: 500;
                    white-space: nowrap;
                    opacity: 0;
                    visibility: hidden;
                    pointer-events: none;
                    transition: opacity 0.1s ease, transform 0.1s ease, visibility 0.1s;
                    margin-bottom: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                }
                .custom-hotspot:hover .hotspot-tooltip { 
                    opacity: 1; 
                    visibility: visible;
                    transform: translateX(-50%) translateY(0);
                }
            `}</style>
        </div>
    );
};

export default DemoTourPage;
