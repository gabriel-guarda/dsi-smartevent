import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Movimentacao from '@/models/Movimentacao'

export async function PUT(req: Request) {
    try {
        await connectDB()
        const { codprod, status, localizacao } = await req.json()

        // Atualiza apenas o item com o codprod correspondente
        const resultado = await Movimentacao.updateOne(
            { "itens.codprod": codprod },
            {
                $set: {
                    "itens.$.status": status,
                    "itens.$.localizacao": localizacao
                }
            }
        )

        if (resultado.modifiedCount === 0) {
            return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
        }

        return NextResponse.json({ sucesso: true })
    } catch (error) {
        console.error('[ERRO PUT /api/movimentacoes/item]:', error)
        return NextResponse.json({ error: 'Erro no servidor' }, { status: 500 })
    }
}
