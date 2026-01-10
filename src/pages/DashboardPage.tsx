import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import { supabase } from '../lib/supabaseClient';
import './DashboardPage.css';

interface Tour {
    id: string;
    title: string;
    description?: string;
    rooms: number; // Count from relation
    created_at: string;
    thumbnail_url: string;
    views?: number; // Optional, add to schema if essential
    isDemo?: boolean;
}

const DashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const [tours, setTours] = useState<Tour[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch Tours
    useEffect(() => {
        fetchTours();
    }, []);

    const fetchTours = async () => {
        try {
            setLoading(true);

            // Get user session
            const { data: { user } } = await supabase.auth.getUser();

            // Base query
            let query = supabase
                .from('tours')
                .select(`
                    *,
                    rooms:rooms!rooms_tour_id_fkey (count)
                `)
                .order('created_at', { ascending: false });

            // If user logged in, filter by user (RLS handles this usually, but good to be explicit/safe)
            if (user) {
                query = query.eq('user_id', user.id);
            }

            const { data, error } = await query;

            if (error) throw error;

            if (data) {
                const formattedTours: Tour[] = data.map((item: any) => ({
                    id: item.id,
                    title: item.title,
                    description: item.description || '',
                    rooms: item.rooms?.[0]?.count || 0,
                    created_at: item.created_at,
                    thumbnail_url: item.thumbnail_url || 'https://via.placeholder.com/400x300?text=No+Image',
                    views: 0,
                    isDemo: false
                }));
                setTours(formattedTours);
            }
        } catch (error) {
            console.error('Error fetching tours:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this tour?')) return;

        try {
            const { error } = await supabase
                .from('tours')
                .delete()
                .eq('id', id);

            if (error) throw error;

            // Remove from local state
            setTours(prev => prev.filter(t => t.id !== id));
        } catch (error) {
            console.error('Error deleting tour:', error);
            alert('Failed to delete tour');
        }
    };

    const createNewTour = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                alert('Please login first');
                return;
            }

            const { data, error } = await supabase
                .from('tours')
                .insert({
                    user_id: user.id,
                    title: 'Untitled Project',
                    slug: `tour-${Date.now()}`,
                    thumbnail_url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&q=80'
                })
                .select()
                .single();

            if (error) throw error;

            if (data) {
                navigate(`/editor/${data.id}`);
            }
        } catch (error) {
            console.error('Error creating tour:', error);
            alert('Gagal membuat tour baru');
        }
    };

    const handleDuplicate = async (tourId: string) => {
        if (!confirm('Duplicate this tour?')) return;
        setLoading(true);
        try {
            // 1. Get original tour
            const { data: originalTour, error: tourError } = await supabase
                .from('tours')
                .select('*')
                .eq('id', tourId)
                .single();

            if (tourError) throw tourError;

            // 2. Create new tour
            const { data: newTour, error: createError } = await supabase
                .from('tours')
                .insert({
                    user_id: originalTour.user_id,
                    title: `Copy of ${originalTour.title}`,
                    description: originalTour.description,
                    thumbnail_url: originalTour.thumbnail_url,
                    nadir_image_url: originalTour.nadir_image_url,
                    nadir_enabled: originalTour.nadir_enabled,
                    slug: `${originalTour.slug}-copy-${Date.now()}`
                })
                .select()
                .single();

            if (createError) throw createError;

            // 3. Get original rooms
            const { data: rooms, error: roomsError } = await supabase
                .from('rooms')
                .select('*')
                .eq('tour_id', tourId);

            if (roomsError) throw roomsError;

            if (rooms && rooms.length > 0) {
                // 4. Map and Insert Rooms
                const roomMap = new Map<string, string>();

                for (const room of rooms) {
                    const { data: newRoom, error: roomInsertError } = await supabase
                        .from('rooms')
                        .insert({
                            tour_id: newTour.id,
                            name: room.name,
                            slug: `${room.slug}-copy-${Date.now()}`,
                            image_url: room.image_url,
                            sequence_order: room.sequence_order
                        })
                        .select()
                        .single();

                    if (roomInsertError) throw roomInsertError;
                    roomMap.set(room.id, newRoom.id);
                }

                // 5. Get original hotspots
                const { data: hotspots, error: hsError } = await supabase
                    .from('hotspots')
                    .select('*')
                    .in('room_id', rooms.map(r => r.id));

                if (hsError) throw hsError;

                if (hotspots && hotspots.length > 0) {
                    // 6. Map Hotspots
                    const newHotspots = hotspots.map((hs: any) => ({
                        room_id: roomMap.get(hs.room_id),
                        type: hs.type,
                        pitch: hs.pitch,
                        yaw: hs.yaw,
                        text: hs.text,
                        target_room_id: hs.target_room_id ? roomMap.get(hs.target_room_id) : null,
                        icon: hs.icon
                    }));

                    const { error: hsInsertError } = await supabase
                        .from('hotspots')
                        .insert(newHotspots);

                    if (hsInsertError) throw hsInsertError;
                }
            }

            alert('Tour duplicated successfully!');
            fetchTours(); // Refresh list

        } catch (error) {
            console.error('Error duplicating tour:', error);
            alert('Failed to duplicate tour');
        } finally {
            setLoading(false);
        }
    };

    // Calculate stats
    const totalTours = tours.length;
    const publishedTours = tours.length; // Assuming all are published for now
    // Filter tours
    const filteredTours = tours.filter(tour => {
        const matchesSearch = tour.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    return (
        <div className="page-wrapper">
            <Navbar />

            <main className="dashboard">
                <div className="dashboard__container">
                    {/* Header */}
                    <div className="dashboard__header">
                        <div className="dashboard__header-content">
                            <h1 className="dashboard__title">Dashboard Virtual Tour</h1>
                            <p className="dashboard__subtitle">Kelola semua project virtual tour Anda</p>
                        </div>
                        <button onClick={createNewTour} className="dashboard__btn-primary">
                            <span className="material-icons">add</span>
                            Buat Tour Baru
                        </button>
                    </div>

                    {/* Stats Cards */}
                    <div className="dashboard__stats">
                        <div className="dashboard__stat-card dashboard__stat-card--primary">
                            <div className="dashboard__stat-icon-wrapper dashboard__stat-icon-wrapper--primary">
                                <span className="material-icons">view_in_ar</span>
                            </div>
                            <div className="dashboard__stat-info">
                                <span className="dashboard__stat-value">{totalTours}</span>
                                <span className="dashboard__stat-label">Total Tour</span>
                            </div>
                        </div>

                        <div className="dashboard__stat-card dashboard__stat-card--success">
                            <div className="dashboard__stat-icon-wrapper dashboard__stat-icon-wrapper--success">
                                <span className="material-icons">public</span>
                            </div>
                            <div className="dashboard__stat-info">
                                <span className="dashboard__stat-value">{publishedTours}</span>
                                <span className="dashboard__stat-label">Published</span>
                            </div>
                        </div>
                    </div>

                    {/* Project Section */}
                    <div className="dashboard__content">
                        {/* Section Header with Search */}
                        <div className="dashboard__section-header">
                            <h2 className="dashboard__section-title">
                                <span className="material-icons">folder_open</span>
                                Daftar Project
                            </h2>
                            <div className="dashboard__filters">
                                <div className="dashboard__search">
                                    <span className="material-icons">search</span>
                                    <input
                                        type="text"
                                        placeholder="Cari project..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Project Cards Grid */}
                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '40px' }}>Loading projects...</div>
                        ) : filteredTours.length > 0 ? (
                            <div className="dashboard__cards-grid">
                                {filteredTours.map(tour => (
                                    <div key={tour.id} className="dashboard__project-card">
                                        <div className="dashboard__card-thumbnail">
                                            <img src={tour.thumbnail_url} alt={tour.title} />
                                            <div className="dashboard__card-overlay">
                                                <Link
                                                    to={`/editor/${tour.id}`}
                                                    className="dashboard__card-action-btn"
                                                >
                                                    <span className="material-icons">edit</span>
                                                    Edit
                                                </Link>
                                            </div>
                                        </div>
                                        <div className="dashboard__card-content">
                                            <h3 className="dashboard__card-title">{tour.title}</h3>
                                            <p className="dashboard__card-location">
                                                {new Date(tour.created_at).toLocaleDateString()}
                                            </p>
                                            <div className="dashboard__card-meta">
                                                <span className="dashboard__card-rooms">
                                                    <span className="material-icons">meeting_room</span>
                                                    {tour.rooms} Rooms
                                                </span>
                                            </div>
                                        </div>
                                        <div className="dashboard__card-actions">
                                            <Link to={`/editor/${tour.id}`} className="dashboard__card-btn dashboard__card-btn--edit">
                                                <span className="material-icons">edit</span>
                                                Editor
                                            </Link>
                                            <Link
                                                to={`/tour/${tour.id}`}
                                                className="dashboard__card-btn dashboard__card-btn--preview"
                                            >
                                                <span className="material-icons">visibility</span>
                                                Preview
                                            </Link>
                                            <button
                                                className="dashboard__card-btn dashboard__card-btn--duplicate"
                                                onClick={() => handleDuplicate(tour.id)}
                                                title="Duplicate Tour"
                                            >
                                                <span className="material-icons">content_copy</span>
                                            </button>
                                            <button
                                                className="dashboard__card-btn dashboard__card-btn--delete"
                                                onClick={() => handleDelete(tour.id)}
                                                title="Delete Tour"
                                            >
                                                <span className="material-icons">delete</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="dashboard__empty-state">
                                <div className="dashboard__empty-icon">
                                    <span className="material-icons">add_photo_alternate</span>
                                </div>
                                <h3>Belum ada project</h3>
                                <p>Mulai buat virtual tour pertama Anda.</p>
                                <button onClick={createNewTour} className="dashboard__btn-primary">
                                    <span className="material-icons">add</span>
                                    Buat Tour Pertama
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default DashboardPage;
