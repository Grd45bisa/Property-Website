import React, { useState, useMemo } from 'react';

interface FormData {
    nama: string;
    whatsapp: string;
    email: string;
    tipeProperti: string;
    luasProperti: string;
    alamat: string;
    paket: string;
    tanggalShooting: string;
    catatan: string;
}

interface FormErrors {
    [key: string]: string;
}

const OrderForm: React.FC = () => {
    const whatsappNumber = '6281234567890';

    const [formData, setFormData] = useState<FormData>({
        nama: '',
        whatsapp: '',
        email: '',
        tipeProperti: '',
        luasProperti: '',
        alamat: '',
        paket: '',
        tanggalShooting: '',
        catatan: '',
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const paketPrices: Record<string, { price: string; priceNum: number }> = {
        lite: { price: 'Rp 750.000', priceNum: 750000 },
        pro: { price: 'Rp 1.500.000', priceNum: 1500000 },
        enterprise: { price: 'Rp 3.500.000', priceNum: 3500000 },
    };

    const selectedPaketPrice = useMemo(() => {
        return paketPrices[formData.paket] || null;
    }, [formData.paket]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.nama.trim()) newErrors.nama = 'Nama lengkap wajib diisi';
        if (!formData.whatsapp.trim()) {
            newErrors.whatsapp = 'Nomor WhatsApp wajib diisi';
        } else if (!/^(\+62|62|08)[0-9]{8,12}$/.test(formData.whatsapp.replace(/\s/g, ''))) {
            newErrors.whatsapp = 'Format nomor tidak valid';
        }
        if (!formData.email.trim()) {
            newErrors.email = 'Email wajib diisi';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Format email tidak valid';
        }
        if (!formData.tipeProperti) newErrors.tipeProperti = 'Pilih tipe properti';
        if (!formData.luasProperti.trim()) newErrors.luasProperti = 'Luas properti wajib diisi';
        if (!formData.alamat.trim()) newErrors.alamat = 'Alamat properti wajib diisi';
        if (!formData.paket) newErrors.paket = 'Pilih paket';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsSubmitting(true);

        // Format WhatsApp message
        const message = `
*📋 PESANAN VIRTUAL TOUR*
━━━━━━━━━━━━━━━━━━

*Data Pemesan:*
• Nama: ${formData.nama}
• WhatsApp: ${formData.whatsapp}
• Email: ${formData.email}

*Detail Properti:*
• Tipe: ${formData.tipeProperti}
• Luas: ${formData.luasProperti} m²
• Alamat: ${formData.alamat}

*Paket Dipilih:*
• ${formData.paket.toUpperCase()} - ${selectedPaketPrice?.price || '-'}

${formData.tanggalShooting ? `*Tanggal Shooting:* ${formData.tanggalShooting}` : ''}
${formData.catatan ? `*Catatan:* ${formData.catatan}` : ''}

━━━━━━━━━━━━━━━━━━
Mohon konfirmasi ketersediaan jadwal. Terima kasih! 🙏
        `.trim();

        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, '_blank');

        setIsSubmitting(false);
    };

    const benefits = [
        { icon: 'schedule', text: 'Response dalam 1 jam' },
        { icon: 'support_agent', text: 'Free konsultasi' },
        { icon: 'verified', text: 'Garansi kepuasan' },
        { icon: 'autorenew', text: 'Revisi hingga puas' },
    ];

    return (
        <section id="order" className="py-12 sm:py-16 md:py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-10 sm:mb-12">
                    <span className="inline-block text-primary text-xs font-bold uppercase tracking-widest mb-2">
                        Order
                    </span>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                        Pesan Virtual Tour Sekarang
                    </h2>
                    <p className="text-gray-500 text-sm sm:text-base max-w-2xl mx-auto">
                        Isi form di bawah untuk memesan. Tim kami akan menghubungi Anda dalam 1 jam.
                    </p>
                </div>

                {/* Form Container */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                    {/* Left: Form */}
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-2xl p-5 sm:p-6 lg:p-8">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                                {/* Nama */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Nama Lengkap <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="nama"
                                        value={formData.nama}
                                        onChange={handleChange}
                                        placeholder="John Doe"
                                        className={`w-full px-4 py-2.5 sm:py-3 rounded-lg border ${errors.nama ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition text-sm sm:text-base`}
                                    />
                                    {errors.nama && <p className="text-red-500 text-xs mt-1">{errors.nama}</p>}
                                </div>

                                {/* WhatsApp */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Nomor WhatsApp <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        name="whatsapp"
                                        value={formData.whatsapp}
                                        onChange={handleChange}
                                        placeholder="081234567890"
                                        className={`w-full px-4 py-2.5 sm:py-3 rounded-lg border ${errors.whatsapp ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition text-sm sm:text-base`}
                                    />
                                    {errors.whatsapp && <p className="text-red-500 text-xs mt-1">{errors.whatsapp}</p>}
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Email <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="john@example.com"
                                        className={`w-full px-4 py-2.5 sm:py-3 rounded-lg border ${errors.email ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition text-sm sm:text-base`}
                                    />
                                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                                </div>

                                {/* Tipe Properti */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Tipe Properti <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="tipeProperti"
                                        value={formData.tipeProperti}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-2.5 sm:py-3 rounded-lg border ${errors.tipeProperti ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition text-sm sm:text-base bg-white`}
                                    >
                                        <option value="">Pilih tipe...</option>
                                        <option value="Rumah">Rumah</option>
                                        <option value="Villa">Villa</option>
                                        <option value="Apartemen">Apartemen</option>
                                        <option value="Ruko">Ruko</option>
                                        <option value="Lainnya">Lainnya</option>
                                    </select>
                                    {errors.tipeProperti && <p className="text-red-500 text-xs mt-1">{errors.tipeProperti}</p>}
                                </div>

                                {/* Luas Properti */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Luas Properti (m²) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="luasProperti"
                                        value={formData.luasProperti}
                                        onChange={handleChange}
                                        placeholder="150"
                                        min="1"
                                        className={`w-full px-4 py-2.5 sm:py-3 rounded-lg border ${errors.luasProperti ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition text-sm sm:text-base`}
                                    />
                                    {errors.luasProperti && <p className="text-red-500 text-xs mt-1">{errors.luasProperti}</p>}
                                </div>

                                {/* Paket */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Paket <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="paket"
                                        value={formData.paket}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-2.5 sm:py-3 rounded-lg border ${errors.paket ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition text-sm sm:text-base bg-white`}
                                    >
                                        <option value="">Pilih paket...</option>
                                        <option value="lite">LITE - Rp 750.000</option>
                                        <option value="pro">PRO - Rp 1.500.000 (Recommended)</option>
                                        <option value="enterprise">ENTERPRISE - Rp 3.500.000</option>
                                    </select>
                                    {errors.paket && <p className="text-red-500 text-xs mt-1">{errors.paket}</p>}
                                </div>

                                {/* Alamat - Full Width */}
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Alamat Properti <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="alamat"
                                        value={formData.alamat}
                                        onChange={handleChange}
                                        placeholder="Jl. Contoh No. 123, Jakarta Selatan"
                                        className={`w-full px-4 py-2.5 sm:py-3 rounded-lg border ${errors.alamat ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition text-sm sm:text-base`}
                                    />
                                    {errors.alamat && <p className="text-red-500 text-xs mt-1">{errors.alamat}</p>}
                                </div>

                                {/* Tanggal Shooting */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Tanggal Shooting (Opsional)
                                    </label>
                                    <input
                                        type="date"
                                        name="tanggalShooting"
                                        value={formData.tanggalShooting}
                                        onChange={handleChange}
                                        min={new Date().toISOString().split('T')[0]}
                                        className="w-full px-4 py-2.5 sm:py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition text-sm sm:text-base"
                                    />
                                </div>

                                {/* Catatan - Full Width */}
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Catatan Tambahan (Opsional)
                                    </label>
                                    <textarea
                                        name="catatan"
                                        value={formData.catatan}
                                        onChange={handleChange}
                                        placeholder="Tambahkan catatan khusus jika ada..."
                                        rows={3}
                                        className="w-full px-4 py-2.5 sm:py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition text-sm sm:text-base resize-none"
                                    />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full mt-6 bg-primary hover:bg-primary-dark text-white py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base transition-all shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 flex items-center justify-center gap-2 disabled:opacity-70"
                            >
                                <span className="material-icons">chat</span>
                                {isSubmitting ? 'Memproses...' : 'Kirim Pesanan via WhatsApp'}
                            </button>
                        </form>
                    </div>

                    {/* Right: Info Box */}
                    <div className="lg:col-span-1">
                        <div className="bg-gray-900 text-white rounded-2xl p-5 sm:p-6 lg:p-8 sticky top-24">
                            <h3 className="text-lg sm:text-xl font-bold mb-6">Kenapa Pilih Kami?</h3>

                            <ul className="space-y-4 mb-8">
                                {benefits.map((benefit, idx) => (
                                    <li key={idx} className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                                            <span className="material-icons text-primary text-lg">{benefit.icon}</span>
                                        </div>
                                        <span className="text-sm sm:text-base text-gray-300">{benefit.text}</span>
                                    </li>
                                ))}
                            </ul>

                            {/* Price Estimate */}
                            <div className="border-t border-gray-700 pt-6">
                                <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Estimasi Biaya</p>
                                <div className="text-2xl sm:text-3xl font-bold text-primary">
                                    {selectedPaketPrice ? selectedPaketPrice.price : 'Pilih Paket'}
                                </div>
                                {formData.paket && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        Paket {formData.paket.toUpperCase()}
                                    </p>
                                )}
                            </div>

                            {/* Contact */}
                            <div className="mt-6 pt-6 border-t border-gray-700">
                                <p className="text-xs text-gray-500 mb-2">Butuh bantuan?</p>
                                <a
                                    href={`https://wa.me/${whatsappNumber}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-primary hover:text-green-400 font-medium text-sm transition"
                                >
                                    <span className="material-icons text-lg">chat</span>
                                    Chat langsung dengan tim
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default OrderForm;
