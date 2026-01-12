import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer: React.FC = () => {
    const whatsappNumber = '6281234567890';
    const whatsappMessage = encodeURIComponent('Halo, saya tertarik dengan layanan virtual tour properti.');
    const currentYear = new Date().getFullYear();

    return (
        <>
            <footer className="footer" role="contentinfo">
                <div className="footer__container">
                    <div className="footer__content">
                        {/* Brand Column */}
                        <div className="footer__brand">
                            <div className="footer__logo-wrapper">
                                <img src="/Logo/Logo_Ruang360.ico" alt="Ruang360" className="footer__logo-icon" />
                                <span className="footer__logo-text">Ruang360</span>
                            </div>
                            <p className="footer__tagline">
                                Solusi Virtual Tour Terbaik untuk Properti Anda. Hadirkan pengalaman 360° yang imersif.
                            </p>
                            <div className="footer__socials">
                                <a href="#" className="footer__social-link" aria-label="Instagram">
                                    <i className="fab fa-instagram"></i>
                                </a>
                                <a href="#" className="footer__social-link" aria-label="Facebook">
                                    <i className="fab fa-facebook"></i>
                                </a>
                                <a href="#" className="footer__social-link" aria-label="LinkedIn">
                                    <i className="fab fa-linkedin"></i>
                                </a>
                            </div>
                        </div>

                        {/* Quick Links Column */}
                        <div className="footer__links">
                            <h3 className="footer__heading">Menu</h3>
                            <ul className="footer__link-list">
                                <li><Link to="/" className="footer__link">Beranda</Link></li>
                                <li><a href="#portfolio" className="footer__link">Portfolio</a></li>
                                <li><a href="#pricing" className="footer__link">Harga</a></li>
                                <li><a href="#process" className="footer__link">Cara Kerja</a></li>
                                {/* <li><Link to="/blog" className="footer__link">Blog</Link></li> */}
                            </ul>
                        </div>

                        {/* Subscribe Column */}
                        <div className="footer__contact">
                            <h3 className="footer__heading">Berlangganan</h3>
                            <p className="footer__text">
                                Dapatkan info properti terbaru dan promo eksklusif langsung ke inbox Anda.
                            </p>
                            <form className="footer__subscribe-form">
                                <input
                                    type="email"
                                    placeholder="Masukkan email Anda"
                                    className="footer__subscribe-input"
                                    aria-label="Email Address"
                                />
                                <button type="submit" className="footer__subscribe-button">
                                    <span className="material-icons">send</span>
                                </button>
                            </form>
                        </div>
                    </div>

                    <div className="footer__bottom">
                        <p className="footer__copyright">
                            © {currentYear} Ruang360. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>

            {/* Floating WhatsApp Button */}
            <div className="whatsapp-float">
                <a
                    href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="whatsapp-float__button"
                    aria-label="Chat WhatsApp"
                >
                    <span className="material-icons whatsapp-float__icon" aria-hidden="true">
                        chat
                    </span>
                </a>
            </div>
        </>
    );
};

export default Footer;
