// src/components/layout/Navbar.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/providers/AuthProvider'
import { useSupabase } from '@/components/providers/SupabaseProvider'
import { Menu, X, Waves, User, Settings, Home, Dumbbell, Library, ChevronDown, Sparkles } from 'lucide-react';

export function Navbar() {
    const { user, isLoading } = useAuth()
    const supabase = useSupabase()
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Ferme le menu déroulant si on clique en dehors
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef]);

    // Liens pour le menu déroulant et mobile
    const navItems = [
        {
            href: '/creer-entrainement',
            label: 'Créer un entraînement',
            description: 'Composez votre séance personnalisée.',
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
        },
        {
            href: '/mes-entrainements',
            label: 'Mes entraînements',
            description: 'Retrouvez toutes vos séances.',
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>
        },
        {
            href: '/entrainements',
            label: 'Bibliothèque',
            description: 'Explorez les entraînements partagés.',
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
        },
    ];

    const mobileNavItems = [
        ...navItems,
        { href: '/generateur-ia', label: "Générateur d'entrainement", description: '' },
    ];

    const DropdownMenu = () => (
        <div className="absolute top-full left-0 right-0 mt-2 z-50">
            <div className="bg-white/80 backdrop-blur-md rounded-lg shadow-lg border border-slate-200">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
                    {navItems.map(item => (
                        <Link key={item.href} href={item.href} onClick={() => setIsDropdownOpen(false)} className="group block p-4 rounded-lg hover:bg-slate-100 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="bg-blue-500 p-2 rounded-lg text-white">
                                    {item.icon}
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-800">{item.label}</p>
                                    <p className="text-sm text-slate-500">{item.description}</p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );

    const AuthSection = ({ onLinkClick }: { onLinkClick?: () => void }) => (
        <div className="flex flex-col sm:flex-row items-center gap-4">
            {user ? (
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <Link href="/profil" onClick={onLinkClick} className="px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors">
                        Profil
                    </Link>
                    <button
                        onClick={() => {
                            supabase.auth.signOut();
                            if (onLinkClick) onLinkClick();
                        }}
                        className="w-full sm:w-auto px-4 py-2 text-center text-sm font-medium text-red-600 bg-white border border-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    >
                        Se déconnecter
                    </button>
                </div>
            ) : (
                <Link
                    href="/connexion"
                    onClick={onLinkClick}
                    className="w-full sm:w-auto px-4 py-2 text-center text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                    Se connecter
                </Link>
            )}
        </div>
    )

    if (isLoading) return <div className="h-24"></div>

    return (
        <header className="px-4 sm:px-6 lg:px-8 my-4">
            <nav ref={dropdownRef} className="bg-white rounded-lg shadow-md relative">
                <div className="flex items-center justify-between h-16 px-4 sm:px-6">
                    <div className="flex items-center gap-8">
                        <div className="flex-shrink-0">
                            <Link href="/" className="flex items-center space-x-2 text-xl font-bold text-gray-900">
                                <div className="p-2 bg-gradient-to-r from-blue-500 to-teal-500 rounded-lg">
                                    <Waves className="h-6 w-6 text-white" />
                                </div>
                                <span className="bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
                                    Swim Training
                                </span>
                            </Link>
                        </div>
                        <div className="hidden sm:flex sm:items-center sm:gap-4">
                            <div className="relative">
                                <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors">
                                    <span>Entraînements</span>
                                    <svg className={`h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                </button>
                            </div>
                            <Link href="/generateur-ia" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors">
                                <Sparkles className="h-4 w-4" />
                                <span>Générateur d'entrainement</span>
                            </Link>
                        </div>
                    </div>

                    <div className="hidden sm:block">
                        <AuthSection />
                    </div>

                    <div className="sm:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
                        >
                            <svg className="h-6 w-6 transition-transform duration-300" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                {isMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="hidden sm:block">
                    {isDropdownOpen && <DropdownMenu />}
                </div>

                <div className={`sm:hidden transition-all duration-300 ease-in-out overflow-hidden ${isMenuOpen ? 'max-h-96' : 'max-h-0'}`}>
                    <div className="px-2 pt-2 pb-3 space-y-1 border-t border-slate-200">
                        <div className="flex flex-col gap-1">
                            {mobileNavItems.map(item => (
                                <Link key={item.href} href={item.href} onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900">
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                        <div className="pt-4 mt-4 border-t border-slate-200">
                            <AuthSection onLinkClick={() => setIsMenuOpen(false)} />
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    )
}
