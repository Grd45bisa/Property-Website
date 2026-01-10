import React, { useState, useEffect, useRef } from 'react';
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
    hotspots: Hotspot[];
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

// Removed interface
const VirtualTourEditor: React.FC = () => {
    const viewerRef = useRef<HTMLDivElement>(null);
    const pannellumInstance = useRef<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // State
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);
    const [scenes, setScenes] = useState<Scene[]>([
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
        },
        {
            id: '3',
            name: 'Master Bedroom',
            imageUrl: 'https://pannellum.org/images/bma-1.jpg',
            hotspots: []
        }
    ]);

    const [activeSceneId, setActiveSceneId] = useState<string>('1');
    const [isAddMode, setIsAddMode] = useState(false);
    const [addModeIcon, setAddModeIcon] = useState<HotspotIcon>('info');
    const [selectedHotspotId, setSelectedHotspotId] = useState<string | null>(null);
    const [toast, setToast] = useState<string | null>(null);

    const activeScene = scenes.find(s => s.id === activeSceneId) || scenes[0];
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
    useEffect(() => { isAddModeRef.current = isAddMode; }, [isAddMode]);
    useEffect(() => { addModeIconRef.current = addModeIcon; }, [addModeIcon]);

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

            const hotSpots = activeScene.hotspots.map(createHotspotConfig);

            pannellumInstance.current = window.pannellum.viewer(viewerRef.current, {
                type: 'equirectangular',
                panorama: activeScene.imageUrl,
                autoLoad: true,
                showControls: !isPreviewMode,
                showFullscreenCtrl: false,
                hotSpots: hotSpots,
                pitch: 0,
                yaw: 0,
                hfov: 100
            });

            // Event listener for adding hotspots
            pannellumInstance.current.on('mousedown', handleViewerClick);

            // Update refs
            renderedHotspotsRef.current = hotSpots.map(h => h.id);
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
    }, [activeSceneId, activeScene?.imageUrl]); // Only re-run if scene ID or Image URL changes

    // 3. Sync Hotspots & Mode (Run when hotspots/selection/mode changes, WITHOUT destroying viewer)
    useEffect(() => {
        if (!pannellumInstance.current || currentSceneIdRef.current !== activeSceneId) return;

        const viewer = pannellumInstance.current;

        // Remove all old hotspots
        renderedHotspotsRef.current.forEach(id => {
            viewer.removeHotSpot(id);
        });

        // Add new hotpots
        if (activeScene) {
            const newHotspots = activeScene.hotspots.map(createHotspotConfig);
            newHotspots.forEach(hs => {
                viewer.addHotSpot(hs);
            });
            renderedHotspotsRef.current = newHotspots.map(h => h.id);
        }

        // Update click handler binding based on mode
        viewer.off('mousedown', handleViewerClick);
        if (!isPreviewMode) {
            viewer.on('mousedown', handleViewerClick);
        }

    }, [activeScene?.hotspots, selectedHotspotId, isPreviewMode]);

    const handleViewerClick = (event: MouseEvent) => {
        if (!isAddModeRef.current || !pannellumInstance.current) return;

        const [pitch, yaw] = pannellumInstance.current.mouseEventToCoords(event);
        addNewHotspot(pitch, yaw, addModeIconRef.current);
    };

    const addNewHotspot = (pitch: number, yaw: number, icon: HotspotIcon) => {
        const isNavigation = icon === 'door' || icon === 'arrow';
        const newHotspot: Hotspot = {
            id: Date.now().toString(),
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
        setSelectedHotspotId(null);
        showToast('Hotspot dihapus');
    };

    const addScene = () => {
        const newScene: Scene = {
            id: Date.now().toString(),
            name: `Scene ${scenes.length + 1}`,
            imageUrl: 'https://pannellum.org/images/jd.jpg',
            hotspots: []
        };
        setScenes([...scenes, newScene]);
        setActiveSceneId(newScene.id);
        showToast('Scene baru ditambahkan');
    };

    const handleImageUpload = (sceneId: string) => {
        if (fileInputRef.current) {
            fileInputRef.current.dataset.sceneId = sceneId;
            fileInputRef.current.click();
        }
    };

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        const sceneId = e.target.dataset.sceneId;
        if (file && sceneId) {
            const url = URL.createObjectURL(file);
            setScenes(prev => prev.map(s => s.id === sceneId ? { ...s, imageUrl: url } : s));
            showToast('Gambar 360° diupload');
        }
        e.target.value = '';
    };

    // Check if hotspot is navigation type
    const isNavigationIcon = (icon: HotspotIcon) => icon === 'door' || icon === 'arrow';

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

            {/* Toast */}
            {toast && (
                <div className="vt-editor__toast">
                    <span className="material-icons">check_circle</span>
                    {toast}
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
                        {activeScene?.name}
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
                                // Optional: trigger resize if needed by pannellum, though CSS size change usually handles it
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
                        <button className="vt-editor__btn vt-editor__btn--primary">
                            <span className="material-icons">save</span>
                            Save
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
                        data-tooltip="Change Image"
                    >
                        <span className="material-icons">image</span>
                    </button>
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
                                    onChange={(e) => updateHotspot(selectedHotspot.id, { targetSceneId: e.target.value })}
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
                                            if (newScenes.length === 0) {
                                                showToast('Minimal harus ada 1 scene');
                                                return;
                                            }
                                            setScenes(newScenes);
                                            if (activeSceneId === scene.id) {
                                                setActiveSceneId(newScenes[0].id);
                                            }
                                            showToast('Scene dihapus');
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
