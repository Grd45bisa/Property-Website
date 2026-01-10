import React from 'react';

const TrustLogos: React.FC = () => {
    const logos = ['rumah123', '99.co', 'OLX', 'Lamudi'];

    return (
        <div className="bg-gray-100 py-6 border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 text-center">
                <p className="text-xs text-gray-500 mb-4 uppercase tracking-widest font-semibold">
                    Dipercaya untuk meningkatkan engagement listing properti di:
                </p>
                <div className="flex flex-wrap justify-center gap-8 md:gap-16 items-center opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                    {logos.map((logo) => (
                        <span
                            key={logo}
                            className="text-2xl font-bold font-display text-gray-400"
                        >
                            {logo}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TrustLogos;
