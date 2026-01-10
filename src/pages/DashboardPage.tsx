import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import './DashboardPage.css';

interface Tour {
    id: string;
    title: string;
    location: string;
    rooms: number;
    created: string;
    status: 'Published' | 'Draft';
    thumbnail: string;
    views: number;
    isDemo?: boolean; // Khusus untuk link ke /demo page
}

const DashboardPage: React.FC = () => {
    // Mock Data (Nanti diganti data dari Supabase)
    const [tours] = useState<Tour[]>([
        {
            id: 'demo',
            title: 'Luxury Villa Canggu',
            location: 'Canggu, Bali',
            rooms: 4,
            created: '2024-01-05',
            status: 'Published',
            thumbnail: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&q=80',
            views: 2400,
            isDemo: true // Project ini link ke /demo
        },
        {
            id: '2',
            title: 'Modern Apartment BSD',
            location: 'BSD City, Tangerang',
            rooms: 3,
            created: '2024-01-03',
            status: 'Draft',
            thumbnail: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&q=80',
            views: 0
        }
    ]);

    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'Published' | 'Draft'>('all');

    // Calculate stats
    const totalTours = tours.length;
    const publishedTours = tours.filter(t => t.status === 'Published').length;
    const totalViews = tours.reduce((sum, t) => sum + t.views, 0);

    // Filter tours
    const filteredTours = tours.filter(tour => {
        const matchesSearch = tour.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tour.location.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterStatus === 'all' || tour.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const formatViews = (views: number): string => {
        if (views >= 1000) {
            return (views / 1000).toFixed(1) + 'k';
        }
        return views.toString();
    };

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
                        <Link to="/editor/new" className="dashboard__btn-primary">
                            <span className="material-icons">add</span>
                            Buat Tour Baru
                        </Link>
                    </div>

                    {/* Enhanced Stats Cards */}
                    <div className="dashboard__stats">
                        <div className="dashboard__stat-card dashboard__stat-card--primary">
                            <div className="dashboard__stat-icon-wrapper dashboard__stat-icon-wrapper--primary">
                                <span className="material-icons">view_in_ar</span>
                            </div>
                            <div className="dashboard__stat-info">
                                <span className="dashboard__stat-value">{totalTours}</span>
                                <span className="dashboard__stat-label">Total Tour</span>
                            </div>
                            <div className="dashboard__stat-trend dashboard__stat-trend--up">
                                <span className="material-icons">trending_up</span>
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
                            <div className="dashboard__stat-badge">Live</div>
                        </div>

                        <div className="dashboard__stat-card dashboard__stat-card--warning">
                            <div className="dashboard__stat-icon-wrapper dashboard__stat-icon-wrapper--warning">
                                <span className="material-icons">visibility</span>
                            </div>
                            <div className="dashboard__stat-info">
                                <span className="dashboard__stat-value">{formatViews(totalViews)}</span>
                                <span className="dashboard__stat-label">Total Views</span>
                            </div>
                            <div className="dashboard__stat-trend dashboard__stat-trend--up">
                                <span className="material-icons">trending_up</span>
                                <span>12%</span>
                            </div>
                        </div>
                    </div>

                    {/* Project Section */}
                    <div className="dashboard__content">
                        {/* Section Header with Search & Filter */}
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
                                <div className="dashboard__filter-buttons">
                                    <button
                                        className={`dashboard__filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
                                        onClick={() => setFilterStatus('all')}
                                    >
                                        Semua
                                    </button>
                                    <button
                                        className={`dashboard__filter-btn ${filterStatus === 'Published' ? 'active' : ''}`}
                                        onClick={() => setFilterStatus('Published')}
                                    >
                                        Published
                                    </button>
                                    <button
                                        className={`dashboard__filter-btn ${filterStatus === 'Draft' ? 'active' : ''}`}
                                        onClick={() => setFilterStatus('Draft')}
                                    >
                                        Draft
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Project Cards Grid */}
                        {filteredTours.length > 0 ? (
                            <div className="dashboard__cards-grid">
                                {filteredTours.map(tour => (
                                    <div key={tour.id} className="dashboard__project-card">
                                        <div className="dashboard__card-thumbnail">
                                            <img src={tour.thumbnail} alt={tour.title} />
                                            <div className="dashboard__card-overlay">
                                                <Link
                                                    to={tour.isDemo ? `/editor/demo/360` : `/editor/${tour.id}/360`}
                                                    className="dashboard__card-action-btn"
                                                >
                                                    <span className="material-icons">360</span>
                                                    Edit 360
                                                </Link>
                                            </div>
                                            <span className={`dashboard__card-status ${tour.status === 'Published' ? 'published' : 'draft'}`}>
                                                {tour.status}
                                            </span>
                                        </div>
                                        <div className="dashboard__card-content">
                                            <h3 className="dashboard__card-title">{tour.title}</h3>
                                            <p className="dashboard__card-location">
                                                <span className="material-icons">location_on</span>
                                                {tour.location}
                                            </p>
                                            <div className="dashboard__card-meta">
                                                <span className="dashboard__card-rooms">
                                                    <span className="material-icons">meeting_room</span>
                                                    {tour.rooms} Ruangan
                                                </span>
                                                <span className="dashboard__card-views">
                                                    <span className="material-icons">visibility</span>
                                                    {formatViews(tour.views)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="dashboard__card-actions">
                                            <Link to={`/editor/${tour.id}`} className="dashboard__card-btn dashboard__card-btn--edit">
                                                <span className="material-icons">edit</span>
                                                Edit Info
                                            </Link>
                                            <Link
                                                to={tour.isDemo ? '/demo' : `/tour/${tour.id}`}
                                                className="dashboard__card-btn dashboard__card-btn--preview"
                                            >
                                                <span className="material-icons">visibility</span>
                                                Preview
                                            </Link>
                                            <button className="dashboard__card-btn dashboard__card-btn--delete">
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
                                <p>Mulai buat virtual tour pertama Anda dan tampilkan properti dengan cara yang memukau.</p>
                                <Link to="/editor/new" className="dashboard__btn-primary">
                                    <span className="material-icons">add</span>
                                    Buat Tour Pertama
                                </Link>
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
