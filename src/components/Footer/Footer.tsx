import React from 'react';
import './Footer.css';

const Footer: React.FC = () => {
    const whatsappNumber = '6281234567890';
    const whatsappMessage = encodeURIComponent('Halo, saya tertarik dengan layanan virtual tour properti.');

    const currentYear = new Date().getFullYear();

    return (
        <>
            <footer className="footer" role="contentinfo">
                <div className="footer__container">
                    {/* CTA */}
                    <div className="footer__cta">
                        <h2 className="footer__cta-title">
                            Siap Tingkatkan Penjualan Properti Anda?
                        </h2>
                        <p className="footer__cta-text">
                            Konsultasi gratis dengan tim kami sekarang
                        </p>
                        <a
                            href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="footer__cta-button"
                            aria-label="Hubungi kami via WhatsApp"
                        >
                            <span className="material-icons footer__cta-icon" aria-hidden="true">
                                chat
                            </span>
                            Hubungi via WhatsApp
                        </a>
                    </div>

                    {/* Divider */}
                    <div className="footer__divider" aria-hidden="true"></div>

                    {/* Copyright */}
                    <p className="footer__copyright">
                        © {currentYear} VirtuTour. Made with ❤️ by{' '}
                        <a
                            href="https://virtutour.id"
                            className="footer__copyright-link"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            VirtuTour Team
                        </a>
                    </p>
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
