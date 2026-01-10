import React from 'react';

interface ProblemSolutionItem {
    problem: string;
    solution: string;
}

const ProblemSolutionTable: React.FC = () => {
    const items: ProblemSolutionItem[] = [
        { problem: 'Lelah "Ghosting"', solution: 'Filter Klien Serius' },
        { problem: 'Foto Membosankan', solution: 'Stand Out Instan (120MP)' },
        { problem: 'Klien Luar Kota', solution: 'Open House 24 Jam' },
    ];

    return (
        <section className="py-16 px-4">
            <div className="max-w-5xl mx-auto">
                <h2 className="text-2xl md:text-3xl font-bold text-center mb-10 text-gray-900">
                    Masalah Klasik Agen Properti di Indonesia
                </h2>

                <div className="bg-white shadow-xl rounded-lg overflow-hidden border border-gray-100">
                    {/* Header */}
                    <div className="grid grid-cols-2 bg-gray-50 border-b border-gray-200 font-bold text-sm md:text-base">
                        <div className="p-4 text-center text-red-600">
                            Masalah (The Pain)
                        </div>
                        <div className="p-4 text-center text-primary">
                            Solusi Kami (The Gain)
                        </div>
                    </div>

                    {/* Rows */}
                    {items.map((item, index) => (
                        <div
                            key={index}
                            className={`grid grid-cols-2 text-sm md:text-base hover:bg-gray-50 transition ${index < items.length - 1 ? 'border-b border-gray-100' : ''
                                }`}
                        >
                            <div className="p-4 flex items-center gap-3">
                                <span className="material-icons text-red-500">close</span>
                                <span>{item.problem}</span>
                            </div>
                            <div className="p-4 flex items-center gap-3 bg-green-50/30">
                                <span className="material-icons text-primary">check_box</span>
                                <span className="font-medium text-gray-900">{item.solution}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ProblemSolutionTable;
