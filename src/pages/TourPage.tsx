import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import './DemoTourPage.css'; // Reuse existing styles

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
    thumbnail?: string; // Blur placeholder for instant loading
    hotSpots: HotSpot[];
}

interface HotSpot {
    id?: string;
    pitch: number;
    yaw: number;
    type: 'info' | 'scene';
    text: string;
    targetRoomId?: string;
    icon?: 'arrow' | 'door' | 'info';
}

const TourPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();

    const viewerRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null); // Container for fullscreen
    const pannellumInstance = useRef<any>(null);


    const [tourTitle, setTourTitle] = useState('');
    const [rooms, setRooms] = useState<Room[]>([]);
    const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);

    // UI States
    const [isLoading, setIsLoading] = useState(true);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [activeInfoCard, setActiveInfoCard] = useState<string | null>(null);
    const [isRoomSelectorOpen, setIsRoomSelectorOpen] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const hasPlayedIntro = useRef(false);
    const lastObjectUrl = useRef<string | null>(null);
    // Store viewing direction for scene transitions
    const savedViewDirection = useRef<{ pitch: number; yaw: number } | null>(null);

    // Nadir State
    const [nadirUrl, setNadirUrl] = useState<string | null>(null);
    const [nadirEnabled, setNadirEnabled] = useState(false);
    const [minPitch, setMinPitch] = useState<number>(-90); // Pitch limit from tour settings

    // Client Branding
    const [clientName, setClientName] = useState<string>('');
    const [clientLogo, setClientLogo] = useState<string>('');
    const [clientUrl, setClientUrl] = useState<string>('');

    // Get current room data
    useEffect(() => {
        const fetchTourData = async () => {
            if (!id) return;
            setIsLoading(true);
            hasPlayedIntro.current = false; // Reset to ensure intro animation plays
            try {
                // 1. Fetch Tour Info
                const { data: tourData, error: tourError } = await supabase
                    .from('tours')
                    .select('title, nadir_image_url, nadir_enabled, min_pitch, client_name, client_logo, client_url')
                    .eq('id', id)
                    .single();

                if (tourError) throw tourError;
                setTourTitle(tourData.title || 'Virtual Tour');
                if (tourData) {
                    setNadirUrl(tourData.nadir_image_url || null);
                    setNadirEnabled(tourData.nadir_enabled || false);
                    setMinPitch(tourData.min_pitch ?? -90);
                    setClientName(tourData.client_name || '');
                    setClientLogo(tourData.client_logo || '');
                    setClientUrl(tourData.client_url || '');
                }

                // 2. Fetch Rooms
                const { data: roomsData, error: roomsError } = await supabase
                    .from('rooms')
                    .select('*')
                    .eq('tour_id', id)
                    .order('created_at', { ascending: true });

                if (roomsError) throw roomsError;
                if (!roomsData || roomsData.length === 0) {
                    setErrorMsg('Tour ini belum memiliki scene/ruangan.');
                    setIsLoading(false);
                    return;
                }

                // 3. Fetch Hotspots
                const { data: hotspotsData, error: hotspotsError } = await supabase
                    .from('hotspots')
                    .select('*')
                    .in('room_id', roomsData.map(r => r.id));

                if (hotspotsError) throw hotspotsError;

                // 4. Transform Data
                const mappedRooms: Room[] = roomsData.map(room => ({
                    id: room.id,
                    name: room.name,
                    image: room.image_url,
                    thumbnail: room.thumbnail_url || undefined, // Blur placeholder
                    hotSpots: (hotspotsData || [])
                        .filter(h => h.room_id === room.id)
                        .map(h => ({
                            id: h.id,
                            pitch: h.pitch,
                            yaw: h.yaw,
                            type: h.target_room_id ? 'scene' : 'info',
                            text: h.text || '',
                            targetRoomId: h.target_room_id,
                            icon: (h.icon as any) || (h.target_room_id ? 'arrow' : 'info')
                        }))
                }));

                setRooms(mappedRooms);
                setCurrentRoomId(mappedRooms[0].id);

            } catch (error: any) {
                console.error('Error loading tour:', error);
                setErrorMsg('Gagal memuat tour. ' + (error.message || ''));
                setIsLoading(false);
            }
        };

        fetchTourData();
    }, [id]);

    // Preload all room images in background for instant scene switching
    useEffect(() => {
        if (rooms.length <= 1) return;

        // Preload images after a short delay to not block current scene
        const preloadTimeout = setTimeout(() => {
            rooms.forEach(room => {
                const img = new Image();
                img.src = room.image;
                // Optionally preload thumbnails too
                if (room.thumbnail) {
                    const thumbImg = new Image();
                    thumbImg.src = room.thumbnail;
                }
            });
            console.log(`Preloaded ${rooms.length} scene images`);
        }, 1000); // Wait 1 second after first load

        return () => clearTimeout(preloadTimeout);
    }, [rooms]);

    const currentRoom = rooms.find(r => r.id === currentRoomId) || rooms[0];

    // Initialize Viewer
    useEffect(() => {
        if (!currentRoom) return;

        const initViewer = () => {
            if (!viewerRef.current || !window.pannellum) return;

            if (pannellumInstance.current) {
                pannellumInstance.current.destroy();
            }

            const hotSpots = currentRoom.hotSpots.map((hs: HotSpot) => ({
                pitch: hs.pitch,
                yaw: hs.yaw,
                type: 'custom',
                cssClass: hs.type === 'scene' ? 'custom-hotspot custom-hotspot--scene' : 'custom-hotspot custom-hotspot--info',
                createTooltipFunc: (hotSpotDiv: HTMLElement) => {
                    const icon = document.createElement('span');
                    icon.className = 'material-icons hotspot-icon';

                    // Icon mapping
                    let iconType = hs.icon || (hs.type === 'scene' ? 'arrow' : 'info');
                    if (hs.type === 'scene' && !hs.icon) iconType = 'arrow'; // Fallback

                    switch (iconType) {
                        case 'door': icon.textContent = 'meeting_room'; break;
                        case 'arrow': icon.textContent = 'north'; break;
                        case 'info': default: icon.textContent = 'info'; break;
                    }

                    icon.style.fontSize = hs.type === 'scene' ? '24px' : '22px';
                    icon.style.color = '#ffffff';
                    hotSpotDiv.appendChild(icon);

                    const tooltip = document.createElement('div');
                    tooltip.className = 'hotspot-tooltip';
                    tooltip.textContent = hs.text;
                    hotSpotDiv.appendChild(tooltip);
                },
                clickHandlerFunc: () => {
                    if (hs.type === 'scene' && hs.targetRoomId) {
                        // Save current viewing direction before transitioning
                        if (pannellumInstance.current) {
                            savedViewDirection.current = {
                                pitch: pannellumInstance.current.getPitch(),
                                yaw: pannellumInstance.current.getYaw()
                            };
                        }
                        setIsTransitioning(true);
                        setTimeout(() => {
                            setCurrentRoomId(hs.targetRoomId!);
                            setActiveInfoCard(null);
                        }, 400);
                    } else if (hs.type === 'info') {
                        setActiveInfoCard(activeInfoCard === hs.text ? null : hs.text);
                    }
                },
            }));

            // Add Nadir/Tripod Cap
            if (nadirEnabled && nadirUrl) {
                hotSpots.push({
                    pitch: -90,
                    yaw: 0,
                    type: 'custom',
                    //@ts-ignore
                    cssClass: 'pnlm-nadir-cap',
                    createTooltipFunc: (div: HTMLElement) => {
                        div.style.backgroundImage = `url(${nadirUrl})`;
                        div.style.backgroundSize = 'contain';
                        div.style.backgroundRepeat = 'no-repeat';
                        div.style.backgroundPosition = 'center';
                        div.style.width = '120px';
                        div.style.height = '120px';
                        div.style.borderRadius = '50%';
                        div.style.pointerEvents = 'none';
                        div.style.transform = 'translate(-50%, -50%) rotate(0deg)'; // Ensure centering
                    },
                    clickHandlerFunc: () => { }
                });
            }

            // Client-side image optimization and memory management
            const loadAndResizeImage = async (imageUrl: string): Promise<string> => {
                const isMobile = window.innerWidth < 1024;
                // Higher res for better quality - only resize if image is larger than limit
                // Mobile: 4096px, Desktop: 8192px (original quality)
                const MAX_SIZE = isMobile ? 4096 : 8192;

                try {
                    // Fetch blob
                    const response = await fetch(imageUrl);
                    const blob = await response.blob();

                    // Create bitmap/image to check dimensions
                    const img = await createImageBitmap(blob);

                    // If image is within safe limits, return original URL (but keep track if it's a blob?)
                    // Actually, getting a blob URL from fetch response is better for memory tracking if we used URL.createObjectURL(blob).
                    // But here we might return the original string if no resize needed.
                    // However, for consistency and avoiding cross-origin weirdness on some texture loaders, let's just use the original string if small enough.

                    if (img.width <= MAX_SIZE) {
                        // Close bitmap to free memory
                        img.close();
                        return imageUrl;
                    }

                    // Resize required
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    if (!ctx) { img.close(); return imageUrl; }

                    // Calculate new aspect ratio preserving dims
                    const scale = MAX_SIZE / img.width;
                    canvas.width = MAX_SIZE;
                    canvas.height = img.height * scale;

                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    img.close(); // Free bitmap memory immediately

                    // Convert to blob url
                    return new Promise((resolve) => {
                        canvas.toBlob((resizedBlob) => {
                            if (resizedBlob) {
                                const newUrl = URL.createObjectURL(resizedBlob);
                                resolve(newUrl);
                            } else {
                                resolve(imageUrl);
                            }
                        }, 'image/jpeg', 0.80); // 0.8 quality is sufficient for 360 and saves memory
                    });
                } catch (e) {
                    console.error("Resize failed, using original", e);
                    return imageUrl;
                }
            };

            // Progressive Loading: Show blur placeholder first, then swap to full quality
            const initWithBlur = async () => {
                if (!viewerRef.current || !window.pannellum) return;

                // Cleanup previous blob URL
                if (lastObjectUrl.current) {
                    URL.revokeObjectURL(lastObjectUrl.current);
                    lastObjectUrl.current = null;
                }

                // DISABLED blur placeholder - setPanorama not supported in single-panorama mode
                // Always use full quality image
                const initialImage = currentRoom.image;

                // Destroy existing viewer only when we're ready to create new one
                if (pannellumInstance.current) {
                    pannellumInstance.current.destroy();
                }

                // Determine initial viewing direction
                // Use saved direction if transitioning, otherwise intro animation or default
                let initialPitch = 0;
                let initialYaw = 0;
                let initialHfov = 100;

                if (savedViewDirection.current && hasPlayedIntro.current) {
                    // Transitioning between scenes - keep same direction
                    initialPitch = savedViewDirection.current.pitch;
                    initialYaw = savedViewDirection.current.yaw;
                } else if (!hasPlayedIntro.current) {
                    // First load - tiny planet intro
                    initialPitch = -90;
                    initialHfov = 150;
                }

                // First time initialization - create new viewer
                pannellumInstance.current = window.pannellum.viewer(viewerRef.current, {
                    type: 'equirectangular',
                    panorama: initialImage,
                    autoLoad: true,
                    showControls: false,
                    showFullscreenCtrl: false,
                    showZoomCtrl: false,
                    pitch: initialPitch,
                    yaw: initialYaw,
                    hfov: initialHfov,
                    minPitch: minPitch, // Apply pitch limit from settings
                    maxPitch: 90,
                    mouseZoom: true,
                    draggable: true,
                    friction: 0.15,
                    autoRotate: -0.3, // Negative = rotate right
                    hotSpots: hotSpots,
                    preview: undefined
                });

                // Clear saved direction after using it
                savedViewDirection.current = null;

                // Listen for initial load
                pannellumInstance.current.on('load', () => {
                    setIsLoading(false);
                    setIsTransitioning(false);

                    // Play intro animation if first load
                    if (!hasPlayedIntro.current) {
                        setTimeout(() => {
                            if (pannellumInstance.current) {
                                pannellumInstance.current.lookAt(0, 0, 100, 3000);
                            }
                        }, 500);
                        hasPlayedIntro.current = true;
                    }

                    // Disable context menu
                    if (viewerRef.current) {
                        viewerRef.current.addEventListener('contextmenu', (e) => e.preventDefault());
                    }
                });

                pannellumInstance.current.on('error', (err: any) => {
                    console.error('Pannellum error:', err);
                    setIsLoading(false);
                    setIsTransitioning(false);
                });

                // Note: setPanorama is not available in single panorama mode
                // Just preload/process image for memory optimization (for future scene switches)
                // The viewer already has the correct image loaded via the 'panorama' option
                if (!currentRoom.thumbnail) {
                    // Preprocess and cache resized image for memory management
                    loadAndResizeImage(currentRoom.image).then((processedImage) => {
                        // Track blob URL if resized (for cleanup on scene change)
                        if (processedImage.startsWith('blob:')) {
                            lastObjectUrl.current = processedImage;
                        }
                        // Image is now in browser cache for faster scene transitions
                    }).catch(err => console.warn('Image preprocess failed:', err));
                }
            };

            initWithBlur();
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
            if (lastObjectUrl.current) {
                URL.revokeObjectURL(lastObjectUrl.current);
            }
        };
    }, [currentRoomId, currentRoom, nadirEnabled, nadirUrl]);



    // Controls
    const handleZoomIn = () => {
        if (pannellumInstance.current) {
            const currentHfov = pannellumInstance.current.getHfov();
            pannellumInstance.current.setHfov(Math.max(currentHfov - 20, 50), 1000);
        }
    };

    const handleZoomOut = () => {
        if (pannellumInstance.current) {
            const currentHfov = pannellumInstance.current.getHfov();
            pannellumInstance.current.setHfov(Math.min(currentHfov + 20, 120), 1000);
        }
    };

    const handleFullscreen = () => {
        if (!document.fullscreenElement) {
            // Enter Fullscreen - use containerRef to include all UI
            if (containerRef.current?.requestFullscreen) {
                containerRef.current.requestFullscreen();
            } else if ((containerRef.current as any)?.webkitRequestFullscreen) {
                (containerRef.current as any).webkitRequestFullscreen();
            } else if ((containerRef.current as any)?.msRequestFullscreen) {
                (containerRef.current as any).msRequestFullscreen();
            }
            setIsMaximized(true);
        } else {
            // Exit Fullscreen
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if ((document as any).webkitExitFullscreen) {
                (document as any).webkitExitFullscreen();
            } else if ((document as any).msExitFullscreen) {
                (document as any).msExitFullscreen();
            }
            setIsMaximized(false);
        }

        setTimeout(() => {
            if (pannellumInstance.current) pannellumInstance.current.resize();
        }, 300);
    };

    // Sync state with browser fullscreen changes (e.g. Esc key)
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsMaximized(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
        };
    }, []);

    const handlePrevRoom = () => {
        if (!rooms.length) return;
        const currentIndex = rooms.findIndex(r => r.id === currentRoomId);
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : rooms.length - 1;
        setIsTransitioning(true);
        setTimeout(() => setCurrentRoomId(rooms[prevIndex].id), 400);
    };

    const handleNextRoom = () => {
        if (!rooms.length) return;
        const currentIndex = rooms.findIndex(r => r.id === currentRoomId);
        const nextIndex = currentIndex < rooms.length - 1 ? currentIndex + 1 : 0;
        setIsTransitioning(true);
        setTimeout(() => setCurrentRoomId(rooms[nextIndex].id), 400);
    };

    if (errorMsg) {
        return (
            <div className="demo-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: 'white' }}>
                <h2 style={{ marginBottom: '1rem' }}>Oops!</h2>
                <p>{errorMsg}</p>

            </div>
        );
    }

    if (!currentRoom) return <div className="demo-page" />;

    return (
        <div ref={containerRef} className={`demo-page ${isMaximized ? 'demo-page--maximized' : ''}`}>
            {/* Viewer */}
            <div
                ref={viewerRef}
                className={`demo-page__viewer ${isTransitioning ? 'demo-page__viewer--zooming' : ''}`}
                style={{
                    transition: 'transform 0.6s cubic-bezier(0.2, 0, 0.2, 1), opacity 0.4s ease',
                    transform: isTransitioning ? 'scale(1.4)' : 'scale(1)',
                    opacity: isTransitioning ? 0 : 1
                }}
            />

            {/* Transition Overlay */}
            <div className={`demo-page__transition-overlay ${(isLoading || isTransitioning) ? 'demo-page__transition-overlay--active' : ''}`} />

            {/* Loading Spinner */}
            {isLoading && (
                <div className="tour-loading-overlay" style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    background: 'black', zIndex: 50, color: 'white'
                }}>
                    <div className="tour-spinner" style={{
                        width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.3)',
                        borderTopColor: 'white', borderRadius: '50%', marginBottom: '16px',
                        animation: 'spin 1s linear infinite'
                    }} />
                    <span style={{ fontSize: '14px', fontWeight: 500, letterSpacing: '0.5px' }}>Loading Tour...</span>
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
            )}

            {/* Info Card */}
            {activeInfoCard && (
                <div className="info-card" onClick={() => setActiveInfoCard(null)}>
                    <div className="info-card__content" onClick={(e) => e.stopPropagation()}>
                        <button className="info-card__close" onClick={() => setActiveInfoCard(null)}>
                            <span className="material-icons">close</span>
                        </button>
                        <div className="info-card__icon">
                            <span className="material-icons">info</span>
                        </div>
                        <h3 className="info-card__title">Info</h3>
                        <p className="info-card__text">{activeInfoCard}</p>
                    </div>
                </div>
            )}

            {/* Client Logo - Only show if client name or logo is set */}
            {/* Client Logo - Only show if client name or logo is set */}
            {(clientName || clientLogo) && (
                <div className="demo-page__logo">
                    {clientUrl ? (
                        <a
                            href={clientUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="demo-page__logo-inner"
                            style={{ textDecoration: 'none', cursor: 'pointer', transition: 'transform 0.2s' }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            {clientLogo ? (
                                <img src={clientLogo} alt={clientName || 'Client Logo'} style={{ height: '24px', objectFit: 'contain', borderRadius: '4px' }} />
                            ) : (
                                <span className="material-icons demo-page__logo-icon">view_in_ar</span>
                            )}
                            {clientName && <span className="demo-page__logo-text">{clientName}</span>}
                        </a>
                    ) : (
                        <div className="demo-page__logo-inner">
                            {clientLogo ? (
                                <img src={clientLogo} alt={clientName || 'Client Logo'} style={{ height: '24px', objectFit: 'contain', borderRadius: '4px' }} />
                            ) : (
                                <span className="material-icons demo-page__logo-icon">view_in_ar</span>
                            )}
                            {clientName && <span className="demo-page__logo-text">{clientName}</span>}
                        </div>
                    )}
                </div>
            )}

            {/* Title - Reuse demo styles */}
            <div className="demo-page__title">
                <div className="demo-page__title-inner">
                    <h1 className="demo-page__title-text">{tourTitle}</h1>
                    <p className="demo-page__title-room">{currentRoom.name}</p>
                </div>
            </div>

            {/* Navigation Arrows - Hide if single room? Or keep for ease */}
            {rooms.length > 1 && (
                <>
                    <button onClick={handlePrevRoom} className="demo-page__nav-arrow demo-page__nav-arrow--left">
                        <span className="material-icons demo-page__nav-arrow-icon">chevron_left</span>
                    </button>
                    <button onClick={handleNextRoom} className="demo-page__nav-arrow demo-page__nav-arrow--right">
                        <span className="material-icons demo-page__nav-arrow-icon">chevron_right</span>
                    </button>
                </>
            )}

            {/* Controls */}
            <div className="demo-page__controls">
                <button onClick={handleZoomIn} className="demo-page__control-btn"><span className="material-icons demo-page__control-icon">add</span></button>
                <button onClick={handleZoomOut} className="demo-page__control-btn"><span className="material-icons demo-page__control-icon">remove</span></button>
                <button
                    onClick={handleFullscreen}
                    className={`demo-page__control-btn ${isMaximized ? 'active' : ''}`}
                    title={isMaximized ? "Keluar Mode Penuh" : "Mode Layar Penuh"}
                >
                    <span className="material-icons demo-page__control-icon">{isMaximized ? 'fullscreen_exit' : 'fullscreen'}</span>
                </button>
            </div>

            {/* Back Button - Hide if Embed */}


            {/* Room Selector */}
            {rooms.length > 1 && (
                <div className={`demo-page__room-selector ${isRoomSelectorOpen ? 'demo-page__room-selector--open' : ''}`}>
                    <button className="demo-page__room-toggle" onClick={() => setIsRoomSelectorOpen(!isRoomSelectorOpen)}>
                        <span className="demo-page__room-toggle-label">
                            <span className="material-icons">meeting_room</span>
                            {currentRoom.name}
                        </span>
                        <span className={`material-icons demo-page__room-toggle-arrow ${isRoomSelectorOpen ? 'rotated' : ''}`}>expand_less</span>
                    </button>
                    <div className={`demo-page__room-list ${isRoomSelectorOpen ? 'demo-page__room-list--open' : ''}`}>
                        {rooms.map((room) => (
                            <button
                                key={room.id}
                                onClick={() => { setCurrentRoomId(room.id); setIsRoomSelectorOpen(false); }}
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
            )}

            {/* Hotspot Styles - Reusing same styles as Demo */}
            <style>{`
                .pnlm-container { background: #000 !important; }
                .pnlm-about-msg { display: none !important; }
                .pnlm-hotspot-base, .pnlm-pointer, .pnlm-hotspot { transition: none !important; }
                
                .custom-hotspot {
                    width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;
                    cursor: pointer; transition: transform 0.15s ease;
                }
                .custom-hotspot:hover { transform: scale(1.15); }
                .custom-hotspot--info {
                    background: rgba(0, 0, 0, 0.6); border-radius: 50%; border: 2px solid rgba(255, 255, 255, 0.6);
                }
                .custom-hotspot--scene {
                    background: rgba(34, 197, 94, 0.4); border-radius: 50%; border: 2px solid #22c55e;
                    animation: pulse-scene 2s infinite;
                }
                @keyframes pulse-scene {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
                    50% { box-shadow: 0 0 0 10px rgba(34, 197, 94, 0); }
                }
                .hotspot-tooltip {
                    position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%) translateY(5px);
                    background: rgba(0, 0, 0, 0.9); color: white; padding: 8px 14px; border-radius: 8px;
                    font-size: 13px; font-weight: 500; white-space: nowrap; opacity: 0; visibility: hidden;
                    pointer-events: none; transition: opacity 0.1s ease, transform 0.1s ease, visibility 0.1s;
                    margin-bottom: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                }
                .custom-hotspot:hover .hotspot-tooltip { 
                    opacity: 1; visibility: visible; transform: translateX(-50%) translateY(0);
                }
            `}</style>
        </div>
    );
};

export default TourPage;
