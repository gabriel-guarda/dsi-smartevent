import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Categoria from '@/models/categoria'

// POST - Cadastrar nova categoria
export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { nome } = body

        if (!nome) {
            return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 })
        }

        await connectDB()

        const existente = await Categoria.findOne({ nome })
        if (existente) {
            return NextResponse.json({ error: 'Categoria já existe' }, { status: 409 })
        }

        const nova = await Categoria.create({ nome })

        return NextResponse.json(nova, { status: 201 })
    } catch (error) {
        console.error('Erro ao cadastrar categoria:', error)
        return NextResponse.json({ error: 'Erro no servidor' }, { status: 500 })
    }
}

// GET - Listar categorias existentes
export async function GET() {
    try {
        await connectDB()
        const categorias = await Categoria.find().sort({ nome: 1 })
        const nomes = categorias.map((cat) => cat.nome)
        return NextResponse.json(nomes)
    } catch (error) {
        console.error('Erro ao buscar categorias:', error)
        return NextResponse.json({ error: 'Erro ao buscar categorias' }, { status: 500 })
    }
}
