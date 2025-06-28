import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Localizacao from '@/models/Localizacao'

export async function POST(req: Request) {
    try {
        const { nome } = await req.json()
        if (!nome) return NextResponse.json({ error: 'Nome obrigatório' }, { status: 400 })

        await connectDB()
        const nova = await Localizacao.create({ nome })

        return NextResponse.json(nova, { status: 201 })
    } catch (error) {
        console.error('Erro ao salvar localização:', error)
        return NextResponse.json({ error: 'Erro no servidor' }, { status: 500 })
    }
}

export async function GET() {
    try {
        await connectDB()
        const todas = await Localizacao.find().sort({ nome: 1 })
        const nomes = todas.map(l => l.nome)
        return NextResponse.json(nomes)
    } catch (error) {
        console.error('Erro ao buscar localizações:', error)
        return NextResponse.json({ error: 'Erro no servidor' }, { status: 500 })
    }
}
export async function PUT(req: Request) {
    const { antigo, novo } = await req.json()
    await connectDB()
    await Localizacao.updateOne({ nome: antigo }, { nome: novo })
    return NextResponse.json({ ok: true })
}

export async function DELETE(req: Request) {
    const { nome } = await req.json()
    await connectDB()
    await Localizacao.deleteOne({ nome })
    return NextResponse.json({ ok: true })
}

