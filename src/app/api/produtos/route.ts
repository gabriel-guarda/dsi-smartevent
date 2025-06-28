import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Produto from '@/models/produtos'

// GET /api/produtos -> lista todos os produtos com codprod
export async function GET(req: Request) {
    await connectDB()
    const { searchParams } = new URL(req.url)
    const cod = searchParams.get('codprod')

    if (cod) {
        const encontrado = await Produto.findOne({ codprod: cod })
        if (!encontrado) return NextResponse.json(null, { status: 404 })

        return NextResponse.json({
            codprod: encontrado.codprod,
            produto: encontrado.nome,
            categoria: encontrado.categoria,
        })
    }

    // Se não passar codprod, retorna todos
    const todos = await Produto.find()
    return NextResponse.json(todos)
}
