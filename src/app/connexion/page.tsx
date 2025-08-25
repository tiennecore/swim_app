// src/app/connexion/page.tsx
'use client'

import { useState } from 'react'
import { useSupabase } from '@/components/providers/SupabaseProvider'
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from 'next/link'

export default function AuthenticationPage() {
    const supabase = useSupabase()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError(null)
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${location.origin}/auth/callback`,
            }
        })
        if (error) {
            setError(error.message)
        } else {
            alert("Inscription réussie ! Veuillez vérifier vos emails pour confirmer votre compte.")
        }
        setIsSubmitting(false)
    }

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError(null)
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })
        if (error) {
            setError(error.message)
        } else {
            window.location.href = '/mes-entrainements' // Redirige vers la page "Mes entraînements"
        }
        setIsSubmitting(false)
    }

    const handleGoogleLogin = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${location.origin}/auth/callback`,
            },
        })
    }

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
            <Card className="mx-auto max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl">Connexion</CardTitle>
                    <CardDescription>
                        Entrez votre email ci-dessous pour vous connecter à votre compte
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@exemple.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <div className="flex items-center">
                                <Label htmlFor="password">Mot de passe</Label>
                            </div>
                            <Input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        {error && <p className="text-sm text-red-600">{error}</p>}
                        <Button type="submit" className="w-full" onClick={handleSignIn} disabled={isSubmitting}>
                            {isSubmitting ? 'Connexion...' : 'Se connecter'}
                        </Button>
                        <Button variant="outline" className="w-full" onClick={handleGoogleLogin}>
                            Se connecter avec Google
                        </Button>
                    </div>
                    <div className="mt-4 text-center text-sm">
                        Vous n'avez pas de compte ?{" "}
                        <a href="#" className="underline" onClick={handleSignUp}>
                            S'inscrire
                        </a>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
