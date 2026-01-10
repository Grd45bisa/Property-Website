import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

interface NavLink {
    label: string;
    href: string;
}

const Navbar: React.FC = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    const whatsappNumber = '6281234567890';
    const whatsappMessage = encodeURIComponent('Halo, saya tertarik dengan layanan virtual tour.');

    const navLinks: NavLink[] = [
        { label: 'Portfolio', href: '/#portfolio' },
        { label: 'Harga', href: '/#pricing' },
        { label: 'Cara Kerja', href: '/#process' },
        // { label: 'Blog', href: '/blog' },
    ];

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isMobileMenuOpen]);

    const handleLinkClick = () => {
        setIsMobileMenuOpen(false);
    };

    return (
        <>
            <nav
                className={`navbar ${isScrolled ? 'navbar--scrolled' : ''}`}
                role="navigation"
                aria-label="Main navigation"
            >
                <div className="navbar__container">
                    {/* Logo */}
                    <Link to="/" className="navbar__logo" aria-label="VirtuTour Home">
                        <span className="material-icons navbar__logo-icon" aria-hidden="true">
                            view_in_ar
                        </span>
                        <span className="navbar__logo-text">VirtuTour</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="navbar__nav">
                        {navLinks.map((link) => (
                            link.href.startsWith('/') ? (
                                <Link
                                    key={link.label}
                                    to={link.href}
                                    className="navbar__link"
                                >
                                    {link.label}
                                </Link>
                            ) : (
                                <a
                                    key={link.label}
                                    href={link.href}
                                    className="navbar__link"
                                >
                                    {link.label}
                                </a>
                            )
                        ))}
                    </div>

                    {/* CTA Button */}
                    <a
                        href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="navbar__cta"
                        aria-label="Hubungi kami via WhatsApp"
                    >
                        <span className="material-icons navbar__cta-icon" aria-hidden="true">
                            chat
                        </span>
                        <span>Hubungi Kami</span>
                    </a>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="navbar__toggle"
                        onClick={() => setIsMobileMenuOpen(true)}
                        aria-expanded={isMobileMenuOpen}
                        aria-controls="mobile-menu"
                        aria-label="Open menu"
                    >
                        <span className="material-icons navbar__toggle-icon" aria-hidden="true">
                            menu
                        </span>
                    </button>
                </div>
            </nav>

            {/* Mobile Menu */}
            <div
                id="mobile-menu"
                className={`navbar__mobile ${isMobileMenuOpen ? 'navbar__mobile--open' : ''}`}
                role="dialog"
                aria-modal="true"
                aria-label="Mobile navigation menu"
            >
                <div className="navbar__mobile-header">
                    <Link to="/" className="navbar__logo" onClick={handleLinkClick}>
                        <span className="material-icons navbar__logo-icon" aria-hidden="true">
                            view_in_ar
                        </span>
                        <span className="navbar__logo-text">VirtuTour</span>
                    </Link>
                    <button
                        className="navbar__mobile-close"
                        onClick={() => setIsMobileMenuOpen(false)}
                        aria-label="Close menu"
                    >
                        <span className="material-icons" aria-hidden="true">close</span>
                    </button>
                </div>

                <nav className="navbar__mobile-nav" aria-label="Mobile navigation">
                    {navLinks.map((link) => (
                        link.href.startsWith('/') ? (
                            <Link
                                key={link.label}
                                to={link.href}
                                className="navbar__mobile-link"
                                onClick={handleLinkClick}
                            >
                                {link.label}
                            </Link>
                        ) : (
                            <a
                                key={link.label}
                                href={link.href}
                                className="navbar__mobile-link"
                                onClick={handleLinkClick}
                            >
                                {link.label}
                            </a>
                        )
                    ))}
                </nav>

                <a
                    href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="navbar__mobile-cta"
                    onClick={handleLinkClick}
                >
                    <span className="material-icons" aria-hidden="true">chat</span>
                    Hubungi via WhatsApp
                </a>
            </div>

            {/* Spacer */}
            <div className="navbar-spacer" aria-hidden="true"></div>
        </>
    );
};

export default Navbar;
