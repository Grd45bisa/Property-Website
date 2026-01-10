import React, { useState } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar/Navbar';
import VirtualTourEditor from '../components/Editor/VirtualTourEditor';
import './EditTourPage.css';

const EditTourPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const location = useLocation();
    const pathname = location.pathname;

    // Determine active tab from URL
    type TabType = 'info' | '360' | 'share' | 'gallery' | 'settings';

    const getActiveTab = (): TabType => {
        if (pathname.includes('/360')) return '360';
        if (pathname.includes('/share')) return 'share';
        if (pathname.includes('/gallery')) return 'gallery';
        if (pathname.includes('/settings')) return 'settings';
        return 'info';
    };
    const activeTab = getActiveTab();

    // Mock Data (Simulasi data yang ditarik dari DB)
    const [formData, setFormData] = useState({
        title: 'Luxury Villa Canggu',
        description: 'Villa mewah 4 kamar tidur dengan kolam renang pribadi dan pemandangan sawah.',
        location: 'Canggu, Bali',
        price: 'IDR 8.5 M',
        agentName: 'Budi Santoso',
        agentWhatsapp: '6281234567890',
        coverImage: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    });

    // Share/Embed state
    const [embedSize, setEmbedSize] = useState<'responsive' | 'fixed'>('responsive');
    const [embedWidth, setEmbedWidth] = useState('100%');
    const [embedHeight, setEmbedHeight] = useState('500');
    const [copied, setCopied] = useState<'link' | 'embed' | null>(null);

    // Generate URLs
    const baseUrl = window.location.origin;
    const tourUrl = `${baseUrl}/tour/${id}`;
    const embedCode = embedSize === 'responsive'
        ? `<iframe src="${tourUrl}?embed=true" style="width: 100%; height: ${embedHeight}px; border: none;" allowfullscreen></iframe>`
        : `<iframe src="${tourUrl}?embed=true" width="${embedWidth}" height="${embedHeight}" style="border: none;" allowfullscreen></iframe>`;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        alert('Data berhasil disimpan! (Simulasi)');
    };

    const copyToClipboard = (text: string, type: 'link' | 'embed') => {
        navigator.clipboard.writeText(text);
        setCopied(type);
        setTimeout(() => setCopied(null), 2000);
    };

    // Navigation items
    const navItems = [
        { id: 'info', path: `/editor/${id}`, icon: 'info', label: 'Informasi Umum' },
        { id: '360', path: `/editor/${id}/360`, icon: '360', label: 'Virtual Tour 360°' },
        { id: 'gallery', path: `/editor/${id}/gallery`, icon: 'image', label: 'Galeri Foto' },
        { id: 'share', path: `/editor/${id}/share`, icon: 'share', label: 'Share & Embed' },
        { id: 'settings', path: `/editor/${id}/settings`, icon: 'settings', label: 'Pengaturan' },
    ];

    return (
        <div className="page-wrapper">
            <Navbar />

            <main className="editor-layout">
                {/* Sidebar Navigation */}
                <aside className="editor-sidebar">
                    <div className="editor-sidebar__header">
                        <Link to="/dashboard" className="editor-sidebar__back">
                            <span className="material-icons">arrow_back</span>
                            Dashboard
                        </Link>
                    </div>

                    {/* Project Info */}
                    <div className="editor-sidebar__project">
                        <img src={formData.coverImage} alt={formData.title} className="editor-sidebar__thumb" />
                        <div className="editor-sidebar__project-info">
                            <h3 className="editor-sidebar__project-title">{formData.title}</h3>
                            <span className="editor-sidebar__project-status">Published</span>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="editor-nav">
                        {navItems.map(item => (
                            <Link
                                key={item.id}
                                to={item.path}
                                className={`editor-nav__item ${activeTab === item.id ? 'editor-nav__item--active' : ''}`}
                            >
                                <span className="material-icons">{item.icon}</span>
                                {item.label}
                                {item.id === 'share' && (
                                    <span className="editor-nav__badge">New</span>
                                )}
                            </Link>
                        ))}
                    </nav>
                </aside>

                {/* Main Content */}
                <div className={`editor-content ${activeTab === '360' ? 'editor-content--full' : ''}`}>
                    {activeTab !== '360' && (
                        <header className="editor-header">
                            <h1 className="editor-title">
                                {activeTab === 'info' && `Edit Project: ${formData.title}`}
                                {activeTab === 'share' && 'Share & Embed'}
                                {activeTab === 'gallery' && 'Galeri Foto'}
                                {activeTab === 'settings' && 'Pengaturan'}
                            </h1>
                            <div className="editor-actions">
                                <Link to={id === 'demo' ? '/demo' : `/tour/${id}`} target="_blank" className="editor-btn-secondary">
                                    <span className="material-icons">visibility</span>
                                    Preview
                                </Link>
                                {activeTab !== 'share' && (
                                    <button onClick={handleSave} className="editor-btn-primary">
                                        <span className="material-icons">save</span>
                                        Simpan
                                    </button>
                                )}
                            </div>
                        </header>
                    )}

                    {/* 360 Editor Tab */}
                    {activeTab === '360' && (
                        <div className="editor-form editor-form--360">
                            <VirtualTourEditor />
                        </div>
                    )}

                    {/* Info Tab */}
                    {activeTab === 'info' && (
                        <form className="editor-form" onSubmit={handleSave}>
                            <section className="editor-section">
                                <h2 className="editor-section-title">Informasi Dasar</h2>

                                <div className="form-group">
                                    <label className="form-label">Nama Properti / Project</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        className="form-input"
                                        placeholder="Contoh: Modern House BSD"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Deskripsi Singkat</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        className="form-textarea"
                                        rows={4}
                                        placeholder="Jelaskan keunggulan properti ini..."
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Lokasi</label>
                                        <input
                                            type="text"
                                            name="location"
                                            value={formData.location}
                                            onChange={handleChange}
                                            className="form-input"
                                            placeholder="Kota, Area"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Harga (Display)</label>
                                        <input
                                            type="text"
                                            name="price"
                                            value={formData.price}
                                            onChange={handleChange}
                                            className="form-input"
                                            placeholder="Contoh: IDR 2.5 M (Opsional)"
                                        />
                                    </div>
                                </div>
                            </section>

                            <section className="editor-section">
                                <h2 className="editor-section-title">Media & Kontak</h2>

                                <div className="form-group">
                                    <label className="form-label">Cover Image (Thumbnail)</label>
                                    <div className="image-upload-preview">
                                        <img src={formData.coverImage} alt="Cover Preview" className="image-preview" />
                                        <button type="button" className="btn-upload">
                                            <span className="material-icons">cloud_upload</span>
                                            Ganti Gambar
                                        </button>
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Nama Agen</label>
                                        <input
                                            type="text"
                                            name="agentName"
                                            value={formData.agentName}
                                            onChange={handleChange}
                                            className="form-input"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">WhatsApp Agen (Format: 628...)</label>
                                        <input
                                            type="text"
                                            name="agentWhatsapp"
                                            value={formData.agentWhatsapp}
                                            onChange={handleChange}
                                            className="form-input"
                                            placeholder="62812345678"
                                        />
                                    </div>
                                </div>
                            </section>
                        </form>
                    )}

                    {/* Share & Embed Tab */}
                    {activeTab === 'share' && (
                        <div className="share-section">
                            {/* Direct Link */}
                            <section className="share-card">
                                <div className="share-card__header">
                                    <span className="material-icons share-card__icon">link</span>
                                    <div>
                                        <h3 className="share-card__title">Link Virtual Tour</h3>
                                        <p className="share-card__desc">Share link ini ke calon pembeli atau posting di media sosial</p>
                                    </div>
                                </div>
                                <div className="share-card__content">
                                    <div className="share-input-group">
                                        <input
                                            type="text"
                                            value={tourUrl}
                                            readOnly
                                            className="share-input"
                                        />
                                        <button
                                            onClick={() => copyToClipboard(tourUrl, 'link')}
                                            className={`share-copy-btn ${copied === 'link' ? 'copied' : ''}`}
                                        >
                                            <span className="material-icons">
                                                {copied === 'link' ? 'check' : 'content_copy'}
                                            </span>
                                            {copied === 'link' ? 'Tersalin!' : 'Salin'}
                                        </button>
                                    </div>
                                    <a href={tourUrl} target="_blank" rel="noopener noreferrer" className="share-preview-link">
                                        <span className="material-icons">open_in_new</span>
                                        Buka di tab baru
                                    </a>
                                </div>
                            </section>

                            {/* Embed Code */}
                            <section className="share-card">
                                <div className="share-card__header">
                                    <span className="material-icons share-card__icon">code</span>
                                    <div>
                                        <h3 className="share-card__title">Embed di Website</h3>
                                        <p className="share-card__desc">Pasang virtual tour di website Anda dengan iframe</p>
                                    </div>
                                </div>
                                <div className="share-card__content">
                                    {/* Embed Options */}
                                    <div className="embed-options">
                                        <label className="embed-option">
                                            <input
                                                type="radio"
                                                name="embedSize"
                                                checked={embedSize === 'responsive'}
                                                onChange={() => setEmbedSize('responsive')}
                                            />
                                            <span className="embed-option__label">
                                                <span className="material-icons">aspect_ratio</span>
                                                Responsive (100% width)
                                            </span>
                                        </label>
                                        <label className="embed-option">
                                            <input
                                                type="radio"
                                                name="embedSize"
                                                checked={embedSize === 'fixed'}
                                                onChange={() => setEmbedSize('fixed')}
                                            />
                                            <span className="embed-option__label">
                                                <span className="material-icons">crop_free</span>
                                                Fixed Size
                                            </span>
                                        </label>
                                    </div>

                                    {/* Size inputs for fixed */}
                                    {embedSize === 'fixed' && (
                                        <div className="embed-size-inputs">
                                            <div className="embed-size-input">
                                                <label>Width</label>
                                                <input
                                                    type="text"
                                                    value={embedWidth}
                                                    onChange={(e) => setEmbedWidth(e.target.value)}
                                                    placeholder="800"
                                                />
                                            </div>
                                            <span className="embed-size-x">×</span>
                                            <div className="embed-size-input">
                                                <label>Height</label>
                                                <input
                                                    type="text"
                                                    value={embedHeight}
                                                    onChange={(e) => setEmbedHeight(e.target.value)}
                                                    placeholder="500"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Height for responsive */}
                                    {embedSize === 'responsive' && (
                                        <div className="embed-height-input">
                                            <label>Height (px)</label>
                                            <input
                                                type="text"
                                                value={embedHeight}
                                                onChange={(e) => setEmbedHeight(e.target.value)}
                                                placeholder="500"
                                            />
                                        </div>
                                    )}

                                    {/* Embed Code */}
                                    <div className="embed-code-wrapper">
                                        <pre className="embed-code">{embedCode}</pre>
                                        <button
                                            onClick={() => copyToClipboard(embedCode, 'embed')}
                                            className={`share-copy-btn share-copy-btn--code ${copied === 'embed' ? 'copied' : ''}`}
                                        >
                                            <span className="material-icons">
                                                {copied === 'embed' ? 'check' : 'content_copy'}
                                            </span>
                                            {copied === 'embed' ? 'Tersalin!' : 'Salin Kode'}
                                        </button>
                                    </div>

                                    {/* Preview */}
                                    <div className="embed-preview">
                                        <h4 className="embed-preview__title">Preview</h4>
                                        <div className="embed-preview__frame" style={{ height: `${Math.min(parseInt(embedHeight) || 300, 400)}px` }}>
                                            <iframe
                                                src={id === 'demo' ? '/demo' : `/tour/${id}`}
                                                style={{ width: '100%', height: '100%', border: 'none' }}
                                                title="Tour Preview"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* QR Code - Coming Soon */}
                            <section className="share-card share-card--coming-soon">
                                <div className="share-card__header">
                                    <span className="material-icons share-card__icon">qr_code_2</span>
                                    <div>
                                        <h3 className="share-card__title">QR Code</h3>
                                        <p className="share-card__desc">Generate QR code untuk mempermudah akses via mobile</p>
                                    </div>
                                    <span className="coming-soon-badge">Coming Soon</span>
                                </div>
                            </section>
                        </div>
                    )}

                    {/* Gallery Tab Placeholder */}
                    {activeTab === 'gallery' && (
                        <div className="placeholder-section">
                            <span className="material-icons placeholder-icon">image</span>
                            <h3>Galeri Foto</h3>
                            <p>Upload dan kelola foto-foto properti di sini.</p>
                        </div>
                    )}

                    {/* Settings Tab Placeholder */}
                    {activeTab === 'settings' && (
                        <div className="placeholder-section">
                            <span className="material-icons placeholder-icon">settings</span>
                            <h3>Pengaturan</h3>
                            <p>Konfigurasi lanjutan untuk tour Anda.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default EditTourPage;
