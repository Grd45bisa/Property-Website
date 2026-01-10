import React from 'react';
import { Link } from 'react-router-dom';
import { blogPosts } from '../data/blogPosts';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import './BlogListPage.css';

const BlogListPage: React.FC = () => {
    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    return (
        <div className="blog-page">
            <Navbar />

            {/* Header */}
            <header className="blog-header">
                <div className="blog-header__container">
                    <h1 className="blog-header__title">Blog</h1>
                    <p className="blog-header__description">
                        Tips, panduan, dan case study seputar virtual tour dan marketing properti
                    </p>
                </div>
            </header>

            {/* Blog Grid */}
            <section className="blog-grid">
                <div className="blog-grid__list">
                    {blogPosts.map((post) => (
                        <Link
                            key={post.id}
                            to={`/blog/${post.slug}`}
                            className="blog-card"
                        >
                            {/* Image */}
                            <div className="blog-card__image-wrapper">
                                <img
                                    src={post.featuredImage}
                                    alt={post.title}
                                    className="blog-card__image"
                                    loading="lazy"
                                    decoding="async"
                                />
                                <span className="blog-card__category">
                                    {post.category}
                                </span>
                            </div>

                            {/* Content */}
                            <div className="blog-card__content">
                                <h2 className="blog-card__title">
                                    {post.title}
                                </h2>
                                <p className="blog-card__excerpt">
                                    {post.excerpt}
                                </p>
                                <div className="blog-card__meta">
                                    <span>{formatDate(post.publishedAt)}</span>
                                    <span>{post.readingTime}</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="blog-cta">
                <div className="blog-cta__container">
                    <h2 className="blog-cta__title">
                        Butuh Virtual Tour untuk Properti Anda?
                    </h2>
                    <p className="blog-cta__text">
                        Konsultasikan kebutuhan Anda dengan tim kami secara gratis.
                    </p>
                    <Link to="/#pricing" className="blog-cta__button">
                        Lihat Paket Harga
                        <span className="material-icons blog-cta__button-icon" aria-hidden="true">
                            arrow_forward
                        </span>
                    </Link>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default BlogListPage;
