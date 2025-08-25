// src/app/page.tsx
'use client'

import Link from 'next/link';
import React from 'react';
import { Sparkles } from 'lucide-react';

// Données pour les cartes de navigation
const navCards = [
  {
    title: "Créer un entraînement",
    description: "Composez votre séance personnalisée.",
    href: "/creer-entrainement",
    bgColor: "from-blue-500 to-cyan-400",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  {
    title: "Générateur d'entrainement",
    description: "Laissez l'IA créer une séance sur mesure.",
    href: "/generateur-ia",
    bgColor: "from-pink-500 to-rose-500",
    icon: <Sparkles className="h-8 w-8 text-white" />
  },
  {
    title: "Mes entraînements",
    description: "Retrouvez toutes vos séances sauvegardées.",
    href: "/mes-entrainements",
    bgColor: "from-indigo-500 to-purple-500",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
      </svg>
    )
  },
  {
    title: "Bibliothèque",
    description: "Explorez les entraînements de la communauté.",
    href: "/entrainements",
    bgColor: "from-teal-500 to-emerald-500",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
      </svg>
    )
  }
];

export default function HomePage() {
  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-800">Votre compagnon de natation</h1>
        <p className="mt-4 text-lg text-slate-600">Planifiez, suivez et améliorez vos performances.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {navCards.map((card) => (
          <Link href={card.href} key={card.title}>
            <div className={`bg-gradient-to-br ${card.bgColor} p-8 rounded-2xl shadow-lg text-white h-full flex flex-col justify-between transform hover:scale-105 transition-transform duration-300`}>
              <div>
                <div className="mb-4">
                  {card.icon}
                </div>
                <h2 className="text-2xl font-bold">{card.title}</h2>
              </div>
              <p className="mt-2 opacity-90">{card.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
