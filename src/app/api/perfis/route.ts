import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Perfil from '@/models/Perfil'

// GET: listar perfis
export async function GET() {
    await connectDB()
    const perfis = await Perfil.find()
    return NextResponse.json({ perfis })
}

// POST: criar novo perfil
export async function POST(req: NextRequest) {
    try {
        await connectDB()
        const body = await req.json()
        const novoPerfil = await Perfil.create(body)
        return NextResponse.json({ sucesso: true, perfil: novoPerfil })
    } catch (erro) {
        return NextResponse.json({ erro: 'Erro ao criar perfil.' }, { status: 500 })
    }
}
