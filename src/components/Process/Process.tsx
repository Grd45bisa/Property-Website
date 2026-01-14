import React from 'react';
import './Process.css';

interface ProcessStep {
    number: number;
    icon: string;
    title: string;
    description: string;
}

const Process: React.FC = () => {

    const steps: ProcessStep[] = [
        {
            number: 1,
            icon: 'calendar_month',
            title: 'Booking',
            description: 'Hubungi kami dan tentukan jadwal shooting yang nyaman untuk Anda.',
        },
        {
            number: 2,
            icon: 'camera',
            title: 'Shooting & Editing',
            description: 'Tim profesional kami akan datang ke lokasi dan mengambil foto 360°.',
        },
        {
            number: 3,
            icon: 'link',
            title: 'Link Siap Pakai',
            description: 'Dalam 3-5 hari, virtual tour Anda siap dibagikan ke calon pembeli.',
        },
    ];

    return (
        <section id="process" className="process" aria-labelledby="process-title">
            <div className="process__container">
                {/* Header */}
                <header className="process__header">
                    <span className="process__label">Cara Kerja</span>
                    <h2 id="process-title" className="process__title">
                        Proses Mudah & Cepat
                    </h2>
                </header>

                {/* Steps */}
                <div className="process__steps">
                    {steps.map((step) => (
                        <article key={step.number} className="process__step">
                            <div className="process__step-number" aria-hidden="true">
                                {step.number}
                            </div>
                            <div className="process__step-icon-wrapper">
                                <span
                                    className="material-icons process__step-icon"
                                    aria-hidden="true"
                                >
                                    {step.icon}
                                </span>
                            </div>
                            <h3 className="process__step-title">{step.title}</h3>
                            <p className="process__step-description">{step.description}</p>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Process;
