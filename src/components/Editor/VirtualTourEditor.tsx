import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';
import './VirtualTourEditor.css';

declare global {
    interface Window {
        pannellum: any;
    }
}

interface Scene {
    id: string;
    name: string;
    imageUrl: string;
    thumbnailUrl?: string; // Blur placeholder for progressive loading
    hotspots: Hotspot[];
    sequence_order?: number;
}

type HotspotIcon = 'info' | 'door' | 'arrow';

interface Hotspot {
    id: string;
    icon: HotspotIcon;
    pitch: number;
    yaw: number;
    text: string;
    targetSceneId?: string;
    description?: string;
}

// Icon config
const HOTSPOT_ICONS: { id: HotspotIcon; label: string; materialIcon: string; color: string }[] = [
    { id: 'info', label: 'Info', materialIcon: 'info', color: '#3b82f6' },
    { id: 'door', label: 'Pintu', materialIcon: 'meeting_room', color: '#10b981' },
    { id: 'arrow', label: 'Arrow', materialIcon: 'arrow_upward', color: '#10b981' },
];

interface VirtualTourEditorProps {
    tourId?: string;
}

const VirtualTourEditor: React.FC<VirtualTourEditorProps> = ({ tourId }) => {
    // Constants
    const MAX_FILE_SIZE = 50 * 1024 * 1024; // Allow up to 50MB input (will be compressed)
    const TARGET_FILE_SIZE = 10 * 1024 * 1024; // Target output size < 10MB
    const MAX_DIMENSION = 8192; // High quality for 360 images

    const viewerRef = useRef<HTMLDivElement>(null);
    const pannellumInstance = useRef<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const nadirInputRef = useRef<HTMLInputElement>(null);

    // State
    const [loading, setLoading] = useState(false);
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);
    const [scenes, setScenes] = useState<Scene[]>([]);

    // Nadir State
    const [nadirUrl, setNadirUrl] = useState<string | null>(null);
    const [nadirEnabled, setNadirEnabled] = useState(false);
    const [isNadirModalOpen, setIsNadirModalOpen] = useState(false);

    // Compression Tool State
    const [isCompressModalOpen, setIsCompressModalOpen] = useState(false);
    const [selectedScenesForCompress, setSelectedScenesForCompress] = useState<string[]>([]);
    const [compressionLevel, setCompressionLevel] = useState<number>(2); // 1.25, 1.5, 2, 4
    const [previewUrls, setPreviewUrls] = useState<{ [sceneId: string]: string }>({});
    const [isCompressing, setIsCompressing] = useState(false);
    const [compressionProgress, setCompressionProgress] = useState('');

    // Title Editing State
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editingTitleValue, setEditingTitleValue] = useState('');

    const [activeSceneId, setActiveSceneId] = useState<string>('');
    const [isAddMode, setIsAddMode] = useState(false);
    const [addModeIcon, setAddModeIcon] = useState<HotspotIcon>('info');
    const [selectedHotspotId, setSelectedHotspotId] = useState<string | null>(null);
    const [toast, setToast] = useState<string | null>(null);

    const activeScene = scenes.find(s => s.id === activeSceneId);
    const selectedHotspot = activeScene?.hotspots.find(h => h.id === selectedHotspotId);

    // Toast helper
    const showToast = (message: string) => {
        setToast(message);
        setTimeout(() => setToast(null), 2500);
    };

    // Get icon config
    const getIconConfig = (icon: HotspotIcon) => HOTSPOT_ICONS.find(i => i.id === icon) || HOTSPOT_ICONS[0];

    // Ref for add mode
    const isAddModeRef = useRef(isAddMode);
    const addModeIconRef = useRef(addModeIcon);
    const renderedHotspotsRef = useRef<string[]>([]);
    const currentSceneIdRef = useRef<string | null>(null);
    const lastRenderedHotspotsJsonRef = useRef<string | null>(null);
    useEffect(() => { isAddModeRef.current = isAddMode; }, [isAddMode]);
    useEffect(() => { addModeIconRef.current = addModeIcon; }, [addModeIcon]);

    // --- HELPER FUNCTIONS & HANDLERS ---

    const addNewHotspot = (pitch: number, yaw: number, icon: HotspotIcon) => {
        const isNavigation = icon === 'door' || icon === 'arrow';
        const newHotspot: Hotspot = {
            id: crypto.randomUUID(), // Use standard UUID for Supabase compatibility
            icon,
            pitch,
            yaw,
            text: isNavigation ? 'Ke Ruangan...' : 'Info Point',
            targetSceneId: isNavigation ? scenes.find(s => s.id !== activeSceneId)?.id : undefined
        };

        setScenes(prev => prev.map(s => {
            if (s.id === activeSceneId) {
                return { ...s, hotspots: [...s.hotspots, newHotspot] };
            }
            return s;
        }));

        setIsAddMode(false);
        setSelectedHotspotId(newHotspot.id);
        showToast(`Hotspot ${getIconConfig(icon).label} ditambahkan!`);
    };

    // Stable reference for the click handler to avoid re-binding listeners
    const onViewerClickRef = useRef<(e: MouseEvent) => void>(() => { });

    // Update the ref on every render to capture latest state/closures
    useEffect(() => {
        onViewerClickRef.current = (event: MouseEvent) => {
            if (!isAddModeRef.current || !pannellumInstance.current) return;
            const [pitch, yaw] = pannellumInstance.current.mouseEventToCoords(event);
            addNewHotspot(pitch, yaw, addModeIconRef.current);
        };
    });

    const handleViewerClick = useCallback((event: MouseEvent) => {
        onViewerClickRef.current(event);
    }, []);

    // Helper: Compress Image
    const compressImage = async (file: File): Promise<File> => {
        // If file is small enough (< 5MB), return as is (unless format conversion needed?)
        // Actually, user wants "detected up to 30", implying large files.
        // Let's optimize anything > 5MB to be safe, or if > 10MB definitely optimize.
        // And even if small, ensuring max 8192px is good for consistency.
        if (file.size < 5 * 1024 * 1024) return file;

        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = URL.createObjectURL(file);
            img.onload = () => {
                URL.revokeObjectURL(img.src);
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Resize if too huge
                if (width > MAX_DIMENSION) {
                    const scale = MAX_DIMENSION / width;
                    width = MAX_DIMENSION;
                    height = img.height * scale;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Canvas context failed'));
                    return;
                }
                ctx.drawImage(img, 0, 0, width, height);

                // High quality compression first
                canvas.toBlob((blob) => {
                    if (!blob) {
                        reject(new Error('Compression failed'));
                        return;
                    }

                    // If still too big, try lower quality
                    if (blob.size > TARGET_FILE_SIZE) {
                        canvas.toBlob((blob2) => {
                            if (blob2) {
                                resolve(new File([blob2], file.name, { type: 'image/jpeg' }));
                            } else {
                                resolve(file); // Fallback to original if blob2 fails
                            }
                        }, 'image/jpeg', 0.75); // Retry with lower quality
                    } else {
                        resolve(new File([blob], file.name, { type: 'image/jpeg' }));
                    }
                }, 'image/jpeg', 0.85); // Initial high quality
            };
            img.onerror = (e) => reject(e);
        });
    };

    // Helper: Generate tiny thumbnail for blur placeholder
    const generateThumbnail = async (file: File): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = URL.createObjectURL(file);
            img.onload = () => {
                URL.revokeObjectURL(img.src);
                const canvas = document.createElement('canvas');
                // Tiny thumbnail (64px wide) for blur effect
                const THUMB_SIZE = 64;
                const scale = THUMB_SIZE / img.width;
                canvas.width = THUMB_SIZE;
                canvas.height = img.height * scale;
                const ctx = canvas.getContext('2d');
                if (!ctx) { reject(new Error('Canvas failed')); return; }
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                canvas.toBlob((blob) => {
                    if (blob) resolve(blob);
                    else reject(new Error('Thumbnail generation failed'));
                }, 'image/jpeg', 0.6);
            };
            img.onerror = (e) => reject(e);
        });
    };

    // 0. Load Data
    useEffect(() => {
        if (tourId) {
            if (tourId === 'demo') {
                // Load Mock Data
                setScenes([
                    {
                        id: '1',
                        name: 'Living Room',
                        imageUrl: 'https://pannellum.org/images/alma.jpg',
                        hotspots: []
                    },
                    {
                        id: '2',
                        name: 'Kitchen',
                        imageUrl: 'https://pannellum.org/images/cerro-toco-0.jpg',
                        hotspots: []
                    }
                ]);
                setActiveSceneId('1');
            } else {
                fetchTourData();
            }
        }
    }, [tourId]);

    const fetchTourData = async () => {
        if (!tourId) return;
        setLoading(true);
        try {
            // Fetch Tour Settings (Nadir)
            const { data: tourData, error: tourError } = await supabase
                .from('tours')
                .select('nadir_image_url, nadir_enabled')
                .eq('id', tourId)
                .single();

            if (tourError && tourError.code !== 'PGRST116') console.warn("Error fetching tour settings", tourError);
            if (tourData) {
                setNadirUrl(tourData.nadir_image_url || null);
                setNadirEnabled(tourData.nadir_enabled || false);
            }

            // Fetch Rooms
            const { data: rooms, error: roomsError } = await supabase
                .from('rooms')
                .select('*')
                .eq('tour_id', tourId)
                .order('sequence_order', { ascending: true, nullsFirst: false })
                .order('created_at', { ascending: true });

            if (roomsError) throw roomsError;

            // Fetch Hotspots
            const { data: hotspots, error: hotspotsError } = await supabase
                .from('hotspots')
                .select('*')
                .in('room_id', rooms?.map(r => r.id) || []);

            if (hotspotsError) throw hotspotsError;

            // Map to State
            const mappedScenes: Scene[] = (rooms || []).map(room => ({
                id: room.id,
                name: room.name,
                imageUrl: room.image_url,
                thumbnailUrl: room.thumbnail_url || undefined, // Blur placeholder
                sequence_order: room.sequence_order || 0,
                hotspots: (hotspots || [])
                    .filter(h => h.room_id === room.id)
                    .map(h => ({
                        id: h.id,
                        icon: (h.icon as HotspotIcon) || 'info',
                        pitch: h.pitch,
                        yaw: h.yaw,
                        text: h.text || '',
                        targetSceneId: h.target_room_id,
                        description: ''
                    }))
            }));

            setScenes(mappedScenes);
            if (mappedScenes.length > 0) {
                setActiveSceneId(mappedScenes[0].id);
            }
        } catch (error) {
            console.error('Error fetching tour data:', error);
            showToast('Gagal memuat data tour');
        } finally {
            setLoading(false);
        }
    };

    // 1. Helper to create hotspot config
    const createHotspotConfig = (hs: Hotspot) => {
        const iconConfig = getIconConfig(hs.icon);
        const isNavHotspot = hs.icon === 'door' || hs.icon === 'arrow';

        return {
            id: hs.id,
            pitch: hs.pitch,
            yaw: hs.yaw,
            type: 'custom',
            cssClass: `editor-hotspot editor-hotspot--${hs.icon} ${!isPreviewMode && selectedHotspotId === hs.id ? 'editor-hotspot--selected' : ''}`,
            clickHandlerFunc: () => {
                if (isPreviewMode) {
                    if (isNavHotspot && hs.targetSceneId) {
                        setActiveSceneId(hs.targetSceneId);
                    }
                } else {
                    setSelectedHotspotId(hs.id);
                    setIsAddMode(false);
                }
            },
            createTooltipFunc: (hotSpotDiv: HTMLElement) => {
                const icon = document.createElement('span');
                icon.className = 'material-icons';
                icon.textContent = iconConfig.materialIcon;
                hotSpotDiv.appendChild(icon);

                const tooltip = document.createElement('div');
                tooltip.className = 'editor-hotspot__tooltip';
                tooltip.textContent = hs.text;
                hotSpotDiv.appendChild(tooltip);
            }
        };
    };

    // 2. Initialize Viewer (Only when scene/image changes)
    useEffect(() => {
        const initViewer = () => {
            if (!viewerRef.current || !window.pannellum || !activeScene) return;

            // If viewer exists, destroy it to load new scene cleanly
            if (pannellumInstance.current) {
                pannellumInstance.current.destroy();
            }



            pannellumInstance.current = window.pannellum.viewer(viewerRef.current, {
                type: 'equirectangular',
                panorama: activeScene.imageUrl,
                autoLoad: true,
                showControls: !isPreviewMode,
                showFullscreenCtrl: false,
                hotSpots: [], // Start empty, let Sync Effect handle it to ensure consistency
                pitch: 0,
                yaw: 0,
                hfov: 100
            });

            // Event listener for adding hotspots
            pannellumInstance.current.on('mousedown', handleViewerClick);

            // Update refs
            renderedHotspotsRef.current = []; // Reset tracked hotspots
            lastRenderedHotspotsJsonRef.current = null; // Force sync on next effect run
            currentSceneIdRef.current = activeScene.id;
        };

        if (!window.pannellum) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css';
            document.head.appendChild(link);

            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js';
            script.async = true;
            script.onload = () => initViewer();
            document.body.appendChild(script);
        } else {
            initViewer();
        }

        return () => {
            // Cleanup on unmount or scene change
            if (pannellumInstance.current) {
                pannellumInstance.current.destroy();
                pannellumInstance.current = null;
            }
        };
    }, [activeSceneId, activeScene?.imageUrl]);

    // 3. Sync Hotspots & Mode
    useEffect(() => {
        if (!pannellumInstance.current) return;

        // Optimization: Deep compare hotspots to avoid unnecessary re-renders/removals
        // This prevents "Failed to remove hotspot" errors on simple re-renders
        const newHotspotsConfig = activeScene ? activeScene.hotspots.map(createHotspotConfig) : [];
        const newHotspotsJson = JSON.stringify(newHotspotsConfig);

        if (newHotspotsJson === lastRenderedHotspotsJsonRef.current) {
            // Data matches exactly what we last rendered.
            // We still might need to update event listeners below, but skip DOM manipulation.
        } else {
            // Data changed. Proceed to sync DOM.
            lastRenderedHotspotsJsonRef.current = newHotspotsJson;

            const viewer = pannellumInstance.current;

            // Remove all old hotspots
            renderedHotspotsRef.current.forEach(id => {
                try {
                    viewer.removeHotSpot(id);
                } catch (e) {
                    console.warn('Failed to remove hotspot', id, e);
                }
            });

            // Add new hotpots
            newHotspotsConfig.forEach(hs => {
                viewer.addHotSpot(hs);
            });

            renderedHotspotsRef.current = newHotspotsConfig.map(h => h.id);
        }

        const viewer = pannellumInstance.current;

        // Update click handler binding based on mode
        try {
            viewer.off('mousedown', handleViewerClick);
        } catch (e) {
            console.warn('Error removing mousedown listener', e);
        }

        if (!isPreviewMode) {
            viewer.on('mousedown', handleViewerClick);
        }

    }, [activeScene?.hotspots, selectedHotspotId, isPreviewMode, handleViewerClick]);



    const updateHotspot = (id: string, updates: Partial<Hotspot>) => {
        setScenes(prev => prev.map(s => {
            if (s.id === activeSceneId) {
                return {
                    ...s,
                    hotspots: s.hotspots.map(h => h.id === id ? { ...h, ...updates } : h)
                };
            }
            return s;
        }));
    };

    const deleteHotspot = (id: string) => {
        setScenes(prev => prev.map(s => {
            if (s.id === activeSceneId) {
                return { ...s, hotspots: s.hotspots.filter(h => h.id !== id) };
            }
            return s;
        }));
        // Note: Actual delete from DB happens on Save
        setSelectedHotspotId(null);
        showToast('Hotspot dihapus');
    };

    const addScene = async () => {
        const newSceneId = crypto.randomUUID();
        const newScene: Scene = {
            id: newSceneId,
            name: `Scene ${scenes.length + 1}`,
            imageUrl: 'https://pannellum.org/images/alma.jpg', // Placeholder
            hotspots: []
        };
        setScenes([...scenes, newScene]);
        setActiveSceneId(newScene.id);
        showToast('Scene dibuat. Silakan upload gambar 360.');
    };

    const handleImageUpload = (sceneId: string) => {
        if (fileInputRef.current) {
            fileInputRef.current.dataset.sceneId = sceneId;
            fileInputRef.current.click();
        }
    };

    const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        const sceneId = e.target.dataset.sceneId;

        if (!file || !sceneId || !tourId) return;

        if (tourId === 'demo') {
            alert('Upload disabled in Demo Mode');
            return;
        }

        // Validate File Size (Input Limit)
        if (file.size > MAX_FILE_SIZE) {
            showToast('File terlalu besar! Maksimal 50MB.');
            e.target.value = '';
            return;
        }

        setLoading(true);
        showToast('Mengompresi gambar...');

        try {
            // Compress
            const compressedFile = await compressImage(file);

            // Re-check output size
            if (compressedFile.size > TARGET_FILE_SIZE) {
                // If still too big after compression attempts
                showToast('Gagal kompresi < 10MB. File terlalu kompleks.');
                setLoading(false);
                return;
            }

            showToast('Mengupload gambar...');

            // Get current scene's old URLs to delete after successful upload
            const currentScene = scenes.find(s => s.id === sceneId);
            const oldImageUrl = currentScene?.imageUrl;
            const oldThumbnailUrl = currentScene?.thumbnailUrl;

            // Helper to extract storage path from public URL
            const getStoragePath = (publicUrl: string | undefined): string | null => {
                if (!publicUrl) return null;
                try {
                    const url = new URL(publicUrl);
                    const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/virtual-tours\/(.+)/);
                    return pathMatch ? pathMatch[1] : null;
                } catch { return null; }
            };

            // Upload to Supabase Storage
            const fileExt = compressedFile.name.split('.').pop() || 'jpg';
            const fileName = `${tourId}/${sceneId}-${Date.now()}.${fileExt}`;
            const { error: uploadError } = await supabase.storage
                .from('virtual-tours')
                .upload(fileName, compressedFile);

            if (uploadError) throw uploadError;

            // Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('virtual-tours')
                .getPublicUrl(fileName);

            // Generate and upload thumbnail for blur placeholder
            showToast('Generating blur preview...');
            let thumbnailUrl: string | undefined;
            try {
                const thumbnailBlob = await generateThumbnail(file); // Use original file for thumbnail
                const thumbFileName = `thumbnails/${tourId}/${sceneId}-${Date.now()}.jpg`;
                const { error: thumbError } = await supabase.storage
                    .from('virtual-tours')
                    .upload(thumbFileName, thumbnailBlob);

                if (!thumbError) {
                    const { data: thumbData } = supabase.storage
                        .from('virtual-tours')
                        .getPublicUrl(thumbFileName);
                    thumbnailUrl = thumbData.publicUrl;
                }
            } catch (thumbErr) {
                console.warn('Thumbnail generation failed, continuing without:', thumbErr);
            }

            // Update State with both URLs
            setScenes(prev => prev.map(s => s.id === sceneId ? { ...s, imageUrl: publicUrl, thumbnailUrl } : s));

            // Delete old files from storage (cleanup)
            const oldImagePath = getStoragePath(oldImageUrl);
            const oldThumbPath = getStoragePath(oldThumbnailUrl);

            // Don't delete placeholder images
            if (oldImagePath && !oldImagePath.includes('pannellum.org')) {
                supabase.storage
                    .from('virtual-tours')
                    .remove([oldImagePath])
                    .then(({ error }) => {
                        if (error) console.warn('Failed to delete old image:', error);
                        else console.log('Deleted old image:', oldImagePath);
                    });
            }
            if (oldThumbPath) {
                supabase.storage
                    .from('virtual-tours')
                    .remove([oldThumbPath])
                    .then(({ error }) => {
                        if (error) console.warn('Failed to delete old thumbnail:', error);
                        else console.log('Deleted old thumbnail:', oldThumbPath);
                    });
            }

            showToast('Upload berhasil!');

        } catch (error) {
            console.error('Upload failed:', error);
            showToast('Gagal upload gambar');
        } finally {
            setLoading(false);
            e.target.value = '';
        }
    };

    const handleNadirUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !tourId) return;

        // Validate File Size
        if (file.size > MAX_FILE_SIZE) {
            showToast('File terlalu besar! Maksimal 50MB.');
            e.target.value = '';
            return;
        }

        setLoading(true);
        showToast('Mengompresi watermark...');

        try {
            // Compress
            const compressedFile = await compressImage(file);

            const fileExt = compressedFile.name.split('.').pop() || 'jpg';
            const fileName = `nadir/${tourId}-${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('virtual-tours')
                .upload(fileName, compressedFile);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('virtual-tours')
                .getPublicUrl(fileName);

            setNadirUrl(publicUrl);
            setNadirEnabled(true); // Auto enable on upload
            showToast('Nadir berhasil diupload!');
        } catch (error) {
            console.error('Nadir upload failed:', error);
            showToast('Gagal upload nadir');
        } finally {
            setLoading(false);
            e.target.value = '';
        }
    };


    const handleTitleSave = () => {
        if (activeScene && editingTitleValue.trim()) {
            setScenes(prev => prev.map(s =>
                s.id === activeScene.id ? { ...s, name: editingTitleValue.trim() } : s
            ));
        }
        setIsEditingTitle(false);
    };

    const handleSave = async () => {
        if (!tourId) return;

        if (tourId === 'demo') {
            alert('Save disabled in Demo Mode');
            return;
        }

        setLoading(true);
        showToast('Menyimpan perubahan...');

        try {
            // 0. Save Tour Settings (Nadir)
            const { error: tourError } = await supabase
                .from('tours')
                .update({
                    nadir_image_url: nadirUrl,
                    nadir_enabled: nadirEnabled,
                    updated_at: new Date().toISOString()
                })
                .eq('id', tourId);

            if (tourError) throw tourError;

            // 1. Sync Rooms
            // To simplify, we upsert all current scenes
            const scenesToUpsert = scenes.map((s, index) => ({
                id: s.id,
                tour_id: tourId,
                name: s.name,
                slug: `${s.name.toLowerCase().replace(/\s+/g, '-')}-${s.id.slice(0, 4)}`, // Simple unique slug
                image_url: s.imageUrl,
                thumbnail_url: s.thumbnailUrl || null, // Blur placeholder
                sequence_order: index, // Save current order
                created_at: new Date().toISOString()
            }));

            const { error: roomsError } = await supabase
                .from('rooms')
                .upsert(scenesToUpsert, { onConflict: 'id' });

            if (roomsError) throw roomsError;

            // 2. Sync Hotspots
            // Delete existing hotspots for these rooms and re-insert (easiest way to handle deletions)
            // Or upsert. But deletions are hard.
            // Strategy: Delete all hotspots in this tour's rooms and re-insert current ones.
            // Warning: This is destructive but simple for "Save All" logic.

            // Collect all hotspot objects
            let allHotspots: any[] = [];
            scenes.forEach(s => {
                s.hotspots.forEach(h => {
                    allHotspots.push({
                        id: h.id,
                        room_id: s.id,
                        type: h.targetSceneId ? 'scene' : 'info',
                        pitch: h.pitch,
                        yaw: h.yaw,
                        text: h.text,
                        icon: h.icon,
                        target_room_id: h.targetSceneId || null
                    });
                });
            });

            // Delete outdated hotspots could be complex. 
            // For now, let's just UPSERT all hotspots. Deleted ones won't be removed from DB properly with this method without valid ID tracking.
            // Better: Delete all hotspots for these rooms, then insert fresh.
            const roomIds = scenes.map(s => s.id);
            if (roomIds.length > 0) {
                await supabase
                    .from('hotspots')
                    .delete()
                    .in('room_id', roomIds);

                if (allHotspots.length > 0) {
                    const { error: hsError } = await supabase
                        .from('hotspots')
                        .insert(allHotspots);
                    if (hsError) throw hsError;
                }
            }

            showToast('Berhasil disimpan!');

        } catch (error) {
            console.error('Error saving tour:', error);
            showToast('Gagal menyimpan');
        } finally {
            setLoading(false);
        }
    };

    // Check if hotspot is navigation type
    const isNavigationIcon = (icon: HotspotIcon) => icon === 'door' || icon === 'arrow';

    // --- COMPRESSION TOOL FUNCTIONS ---

    // Helper to extract storage path from public URL
    const getStoragePathFromUrl = (publicUrl: string | undefined): string | null => {
        if (!publicUrl) return null;
        try {
            const url = new URL(publicUrl);
            const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/virtual-tours\/(.+)/);
            return pathMatch ? pathMatch[1] : null;
        } catch { return null; }
    };

    // Compress a single image by factor
    const compressImageByFactor = async (imageUrl: string, factor: number): Promise<Blob> => {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const img = await createImageBitmap(blob);

        const newWidth = Math.round(img.width / factor);
        const newHeight = Math.round(img.height / factor);

        const canvas = document.createElement('canvas');
        canvas.width = newWidth;
        canvas.height = newHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas context failed');
        ctx.drawImage(img, 0, 0, newWidth, newHeight);
        img.close();

        return new Promise((resolve, reject) => {
            canvas.toBlob((blob) => {
                if (blob) resolve(blob);
                else reject(new Error('Compression failed'));
            }, 'image/jpeg', 0.85);
        });
    };

    // Generate preview for selected scenes
    const handleCompressPreview = async () => {
        if (selectedScenesForCompress.length === 0) {
            showToast('Pilih minimal 1 scene');
            return;
        }

        setIsCompressing(true);
        const newPreviewUrls: { [sceneId: string]: string } = {};

        try {
            for (let i = 0; i < selectedScenesForCompress.length; i++) {
                const sceneId = selectedScenesForCompress[i];
                const scene = scenes.find(s => s.id === sceneId);
                if (!scene || scene.imageUrl.includes('pannellum.org')) continue;

                setCompressionProgress(`Compressing ${i + 1}/${selectedScenesForCompress.length}...`);

                const compressedBlob = await compressImageByFactor(scene.imageUrl, compressionLevel);

                // Upload preview to same bucket (will be cleaned up on cancel or after apply)
                const tempFileName = `${tourId}/${sceneId}-preview-${Date.now()}.jpg`;
                const { error: uploadError } = await supabase.storage
                    .from('virtual-tours')
                    .upload(tempFileName, compressedBlob);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('virtual-tours')
                    .getPublicUrl(tempFileName);

                newPreviewUrls[sceneId] = publicUrl;
            }

            setPreviewUrls(newPreviewUrls);
            setCompressionProgress('Preview ready!');
            showToast('Preview siap! Cek hasilnya.');
        } catch (error) {
            console.error('Compression failed:', error);
            showToast('Gagal membuat preview');
            // Cleanup any temp files created
            for (const url of Object.values(newPreviewUrls)) {
                const path = getStoragePathFromUrl(url);
                if (path) await supabase.storage.from('virtual-tours').remove([path]);
            }
        } finally {
            setIsCompressing(false);
        }
    };

    // Apply compressed previews (replace original)
    const handleCompressApply = async () => {
        if (Object.keys(previewUrls).length === 0) {
            showToast('Buat preview dulu');
            return;
        }

        setIsCompressing(true);
        setCompressionProgress('Applying...');

        try {
            for (const [sceneId, previewUrl] of Object.entries(previewUrls)) {
                const scene = scenes.find(s => s.id === sceneId);
                if (!scene) continue;

                const oldImagePath = getStoragePathFromUrl(scene.imageUrl);
                const oldThumbPath = getStoragePathFromUrl(scene.thumbnailUrl);
                const previewPath = getStoragePathFromUrl(previewUrl);

                // Move preview to permanent location
                const newFileName = `${tourId}/${sceneId}-compressed-${Date.now()}.jpg`;

                // Download from preview URL and re-upload to permanent
                const response = await fetch(previewUrl);
                const blob = await response.blob();

                const { error: uploadError } = await supabase.storage
                    .from('virtual-tours')
                    .upload(newFileName, blob);

                if (uploadError) throw uploadError;

                const { data: { publicUrl: newPublicUrl } } = supabase.storage
                    .from('virtual-tours')
                    .getPublicUrl(newFileName);

                // Update scene state
                setScenes(prev => prev.map(s =>
                    s.id === sceneId ? { ...s, imageUrl: newPublicUrl } : s
                ));

                // Delete old files (original + preview)
                const filesToDelete = [previewPath, oldImagePath, oldThumbPath].filter(Boolean) as string[];
                if (filesToDelete.length > 0) {
                    await supabase.storage.from('virtual-tours').remove(filesToDelete);
                }
            }

            showToast('Kompresi berhasil diterapkan!');
            setPreviewUrls({});
            setIsCompressModalOpen(false);
            setSelectedScenesForCompress([]);
        } catch (error) {
            console.error('Apply failed:', error);
            showToast('Gagal menerapkan kompresi');
        } finally {
            setIsCompressing(false);
            setCompressionProgress('');
        }
    };

    // Cancel and cleanup temp files
    const handleCompressCancel = async () => {
        // Delete all preview files from temp
        for (const url of Object.values(previewUrls)) {
            const path = getStoragePathFromUrl(url);
            if (path) {
                await supabase.storage.from('virtual-tours').remove([path]);
                console.log('Deleted temp file:', path);
            }
        }

        setPreviewUrls({});
        setIsCompressModalOpen(false);
        setSelectedScenesForCompress([]);
        setCompressionProgress('');
        showToast('Dibatalkan, temp files dihapus');
    };

    // Open compress modal
    const openCompressModal = () => {
        setSelectedScenesForCompress([]);
        setPreviewUrls({});
        setCompressionLevel(2);
        setIsCompressModalOpen(true);
    };

    if (loading && scenes.length === 0) {
        return <div className="vt-editor__loading">Loading...</div>;
    }

    return (
        <div className={`vt-editor ${isMaximized ? 'vt-editor--maximized' : ''}`}>
            {/* Hidden Input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={onFileChange}
                style={{ display: 'none' }}
            />
            {/* Hidden Input for Nadir */}
            <input
                ref={nadirInputRef}
                type="file"
                accept="image/*"
                onChange={handleNadirUpload}
                style={{ display: 'none' }}
            />

            {/* Toast */}
            {toast && (
                <div className="vt-editor__toast">
                    <span className="material-icons">check_circle</span>
                    {toast}
                </div>
            )}

            {/* Compression Modal */}
            {isCompressModalOpen && (
                <div className="vt-editor__modal-overlay" onClick={handleCompressCancel}>
                    <div className="vt-editor__modal vt-editor__compress-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="vt-editor__modal-header">
                            <span className="material-icons">compress</span>
                            <h3>Compress Images</h3>
                            <button className="vt-editor__modal-close" onClick={handleCompressCancel}>
                                <span className="material-icons">close</span>
                            </button>
                        </div>

                        <div className="vt-editor__modal-content">
                            {/* Scene Selection */}
                            <div className="compress-section">
                                <label>Pilih Scene:</label>
                                <div className="compress-scene-list">
                                    {scenes.map(scene => (
                                        <label key={scene.id} className="compress-scene-item">
                                            <input
                                                type="checkbox"
                                                checked={selectedScenesForCompress.includes(scene.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedScenesForCompress(prev => [...prev, scene.id]);
                                                    } else {
                                                        setSelectedScenesForCompress(prev => prev.filter(id => id !== scene.id));
                                                    }
                                                }}
                                                disabled={scene.imageUrl.includes('pannellum.org')}
                                            />
                                            <span className="compress-scene-name">{scene.name}</span>
                                            {previewUrls[scene.id] && <span className="compress-preview-badge">✓ Preview</span>}
                                        </label>
                                    ))}
                                </div>
                                <div className="compress-select-actions">
                                    <button onClick={() => setSelectedScenesForCompress(scenes.filter(s => !s.imageUrl.includes('pannellum.org')).map(s => s.id))}>
                                        Select All
                                    </button>
                                    <button onClick={() => setSelectedScenesForCompress([])}>
                                        Deselect All
                                    </button>
                                </div>
                            </div>

                            {/* Compression Level */}
                            <div className="compress-section">
                                <label>Tingkat Kompresi:</label>
                                <div className="compress-levels">
                                    {[
                                        { value: 1.25, label: '1.25x', desc: 'Sedikit' },
                                        { value: 1.5, label: '1.5x', desc: 'Sedang' },
                                        { value: 2, label: '2x', desc: 'Kuat ✓' },
                                        { value: 4, label: '4x', desc: 'Maksimal' }
                                    ].map(level => (
                                        <label key={level.value} className={`compress-level ${compressionLevel === level.value ? 'active' : ''}`}>
                                            <input
                                                type="radio"
                                                name="compressionLevel"
                                                checked={compressionLevel === level.value}
                                                onChange={() => setCompressionLevel(level.value)}
                                            />
                                            <span className="level-value">{level.label}</span>
                                            <span className="level-desc">{level.desc}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Progress */}
                            {compressionProgress && (
                                <div className="compress-progress">
                                    {isCompressing && <div className="compress-spinner"></div>}
                                    {compressionProgress}
                                </div>
                            )}

                            {/* Preview Panel */}
                            {Object.keys(previewUrls).length > 0 && (
                                <div className="compress-section">
                                    <label>Preview ({Object.keys(previewUrls).length} scene):</label>
                                    <div className="compress-preview-grid">
                                        {Object.entries(previewUrls).map(([sceneId, url]) => (
                                            <div key={sceneId} className="compress-preview-item">
                                                <img src={url} alt={`Preview ${sceneId}`} />
                                                <span>{scenes.find(s => s.id === sceneId)?.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="vt-editor__modal-actions">
                            <button
                                className="vt-editor__btn"
                                onClick={handleCompressCancel}
                                disabled={isCompressing}
                            >
                                Cancel
                            </button>
                            {Object.keys(previewUrls).length === 0 ? (
                                <button
                                    className="vt-editor__btn vt-editor__btn--primary"
                                    onClick={handleCompressPreview}
                                    disabled={isCompressing || selectedScenesForCompress.length === 0}
                                >
                                    <span className="material-icons">preview</span>
                                    Preview ({selectedScenesForCompress.length})
                                </button>
                            ) : (
                                <button
                                    className="vt-editor__btn vt-editor__btn--primary"
                                    onClick={handleCompressApply}
                                    disabled={isCompressing}
                                >
                                    <span className="material-icons">check</span>
                                    Apply
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* 1. Base Viewer Layer */}
            <div
                ref={viewerRef}
                className={`vt-editor__viewer ${isAddMode ? 'vt-editor__viewer--add-mode' : ''}`}
            />

            {/* 2. Top Bar (Not Visible in Preview) or Exit Button (Visible in Preview) */}
            {!isPreviewMode ? (
                <div className="vt-editor__top-bar">
                    <div className="vt-editor__title">
                        {isEditingTitle ? (
                            <input
                                autoFocus
                                type="text"
                                className="vt-editor__title-input"
                                value={editingTitleValue}
                                onChange={(e) => setEditingTitleValue(e.target.value)}
                                onBlur={() => handleTitleSave()}
                                onKeyDown={(e) => e.key === 'Enter' && handleTitleSave()}
                                onClick={(e) => e.stopPropagation()}
                            />
                        ) : (
                            <div
                                onClick={() => {
                                    if (activeScene) {
                                        setIsEditingTitle(true);
                                        setEditingTitleValue(activeScene.name);
                                    }
                                }}
                                className="vt-editor__title-text"
                                title="Klik untuk ubah nama"
                            >
                                {activeScene?.name}
                            </div>
                        )}
                    </div>
                    <div className="vt-editor__top-actions">
                        <button
                            className="vt-editor__btn"
                            onClick={() => setIsPreviewMode(true)}
                        >
                            <span className="material-icons">visibility</span>
                            Preview
                        </button>
                        <button
                            className={`vt-editor__btn ${isMaximized ? 'vt-editor__btn--active' : ''}`}
                            onClick={() => {
                                setIsMaximized(!isMaximized);
                                setTimeout(() => {
                                    if (pannellumInstance.current) {
                                        pannellumInstance.current.resize();
                                    }
                                }, 300);
                            }}
                            title={isMaximized ? "Minimize" : "Maximize"}
                        >
                            <span className="material-icons">{isMaximized ? 'fullscreen_exit' : 'fullscreen'}</span>
                        </button>
                        <button
                            className="vt-editor__btn"
                            onClick={openCompressModal}
                            title="Compress Images"
                        >
                            <span className="material-icons">compress</span>
                            Compress
                        </button>
                        <button
                            className="vt-editor__btn vt-editor__btn--primary"
                            onClick={handleSave}
                            disabled={loading}
                        >
                            <span className="material-icons">save</span>
                            {loading ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </div>
            ) : (
                <div style={{ position: 'absolute', top: 24, right: 24, zIndex: 100 }}>
                    <button
                        className="vt-editor__btn vt-editor__btn--primary"
                        onClick={() => setIsPreviewMode(false)}
                        style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
                    >
                        <span className="material-icons">edit</span>
                        Edit Tour
                    </button>
                </div>
            )}

            {/* 3. Floating Toolbar (Not Visible in Preview) */}
            {!isPreviewMode && (
                <div className="vt-editor__toolbar">
                    {HOTSPOT_ICONS.map(iconConfig => (
                        <button
                            key={iconConfig.id}
                            className={`vt-editor__tool-btn ${isAddMode && addModeIcon === iconConfig.id ? 'active' : ''}`}
                            onClick={() => {
                                setAddModeIcon(iconConfig.id);
                                setIsAddMode(!isAddMode || addModeIcon !== iconConfig.id);
                                setSelectedHotspotId(null);
                            }}
                            data-tooltip={`Add ${iconConfig.label}`}
                        >
                            <span className="material-icons">{iconConfig.materialIcon}</span>
                        </button>
                    ))}
                    <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.2)' }} />
                    <button
                        className="vt-editor__tool-btn"
                        onClick={() => handleImageUpload(activeSceneId)}
                        data-tooltip="Ganti Gambar 360"
                    >
                        <span className="material-icons">image</span>
                    </button>
                    <button
                        className={`vt-editor__tool-btn ${nadirEnabled ? 'active' : ''}`}
                        onClick={() => setIsNadirModalOpen(true)}
                        data-tooltip="Watermark Bawah"
                    >
                        <span className="material-icons">branding_watermark</span>
                    </button>
                </div>
            )}

            {/* Nadir Settings Modal */}
            {isNadirModalOpen && (
                <div className="vt-editor__modal-overlay">
                    <div className="vt-editor__modal">
                        <h3>Watermark Bawah (Tripod Cap)</h3>
                        <p className="vt-editor__modal-desc">
                            Tambahkan logo lingkaran di bawah kaki untuk menutupi tripod.
                        </p>

                        <div className="vt-editor__nadir-preview">
                            {nadirUrl ? (
                                <div className="vt-editor__nadir-img-wrapper">
                                    <img src={nadirUrl} alt="Nadir Patch" />
                                </div>
                            ) : (
                                <div className="vt-editor__nadir-placeholder">
                                    Belum ada logo
                                </div>
                            )}
                        </div>

                        <div className="vt-editor__form-group">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={nadirEnabled}
                                    onChange={(e) => setNadirEnabled(e.target.checked)}
                                />
                                <span>Aktifkan Watermark</span>
                            </label>
                        </div>

                        <div className="vt-editor__modal-actions">
                            <button
                                className="vt-editor__btn"
                                onClick={() => nadirInputRef.current?.click()}
                            >
                                <span className="material-icons">upload</span>
                                Upload Logo
                            </button>
                            <button
                                className="vt-editor__btn vt-editor__btn--primary"
                                onClick={() => setIsNadirModalOpen(false)}
                            >
                                Selesai
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 4. Right Properties Panel (Not Visible in Preview) */}
            {!isPreviewMode && selectedHotspot && (
                <div className="vt-editor__panel">
                    <div className="vt-editor__panel-header">
                        <h3>Edit Hotspot</h3>
                        <button onClick={() => setSelectedHotspotId(null)} className="vt-editor__close-btn">
                            <span className="material-icons">close</span>
                        </button>
                    </div>
                    <div className="vt-editor__panel-content">
                        <div className="vt-editor__form-group">
                            <label>Label</label>
                            <input
                                type="text"
                                value={selectedHotspot.text}
                                onChange={(e) => updateHotspot(selectedHotspot.id, { text: e.target.value })}
                            />
                        </div>

                        {isNavigationIcon(selectedHotspot.icon) && (
                            <div className="vt-editor__form-group">
                                <label>Target Scene</label>
                                <select
                                    value={selectedHotspot.targetSceneId || ''}
                                    onChange={(e) => {
                                        const newTargetId = e.target.value;
                                        const targetScene = scenes.find(s => s.id === newTargetId);
                                        updateHotspot(selectedHotspot.id, {
                                            targetSceneId: newTargetId,
                                            // Auto-update text to match scene name if a scene is selected
                                            ...(targetScene ? { text: targetScene.name } : {})
                                        });
                                    }}
                                >
                                    <option value="">Select scene...</option>
                                    {scenes.filter(s => s.id !== activeSceneId).map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <button
                            onClick={() => deleteHotspot(selectedHotspot.id)}
                            style={{
                                width: '100%',
                                padding: '10px',
                                background: 'rgba(239, 68, 68, 0.2)',
                                border: '1px solid rgba(239, 68, 68, 0.5)',
                                color: '#fca5a5',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                marginTop: '12px'
                            }}
                        >
                            Delete Hotspot
                        </button>
                    </div>
                </div>
            )}

            {/* 5. Bottom Filmstrip (Not Visible in Preview) */}
            {!isPreviewMode && (
                <div className="vt-editor__bottom-bar">
                    <div className="vt-editor__filmstrip">
                        {scenes.map((scene) => (

                            <div
                                key={scene.id}
                                className={`vt-editor__scene-card ${activeSceneId === scene.id ? 'active' : ''}`}
                                onClick={() => {
                                    setActiveSceneId(scene.id);
                                    setSelectedHotspotId(null);
                                }}
                                draggable={!isPreviewMode}
                                onDragStart={(e) => {
                                    e.dataTransfer.setData('sceneIndex', scenes.indexOf(scene).toString());
                                    e.dataTransfer.effectAllowed = 'move';
                                }}
                                onDragOver={(e) => {
                                    e.preventDefault(); // Allow drop
                                    e.dataTransfer.dropEffect = 'move';
                                }}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    const sourceIndex = parseInt(e.dataTransfer.getData('sceneIndex'), 10);
                                    const targetIndex = scenes.indexOf(scene);

                                    if (sourceIndex !== targetIndex && !isNaN(sourceIndex)) {
                                        const newScenes = [...scenes];
                                        const [movedScene] = newScenes.splice(sourceIndex, 1);
                                        newScenes.splice(targetIndex, 0, movedScene);
                                        setScenes(newScenes);
                                    }
                                }}
                            >
                                <img src={scene.imageUrl} alt={scene.name} />
                                <div className="vt-editor__scene-name">{scene.name}</div>

                                {/* Delete Button Overlay */}
                                <button
                                    className="vt-editor__delete-scene-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (confirm('Yakin ingin menghapus scene ini?')) {
                                            const newScenes = scenes.filter(s => s.id !== scene.id);
                                            // Handle delete from Supabase if needed, or wait for save
                                            setScenes(newScenes);
                                            if (activeSceneId === scene.id) {
                                                setActiveSceneId(newScenes[0]?.id || '');
                                            }
                                        }
                                    }}
                                    title="Hapus Scene"
                                >
                                    <span className="material-icons" style={{ fontSize: 14 }}>delete</span>
                                </button>
                            </div>
                        ))}
                        <div className="vt-editor__add-scene" onClick={addScene}>
                            <span className="material-icons" style={{ color: 'white' }}>add</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Pannellum Styles Injection */}
            <style>{`
                .pnlm-about-msg { display: none !important; }
                .pnlm-hotspot-base { transition: none !important; }
                
                .editor-hotspot {
                    width: 32px;
                    height: 32px;
                    background: rgba(255,255,255,0.9);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                    transition: transform 0.2s;
                }
                
                .editor-hotspot:hover { transform: scale(1.1); z-index: 10; }
                
                .editor-hotspot--info { color: #3b82f6; }
                .editor-hotspot--door { color: #10b981; }
                .editor-hotspot--arrow { color: #10b981; }
                
                .editor-hotspot--selected {
                    background: #10b981;
                    color: white;
                    box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.3);
                }

                .editor-hotspot__tooltip {
                    position: absolute;
                    bottom: 36px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: rgba(0,0,0,0.8);
                    color: white;
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 11px;
                    white-space: nowrap;
                    opacity: 0;
                    pointer-events: none;
                    transition: opacity 0.2s;
                }
                
                .editor-hotspot:hover .editor-hotspot__tooltip { opacity: 1; }
            `}</style>
        </div>
    );
};

export default VirtualTourEditor;
