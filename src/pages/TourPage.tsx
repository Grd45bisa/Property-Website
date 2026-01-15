import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import './DemoTourPage.css'; // Reuse existing styles
import '../styles/Hotspots.css';

// Declare pannellum on window
declare global {
    interface Window {
        pannellum: any;
    }
}
interface HotSpot {
    id?: string;
    pitch: number;
    yaw: number;
    type: 'info' | 'scene';
    text: string;
    targetRoomId?: string;
    icon?: 'arrow' | 'door' | 'info' | 'nav_arrow' | 'blur';
    scale?: number;
    renderMode?: 'floor' | 'wall' | '2d';
    opacity?: number;
    rotateX?: number;
    rotateZ?: number;
    rotateY?: number;
    aspectRatio?: number;
    scaleY?: number;
    blurShape?: 'circle' | 'rect';
    interactionMode?: 'popup' | 'label';
}

interface Room {
    id: string;
    name: string;
    image: string;
    thumbnail?: string; // Blur placeholder for instant loading
    hotSpots: HotSpot[];
    initialView?: { pitch: number; yaw: number };
    autoRotate?: number;
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
    const [isGyroEnabled, setIsGyroEnabled] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const isGyroEnabledRef = useRef(false); // To track state in event listeners
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
    // Client Branding
    const [clientName, setClientName] = useState<string>('');
    const [clientLogo, setClientLogo] = useState<string>('');
    const [clientUrl, setClientUrl] = useState<string>('');
    const [agentWhatsapp, setAgentWhatsapp] = useState<string>('');

    // Mobile & Gyro State


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
                    .select('title, nadir_image_url, nadir_enabled, min_pitch, client_name, client_logo, client_url, agent_whatsapp')
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
                    setAgentWhatsapp(tourData.agent_whatsapp || '');
                }

                // 2. Fetch Rooms
                const { data: roomsData, error: roomsError } = await supabase
                    .from('rooms')
                    .select('*')
                    .eq('tour_id', id)
                    .order('sequence_order', { ascending: true, nullsFirst: false })
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
                    initialView: {
                        pitch: room.initial_view_pitch ?? 0,
                        yaw: room.initial_view_yaw ?? 0
                    },
                    autoRotate: room.auto_rotate ?? 0,
                    hotSpots: (hotspotsData || [])
                        .filter(h => h.room_id === room.id)
                        .map(h => ({
                            id: h.id,
                            pitch: h.pitch,
                            yaw: h.yaw,
                            type: h.target_room_id ? 'scene' : 'info',
                            text: h.text || '',
                            targetRoomId: h.target_room_id,
                            icon: (h.icon as any) || (h.target_room_id ? 'arrow' : 'info'),
                            scale: h.scale || 1,
                            renderMode: h.render_mode || '2d',
                            rotateX: h.rotate_x,
                            rotateZ: h.rotate_z,
                            rotateY: h.rotate_y,
                            aspectRatio: h.aspect_ratio,
                            scaleY: h.scale_y,
                            blurShape: h.blur_shape,
                            opacity: h.opacity,
                            interactionMode: h.interaction_mode as 'popup' | 'label'
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

    // Check device type
    useEffect(() => {
        const checkMobile = () => {
            const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
            const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
            // Basic mobile check
            if (/android/i.test(userAgent) || /iPad|iPhone|iPod/.test(userAgent) || (window.innerWidth < 1024 && isTouch)) {
                setIsMobile(true);
            } else {
                setIsMobile(false);
            }
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

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
            // console.log(`Preloaded ${rooms.length} scene images`);
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
                scale: hs.icon === 'blur', // Enable zoom scaling for blur so it sticks to objects
                // Determine CSS class based on type and render mode
                cssClass: (() => {
                    const baseClass = 'custom-hotspot';
                    const isNavHotspot = hs.type === 'scene' || hs.icon === 'door' || hs.icon === 'arrow' || hs.icon === 'nav_arrow';
                    let typeClass = isNavHotspot ? 'custom-hotspot--scene' : 'custom-hotspot--info';
                    if (hs.icon === 'blur') typeClass = 'custom-hotspot--blur';

                    const renderClass = hs.renderMode === 'floor' ? 'custom-hotspot--floor'
                        : (hs.renderMode === '2d' ? 'custom-hotspot--2d' : '');
                    return `${baseClass} ${typeClass} ${renderClass}`.trim();
                })(),
                createTooltipFunc: (hotSpotDiv: HTMLElement) => {
                    // Apply scale from database
                    const scaleValue = hs.scale ?? 1;
                    hotSpotDiv.style.setProperty('--hs-scale', String(scaleValue));

                    if (hs.aspectRatio) {
                        hotSpotDiv.style.setProperty('--hs-aspect-ratio', String(hs.aspectRatio));
                    }

                    if (hs.scaleY) {
                        hotSpotDiv.style.setProperty('--hs-scale-y', String(hs.scaleY));
                    }

                    if (hs.icon === 'blur') {
                        const radius = hs.blurShape === 'rect' ? '8px' : '50%';
                        hotSpotDiv.style.setProperty('--hs-border-radius', radius);
                    }

                    // Apply opacity
                    if (hs.opacity !== undefined && hs.opacity !== null) {
                        hotSpotDiv.style.setProperty('--hs-opacity', String(hs.opacity));
                    } else {
                        hotSpotDiv.style.setProperty('--hs-opacity', '1');
                    }

                    // Apply floor rotation via CSS variable (dynamic or default)
                    if (hs.renderMode === 'floor') {
                        const tilt = hs.rotateX ?? 75;
                        const spin = hs.rotateZ ?? 0;
                        hotSpotDiv.style.setProperty('--hs-rotate-x', `${tilt}deg`);
                        hotSpotDiv.style.setProperty('--hs-rotate-z', `${spin}deg`);
                    }

                    // Apply wall rotation (Z) via CSS variable
                    if (hs.renderMode === 'wall') {
                        const tiltZ = hs.rotateZ ?? 0;
                        const tiltY = hs.rotateY ?? 0;
                        hotSpotDiv.style.setProperty('--hs-rotate-z', `${tiltZ}deg`);
                        hotSpotDiv.style.setProperty('--hs-rotate-y', `${tiltY}deg`);
                    }

                    // Create wrapper for transforms

                    // Wrapper
                    const wrapper = document.createElement('div');
                    wrapper.className = 'hotspot-inner';
                    hotSpotDiv.appendChild(wrapper);

                    const icon = document.createElement('span');

                    if (hs.icon === 'arrow') {
                        // Arrow: Circle SVG for navigation
                        icon.innerHTML = `<svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block"><circle cx="12" cy="12" r="10" stroke="#ffffff" stroke-width="2"/></svg>`;
                        icon.className = 'hotspot-icon';
                        icon.style.display = 'flex';
                        icon.style.alignItems = 'center';
                        icon.style.justifyContent = 'center';
                    } else if (hs.icon === 'door' || hs.icon === 'nav_arrow' || (hs.type === 'scene' && !hs.icon)) {
                        // Door or Arrow or Default Scene: Material icon
                        icon.className = 'material-icons hotspot-icon';
                        icon.textContent = hs.icon === 'door' ? 'meeting_room' : 'arrow_upward';
                        if (hs.type === 'scene' && !hs.icon) icon.textContent = 'arrow_upward'; // Default

                        icon.style.color = '#ffffff';
                        icon.style.fontSize = '24px';
                    } else if (hs.icon === 'blur') {
                        // Blur: No visible icon
                        icon.style.display = 'none';
                    } else {
                        // Info Icon
                        icon.className = 'material-icons hotspot-icon';
                        icon.textContent = 'info';
                        icon.style.fontSize = '22px';
                        icon.style.color = '#ffffff';
                    }
                    wrapper.appendChild(icon);

                    if (hs.icon !== 'blur') {
                        const tooltip = document.createElement('div');
                        tooltip.className = 'hotspot-tooltip';
                        tooltip.textContent = hs.text;
                        hotSpotDiv.appendChild(tooltip);
                    }
                },
                clickHandlerFunc: () => {
                    if (hs.icon === 'blur') return; // Disable click for blur

                    const isNavHotspot = hs.type === 'scene' || hs.icon === 'door' || hs.icon === 'arrow' || hs.icon === 'nav_arrow';
                    if (isNavHotspot && hs.targetRoomId) {
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
                        // Only open popup if not in "label only" mode
                        if (hs.interactionMode !== 'label') {
                            setActiveInfoCard(activeInfoCard === hs.text ? null : hs.text);
                        }
                    }
                }
            }));

            // Add Nadir/Tripod Cap
            if (nadirEnabled && nadirUrl) {
                hotSpots.push({
                    pitch: -90,
                    yaw: 0,
                    type: 'custom',
                    scale: true, // Scale with zoom so it sticks to the floor
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
                // Feature Detection: WebGL Max Texture Size
                const getGlMaxTextureSize = (): number => {
                    try {
                        const canvas = document.createElement('canvas');
                        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
                        if (!gl) return 4096; // Fallback
                        return (gl as WebGLRenderingContext).getParameter((gl as WebGLRenderingContext).MAX_TEXTURE_SIZE);
                    } catch (e) {
                        return 4096;
                    }
                };

                const maxTextureSize = getGlMaxTextureSize();
                const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

                // Determine Safe Limit
                // Mobile: Cap at 4096px (4K) to prevent VRAM crashes, unless device specifically supports less.
                // Desktop: Cap at min(HardwareLimit, 8192px) for performance/loading balance.
                // Note: Even if an iPhone supports 16k textures, memory pressure will crash the browser tab. 4k is the safe "Max" for stable mobile web.
                let safeLimit = isMobile ? 4096 : 8192;

                // Ensure we don't exceed hardware capability
                safeLimit = Math.min(safeLimit, maxTextureSize);

                // Additional check for severe memory constraints (if possible) or very old devices could go here.

                try {
                    // Fetch blob
                    const response = await fetch(imageUrl);
                    const blob = await response.blob();

                    // Create bitmap to check dimensions (more efficient than Image element)
                    const img = await createImageBitmap(blob);

                    // If within safe limits, use original
                    if (img.width <= safeLimit) {
                        img.close();
                        // Return blob URL to avoid re-fetching? 
                        // Actually original string is better for caching if we don't need to resize.
                        // But using blob URL here ensures consistency if we need to revoke later?
                        // Let's stick to original URL if no resize needed to save memory (no double blob).
                        return imageUrl;
                    }

                    // Resize required
                    console.log(`Optimizing image: ${img.width}px -> ${safeLimit}px (Mobile: ${isMobile})`);

                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    if (!ctx) { img.close(); return imageUrl; }

                    // Maintain Aspect Ratio
                    const scale = safeLimit / img.width;
                    canvas.width = safeLimit;
                    canvas.height = Math.round(img.height * scale);

                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    img.close();

                    // Convert to blob url
                    return new Promise((resolve) => {
                        // Use slightly lower quality (0.85) to save significant VRAM with negligible visual loss
                        canvas.toBlob((resizedBlob) => {
                            if (resizedBlob) {
                                const newUrl = URL.createObjectURL(resizedBlob);
                                resolve(newUrl);
                            } else {
                                resolve(imageUrl);
                            }
                        }, 'image/jpeg', 0.85);
                    });
                } catch (e) {
                    console.warn("Resize optimization failed, falling back to original:", e);
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

                // Optimized Image Loading
                const optimizedImage = await loadAndResizeImage(currentRoom.image);

                // Track if it's a blob URL so we can revoke it later
                if (optimizedImage.startsWith('blob:')) {
                    lastObjectUrl.current = optimizedImage;
                }

                // Destroy existing viewer only when we're ready to create new one
                if (pannellumInstance.current) {
                    pannellumInstance.current.destroy();
                }

                // Determine initial viewing direction
                let initialPitch = currentRoom.initialView?.pitch ?? 0;
                let initialYaw = currentRoom.initialView?.yaw ?? 0;
                let initialHfov = 100;

                if (!hasPlayedIntro.current) {
                    // First load - tiny planet intro
                    initialPitch = -90;
                    initialYaw = currentRoom.initialView?.yaw ?? 0;
                    initialHfov = 150;
                }

                // First time initialization - create new viewer
                pannellumInstance.current = window.pannellum.viewer(viewerRef.current, {
                    type: 'equirectangular',
                    panorama: optimizedImage,
                    autoLoad: true,
                    showControls: false,
                    showFullscreenCtrl: false,
                    showZoomCtrl: false,
                    pitch: initialPitch,
                    yaw: initialYaw,
                    hfov: initialHfov,
                    minPitch: minPitch,
                    maxPitch: 90,
                    mouseZoom: true,
                    draggable: true,
                    friction: 0.15,
                    autoRotate: currentRoom.autoRotate ?? 0,
                    hotSpots: hotSpots,
                    preview: undefined
                });

                // Clear saved direction after using it
                savedViewDirection.current = null;

                // Listen for initial load
                pannellumInstance.current.on('load', () => {
                    setIsLoading(false);
                    setIsTransitioning(false);

                    // Re-enable Gyro if it was active
                    if (isGyroEnabled && pannellumInstance.current) {
                        pannellumInstance.current.startOrientation();
                    }

                    // Play intro animation if first load
                    if (!hasPlayedIntro.current) {
                        setTimeout(() => {
                            if (pannellumInstance.current) {
                                pannellumInstance.current.lookAt(
                                    currentRoom.initialView?.pitch ?? 0,
                                    currentRoom.initialView?.yaw ?? 0,
                                    100,
                                    3000
                                );
                            }
                        }, 500);
                        hasPlayedIntro.current = true;
                    }

                    // Disable context menu
                    if (viewerRef.current) {
                        viewerRef.current.addEventListener('contextmenu', (e) => e.preventDefault());
                    }

                    // Persist Gyro state if enabled (scene change stops it by default)
                    if (isGyroEnabledRef.current && pannellumInstance.current) {
                        pannellumInstance.current.startOrientation();
                    }
                });

                pannellumInstance.current.on('error', (err: any) => {
                    console.error('Pannellum error:', err);
                    setIsLoading(false);
                    setIsTransitioning(false);
                });

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

    // Detect Mobile Device
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





    // Controls Render
    // ...

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
                onTouchEnd={() => {
                    if (isGyroEnabledRef.current && pannellumInstance.current) {
                        // Resume gyro if it was enabled
                        pannellumInstance.current.startOrientation();
                    }
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

            {/* Navigation Arrows */}
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

            {/* Controls (Zoom Only on Left) */}
            <div className="demo-page__controls">
                <button onClick={handleZoomIn} className="demo-page__control-btn" title="Zoom In"><span className="material-icons demo-page__control-icon">add</span></button>
                <button onClick={handleZoomOut} className="demo-page__control-btn" title="Zoom Out"><span className="material-icons demo-page__control-icon">remove</span></button>

                {/* Gyro Toggle (Mobile Only) */}
                {isMobile && (
                    <button
                        className={`demo-page__control-btn ${isGyroEnabled ? 'active' : ''}`}
                        onClick={handleGyroToggle}
                        title={isGyroEnabled ? "Matikan Gyroscope" : "Hidupkan Gyroscope"}
                        style={{
                            marginTop: '8px',
                            backgroundColor: isGyroEnabled ? 'rgba(255, 255, 255, 0.3)' : undefined,
                            boxShadow: isGyroEnabled ? '0 0 10px rgba(255,255,255,0.3)' : undefined
                        }}
                    >
                        <span className="material-icons demo-page__control-icon">
                            {isGyroEnabled ? 'explore' : 'explore_off'}
                        </span>
                    </button>
                )}
            </div>

            {/* Bottom Right Controls */}

            {/* Fullscreen Button */}
            <button
                onClick={handleFullscreen}
                className={`demo-page__fullscreen-btn ${isMaximized ? 'active' : ''}`}
                title={isMaximized ? "Keluar Mode Penuh" : "Mode Layar Penuh"}
            >
                <span className="material-icons">{isMaximized ? 'fullscreen_exit' : 'fullscreen'}</span>
            </button>

            {/* WhatsApp Button */}
            {
                agentWhatsapp && (
                    <a
                        href={`https://wa.me/${agentWhatsapp.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="demo-page__whatsapp"
                        title="Hubungi Kami"
                    >
                        <span className="demo-page__whatsapp-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <g fill="none">
                                    <path d="M24 0v24H0V0zM12.593 23.258l-.011.002-.071.035-.02.004-.014-.004-.071-.035q-.016-.005-.024.005l-.004.01-.017.428.005.02.01.013.104.074.015.004.012-.004.104-.074.012-.016.004-.017-.017-.427q-.004-.016-.017-.018m.265-.113-.013.002-.185.093-.01.01-.003.011.018.43.005.012.008.007.201.093q.019.005.029-.008l.004-.014-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014-.034.614q.001.018.017.024l.015-.002.201-.093.01-.008.004-.011.017-.43-.003-.012-.01-.01z" />
                                    <path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10a9.96 9.96 0 0 1-4.863-1.26l-.305-.178-3.032.892a1.01 1.01 0 0 1-1.28-1.145l.026-.109.892-3.032A9.96 9.96 0 0 1 2 12C2 6.477 6.477 2 12 2m0 2a8 8 0 0 0-6.759 12.282c.198.312.283.696.216 1.077l-.039.163-.441 1.501 1.501-.441c.433-.128.883-.05 1.24.177A8 8 0 1 0 12 4M9.102 7.184a.7.7 0 0 1 .684.075c.504.368.904.862 1.248 1.344l.327.474.153.225a.71.71 0 0 1-.046.864l-.075.076-.924.686a.23.23 0 0 0-.067.291c.21.38.581.947 1.007 1.373.427.426 1.02.822 1.426 1.055.088.05.194.034.266-.031l.038-.045.601-.915a.71.71 0 0 1 .973-.158l.543.379c.54.385 1.059.799 1.47 1.324a.7.7 0 0 1 .089.703c-.396.924-1.399 1.711-2.441 1.673l-.159-.01-.191-.018-.108-.014-.238-.04c-.924-.174-2.405-.698-3.94-2.232-1.534-1.535-2.058-3.016-2.232-3.94l-.04-.238-.025-.208-.013-.175-.004-.075c-.038-1.044.753-2.047 1.678-2.443" fill="currentColor" />
                                </g>
                            </svg>
                        </span>
                        <span className="demo-page__whatsapp-text">Hubungi Kami</span>
                    </a>
                )
            }

            {/* Back Button - Hide if Embed */}


            {/* Room Selector */}
            {
                rooms.length > 1 && (
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
                )
            }

            {/* Hotspot Styles - Reusing same styles as Demo */}
            {/* Hotspot Styles - Moved to src/styles/Hotspots.css */}
        </div >
    );
};

export default TourPage;
