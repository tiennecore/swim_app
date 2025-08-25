// src/components/workout/AddBlockMenu.tsx
'use client'

import React, { useState } from 'react';

type AddBlockMenuProps = {
    onAddExercise: () => void;
    onAddSeries: () => void;
};

export default function AddBlockMenu({ onAddExercise, onAddSeries }: AddBlockMenuProps) {
    const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);

    const handleAddExercise = () => {
        onAddExercise();
        setIsAddMenuOpen(false);
    };

    const handleAddSeries = () => {
        onAddSeries();
        setIsAddMenuOpen(false);
    };

    return (
        <>
            <style>{`
        .btn-ripple {
          position: relative;
          overflow: hidden;
          transition: color 0.4s ease-in-out !important;
        }
        .btn-ripple::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          background-color: #2196F3;
          border-radius: 50%;
          transform: translate(-50%, -50%);
          transition: width 0.4s ease-in-out, height 0.4s ease-in-out;
          z-index: 0;
        }
        .btn-ripple:hover::before,
        .btn-ripple:focus::before {
          width: 250px;
          height: 250px;
        }
        .btn-ripple span {
          position: relative;
          z-index: 1;
        }
        .btn-ripple:hover span {
            color: white;
        }
      `}</style>
            <div className="relative flex justify-center pt-6 mt-4 border-t border-slate-200">
                <div className="flex flex-col items-center gap-2">
                    <button type="button" onClick={() => setIsAddMenuOpen(!isAddMenuOpen)} className="w-16 h-16 rounded-full shadow-lg hover:scale-110 transition-transform">
                        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="50" cy="50" r="50" fill="#2196F3" />
                            <path d="M 50 30 V 70 M 30 50 H 70" stroke="#FFFFFF" strokeWidth="12" strokeLinecap="round" />
                        </svg>
                    </button>
                    {isAddMenuOpen && (
                        <div className="absolute top-full mt-4 flex flex-col items-center gap-2 animate-fade-in-up">
                            <button type="button" onClick={handleAddExercise} className="btn-ripple text-sm font-medium text-slate-700 bg-white border border-slate-300 px-4 py-2 rounded-full shadow-lg w-28">
                                <span>Exercice</span>
                            </button>
                            <button type="button" onClick={handleAddSeries} className="btn-ripple text-sm font-medium text-slate-700 bg-white border border-slate-300 px-4 py-2 rounded-full shadow-lg w-28">
                                <span>Série</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
