import React from 'react';

interface ProcessStep {
    icon: string;
    title: string;
    description: string;
}

const Process2: React.FC = () => {
    const steps: ProcessStep[] = [
        {
            icon: 'calendar_today',
            title: '1. Booking',
            description: 'Jadwalkan waktu pemotretan yang sesuai.',
        },
        {
            icon: 'videocam',
            title: '2. Shooting & Editing',
            description: 'Tim kami bekerja di lokasi dan studio.',
        },
        {
            icon: 'link',
            title: '3. Link Siap Pakai',
            description: 'Terima link virtual tour siap sebar.',
        },
    ];

    return (
        <section id="process" className="py-16 px-4">
            <div className="max-w-7xl mx-auto">
                <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 text-gray-900">
                    Proses Mudah & Cepat
                </h2>

                {/* Steps */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center max-w-4xl mx-auto relative">
                    {steps.map((step, index) => (
                        <div key={index} className="flex flex-col items-center group relative">
                            {/* Connector Line (desktop only) */}
                            {index > 0 && (
                                <div className="hidden md:block absolute top-8 -left-1/2 w-full h-0.5 bg-gray-200 -z-10" />
                            )}

                            {/* Icon */}
                            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4 text-primary group-hover:scale-110 transition duration-300 relative z-10 bg-white">
                                <span className="material-icons text-4xl">{step.icon}</span>
                            </div>

                            {/* Title */}
                            <h3 className="text-lg font-bold text-gray-900">{step.title}</h3>

                            {/* Description */}
                            <p className="text-sm text-gray-500 mt-2">{step.description}</p>
                        </div>
                    ))}
                </div>

                {/* Pricing CTA */}
                <div id="pricing" className="mt-16 text-center max-w-3xl mx-auto bg-gray-50 p-8 rounded-2xl border border-gray-100">
                    <p className="text-lg font-medium text-gray-800 mb-4">
                        Investasi Kecil untuk Komisi Besar.{' '}
                        <span className="font-bold text-gray-900">[Paket LITE mulai dari Rp 750.000]</span>
                        <br />
                        <span className="text-sm text-gray-500">
                            Termasuk Shooting, Editing, dan Hosting 1 Tahun.
                        </span>
                    </p>
                    <a
                        href="https://wa.me/6281234567890?text=Halo,%20saya%20tertarik%20dengan%20layanan%20virtual%20tour"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-primary hover:text-primary-dark font-bold uppercase tracking-wider text-sm group"
                    >
                        [ Hubungi untuk Info Harga Lengkap
                        <span className="material-icons text-sm ml-1 transform group-hover:translate-x-1 transition">
                            arrow_forward
                        </span>
                        ]
                    </a>
                </div>
            </div>
        </section>
    );
};

export default Process2;
