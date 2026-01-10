import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPostBySlug, getRelatedPosts } from '../data/blogPosts';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const BlogPostPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const post = getPostBySlug(slug || '');
    const relatedPosts = getRelatedPosts(slug || '', 3);
    const [copied, setCopied] = useState(false);

    const whatsappNumber = '6281234567890';

    if (!post) {
        return (
            <div className="min-h-screen bg-white">
                <Navbar />
                <div className="max-w-4xl mx-auto px-4 py-20 text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Artikel Tidak Ditemukan</h1>
                    <p className="text-gray-500 mb-6">Maaf, artikel yang Anda cari tidak tersedia.</p>
                    <Link to="/blog" className="text-primary hover:underline">← Kembali ke Blog</Link>
                </div>
                <Footer />
            </div>
        );
    }

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    const handleShare = (platform: string) => {
        const url = window.location.href;
        const text = post.title;

        switch (platform) {
            case 'whatsapp':
                window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
                break;
            case 'facebook':
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
                break;
            case 'twitter':
                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
                break;
            case 'copy':
                navigator.clipboard.writeText(url);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
                break;
        }
    };

    // Simple markdown-like rendering
    const renderContent = (content: string) => {
        const lines = content.split('\n');
        const elements: React.ReactNode[] = [];
        let inList = false;
        let listItems: string[] = [];
        let listType: 'ul' | 'ol' = 'ul';

        const flushList = () => {
            if (listItems.length > 0) {
                if (listType === 'ul') {
                    elements.push(
                        <ul key={`ul-${elements.length}`} className="list-disc list-inside space-y-2 mb-6 text-gray-700">
                            {listItems.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                    );
                } else {
                    elements.push(
                        <ol key={`ol-${elements.length}`} className="list-decimal list-inside space-y-2 mb-6 text-gray-700">
                            {listItems.map((item, i) => <li key={i}>{item}</li>)}
                        </ol>
                    );
                }
                listItems = [];
                inList = false;
            }
        };

        lines.forEach((line, idx) => {
            const trimmedLine = line.trim();

            // Heading 2
            if (trimmedLine.startsWith('## ')) {
                flushList();
                elements.push(
                    <h2 key={idx} className="text-xl sm:text-2xl font-bold text-gray-900 mt-8 mb-4">
                        {trimmedLine.replace('## ', '')}
                    </h2>
                );
            }
            // Heading 3
            else if (trimmedLine.startsWith('### ')) {
                flushList();
                elements.push(
                    <h3 key={idx} className="text-lg sm:text-xl font-bold text-gray-900 mt-6 mb-3">
                        {trimmedLine.replace('### ', '')}
                    </h3>
                );
            }
            // Blockquote
            else if (trimmedLine.startsWith('> ')) {
                flushList();
                elements.push(
                    <blockquote key={idx} className="border-l-4 border-primary bg-gray-50 pl-4 py-3 my-6 italic text-gray-700">
                        {trimmedLine.replace('> ', '')}
                    </blockquote>
                );
            }
            // Unordered list
            else if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
                if (!inList || listType !== 'ul') {
                    flushList();
                    inList = true;
                    listType = 'ul';
                }
                listItems.push(trimmedLine.replace(/^[-*] /, ''));
            }
            // Ordered list
            else if (/^\d+\. /.test(trimmedLine)) {
                if (!inList || listType !== 'ol') {
                    flushList();
                    inList = true;
                    listType = 'ol';
                }
                listItems.push(trimmedLine.replace(/^\d+\. /, ''));
            }
            // Table (simple)
            else if (trimmedLine.startsWith('|')) {
                flushList();
                // Skip table rendering for simplicity
            }
            // Paragraph
            else if (trimmedLine.length > 0) {
                flushList();
                // Handle bold text
                const formattedLine = trimmedLine
                    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*([^*]+)\*/g, '<em>$1</em>');

                elements.push(
                    <p
                        key={idx}
                        className="text-gray-700 leading-relaxed mb-4"
                        dangerouslySetInnerHTML={{ __html: formattedLine }}
                    />
                );
            }
        });

        flushList();
        return elements;
    };

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            {/* Back & Breadcrumb */}
            <div className="bg-gray-50 border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <Link to="/blog" className="inline-flex items-center text-sm text-gray-600 hover:text-primary transition">
                            <span className="material-icons text-lg mr-1">arrow_back</span>
                            Kembali ke Blog
                        </Link>
                        <nav className="text-xs sm:text-sm text-gray-500">
                            <Link to="/" className="hover:text-primary">Home</Link>
                            <span className="mx-2">›</span>
                            <Link to="/blog" className="hover:text-primary">Blog</Link>
                            <span className="mx-2">›</span>
                            <span className="text-gray-900 truncate max-w-[200px] inline-block align-bottom">{post.title}</span>
                        </nav>
                    </div>
                </div>
            </div>

            {/* Article Hero */}
            <div className="relative h-[300px] sm:h-[350px] md:h-[400px] overflow-hidden">
                <img
                    src={post.featuredImage}
                    alt={post.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 lg:p-8">
                    <div className="max-w-4xl mx-auto">
                        <span className="inline-block bg-primary text-white text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-full mb-3">
                            {post.category}
                        </span>
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
                            {post.title}
                        </h1>
                        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-white/80 text-xs sm:text-sm">
                            <div className="flex items-center gap-2">
                                <img src={post.author.avatar} alt={post.author.name} className="w-6 h-6 rounded-full" />
                                <span>{post.author.name}</span>
                            </div>
                            <span>•</span>
                            <span>{formatDate(post.publishedAt)}</span>
                            <span>•</span>
                            <span>{post.readingTime} baca</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                    {/* Article Content */}
                    <article className="lg:col-span-2">
                        <div className="max-w-none prose-lg">
                            {renderContent(post.content)}
                        </div>

                        {/* CTA Box */}
                        <div className="mt-10 p-6 sm:p-8 bg-gray-900 rounded-2xl text-center">
                            <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">
                                Siap Meningkatkan Penjualan Anda?
                            </h3>
                            <p className="text-gray-400 mb-6 text-sm sm:text-base">
                                Hubungi kami untuk konsultasi gratis tentang virtual tour properti Anda.
                            </p>
                            <a
                                href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Halo, saya tertarik dengan layanan virtual tour setelah membaca artikel blog.')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg font-bold transition"
                            >
                                <span className="material-icons">chat</span>
                                Hubungi via WhatsApp
                            </a>
                        </div>

                        {/* Share Buttons */}
                        <div className="mt-8 pt-8 border-t border-gray-200">
                            <p className="text-sm font-medium text-gray-700 mb-4">Bagikan artikel ini:</p>
                            <div className="flex flex-wrap gap-3">
                                <button
                                    onClick={() => handleShare('whatsapp')}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition"
                                >
                                    <span className="material-icons text-lg">chat</span>
                                    WhatsApp
                                </button>
                                <button
                                    onClick={() => handleShare('facebook')}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
                                >
                                    <span className="material-icons text-lg">facebook</span>
                                    Facebook
                                </button>
                                <button
                                    onClick={() => handleShare('twitter')}
                                    className="flex items-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-sm font-medium transition"
                                >
                                    <span className="material-icons text-lg">share</span>
                                    Twitter
                                </button>
                                <button
                                    onClick={() => handleShare('copy')}
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium transition"
                                >
                                    <span className="material-icons text-lg">{copied ? 'check' : 'link'}</span>
                                    {copied ? 'Tersalin!' : 'Copy Link'}
                                </button>
                            </div>
                        </div>
                    </article>

                    {/* Sidebar */}
                    <aside className="lg:col-span-1">
                        <div className="sticky top-24 space-y-6">
                            {/* Related Articles */}
                            <div className="bg-gray-50 rounded-2xl p-5 sm:p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Artikel Terkait</h3>
                                <div className="space-y-4">
                                    {relatedPosts.map(relatedPost => (
                                        <Link
                                            key={relatedPost.id}
                                            to={`/blog/${relatedPost.slug}`}
                                            className="block group"
                                        >
                                            <div className="flex gap-3">
                                                <img
                                                    src={relatedPost.featuredImage}
                                                    alt={relatedPost.title}
                                                    className="w-20 h-16 object-cover rounded-lg flex-shrink-0"
                                                />
                                                <div>
                                                    <h4 className="text-sm font-medium text-gray-900 group-hover:text-primary transition line-clamp-2">
                                                        {relatedPost.title}
                                                    </h4>
                                                    <p className="text-xs text-gray-500 mt-1">{relatedPost.readingTime}</p>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            {/* Contact Widget */}
                            <div className="bg-primary/10 rounded-2xl p-5 sm:p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Hubungi Kami</h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    Punya pertanyaan tentang virtual tour? Chat langsung dengan tim kami.
                                </p>
                                <a
                                    href={`https://wa.me/${whatsappNumber}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-3 rounded-lg font-bold text-sm transition w-full"
                                >
                                    <span className="material-icons text-lg">chat</span>
                                    Chat via WhatsApp
                                </a>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>

            {/* Related Articles Section (Bottom) */}
            <section className="bg-gray-50 py-12 sm:py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 text-center">
                        Baca Juga
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {relatedPosts.map(relatedPost => (
                            <Link
                                key={relatedPost.id}
                                to={`/blog/${relatedPost.slug}`}
                                className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition group"
                            >
                                <div className="relative h-40 overflow-hidden">
                                    <img
                                        src={relatedPost.featuredImage}
                                        alt={relatedPost.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                    />
                                </div>
                                <div className="p-4">
                                    <span className="text-xs font-medium text-primary">{relatedPost.category}</span>
                                    <h3 className="text-sm sm:text-base font-bold text-gray-900 mt-1 group-hover:text-primary transition line-clamp-2">
                                        {relatedPost.title}
                                    </h3>
                                    <p className="text-xs text-gray-500 mt-2">{relatedPost.readingTime}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Bottom CTA */}
            <section className="bg-gray-900 py-12 sm:py-16">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-4">
                        Butuh Virtual Tour untuk Properti Anda?
                    </h2>
                    <p className="text-gray-400 mb-6 text-sm sm:text-base">
                        Tingkatkan penjualan properti Anda dengan virtual tour 360° profesional.
                    </p>
                    <a
                        href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Halo, saya tertarik dengan layanan virtual tour.')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-xl font-bold text-base sm:text-lg transition shadow-lg"
                    >
                        <span className="material-icons text-xl">chat</span>
                        Konsultasi Gratis
                    </a>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default BlogPostPage;
