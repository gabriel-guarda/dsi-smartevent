import { connectDB } from '@/lib/mongodb'
import Movimentacao from '@/models/Movimentacao'
import { NextResponse } from 'next/server'

export async function GET() {
    await connectDB()

    const movimentacoes = await Movimentacao.find()
    const statusMap = new Map<string, number>()

    movimentacoes.forEach((mov: any) => {
        mov.itens?.forEach((item: any) => {
            const status = item.status || 'Ativo'
            const qnt = mov.tipo === 'saida' ? -item.quantidade : item.quantidade

            if (!statusMap.has(status)) {
                statusMap.set(status, qnt)
            } else {
                statusMap.set(status, statusMap.get(status)! + qnt)
            }
        })
    })

    const resultado = Array.from(statusMap.entries()).map(([status, total]) => ({
        status,
        total,
    }))

    return NextResponse.json(resultado)
}
