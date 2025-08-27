import type { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function buildContext(req: NextRequest) {
    const supabase = createSupabaseServerClient()
    const authHeader = req.headers.get('authorization')
    let userId: string | null = null

    if (authHeader) {
        const token = authHeader.replace('Bearer ', '')
        const { data: { user }, error } = await supabase.auth.getUser(token)

        if (user && !error) {
            userId = user.id
        }
    }

    return {
        prisma,
        userId,
    }
}
