import React from 'react';
import './ProblemSolution.css';

interface ProblemSolutionItem {
    problem: string;
    solution: string;
}

const ProblemSolution: React.FC = () => {
    const items: ProblemSolutionItem[] = [
        {
            problem: 'Survei properti memakan waktu, sering batal dadakan',
            solution: 'Virtual tour 24/7 tanpa perlu jadwal khusus',
        },
        {
            problem: 'Pembeli tidak serius, hanya "window shopping"',
            solution: 'Filter pembeli serius sebelum survei fisik',
        },
        {
            problem: 'Foto biasa kurang menampilkan keseluruhan properti',
            solution: 'Pengalaman 360° imersif seperti berada di lokasi',
        },
        {
            problem: 'Susah jangkau pembeli dari luar kota',
            solution: 'Bisa diakses siapa saja, dari mana saja',
        },
    ];

    return (
        <section
            className="problem-solution"
            aria-labelledby="problem-solution-title"
        >
            <div className="problem-solution__container">
                {/* Header */}
                <div className="problem-solution__header">
                    <span className="problem-solution__label">Mengapa Virtual Tour?</span>
                    <h2 id="problem-solution-title" className="problem-solution__title">
                        Solusi untuk Masalah Anda
                    </h2>
                </div>

                {/* Table */}
                <div className="problem-solution__table" role="table" aria-label="Perbandingan masalah dan solusi">
                    {/* Header Row */}
                    <div className="problem-solution__row problem-solution__row--header" role="row">
                        <div className="problem-solution__cell problem-solution__cell--header" role="columnheader">
                            ❌ Tanpa Virtual Tour
                        </div>
                        <div className="problem-solution__cell problem-solution__cell--header" role="columnheader">
                            ✅ Dengan Virtual Tour
                        </div>
                    </div>

                    {/* Data Rows */}
                    {items.map((item, index) => (
                        <div key={index} className="problem-solution__row" role="row">
                            <div
                                className="problem-solution__cell problem-solution__cell--problem"
                                role="cell"
                            >
                                <div className="problem-solution__content">
                                    <span
                                        className="material-icons problem-solution__icon problem-solution__icon--problem"
                                        aria-hidden="true"
                                    >
                                        cancel
                                    </span>
                                    <span className="problem-solution__text">{item.problem}</span>
                                </div>
                            </div>
                            <div
                                className="problem-solution__cell problem-solution__cell--solution"
                                role="cell"
                            >
                                <div className="problem-solution__content">
                                    <span
                                        className="material-icons problem-solution__icon problem-solution__icon--solution"
                                        aria-hidden="true"
                                    >
                                        check_circle
                                    </span>
                                    <span className="problem-solution__text">{item.solution}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ProblemSolution;
