// src/app/api/campanhas/route.ts
import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Campanha } from '@/models/Campanha'

export async function GET() {
    try {
        await connectDB()
        const campanhas = await Campanha.find().sort({ createdAt: -1 }) // retorna as mais recentes primeiro
        return NextResponse.json({ campanhas })
    } catch (err) {
        console.error('Erro ao buscar campanhas:', err)
        return NextResponse.json({ error: 'Erro ao carregar campanhas' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        await connectDB()
        const body = await req.json()

        const { tipo, titulo, descricao, produtos, inicio, fim } = body

        if (!tipo || !titulo || !produtos || produtos.length === 0) {
            return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 })
        }

        const novaCampanha = await Campanha.create({
            tipo,
            titulo,
            descricao,
            produtos
        })

        return NextResponse.json({ message: 'Campanha salva com sucesso', campanha: novaCampanha }, { status: 201 })
    } catch (err: any) {
        console.error('Erro ao salvar campanha:', err)
        return NextResponse.json({ error: 'Erro ao salvar campanha' }, { status: 500 })
    }
}
