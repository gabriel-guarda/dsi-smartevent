import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Movimentacao from '@/models/Movimentacao';
import { publishMovimentacao } from '@/lib/redisPublisher';


export async function GET() {
    await connectDB()
    const movimentacoes = await Movimentacao.find().sort({ createdAt: -1 })
    return NextResponse.json(movimentacoes)
}

export async function POST(req: Request) {
    try {
        const body = await req.json()
        console.log('[DEBUG] Payload recebido:', body)

        const {
            dataHora,
            nota,
            tipo,
            responsavel,
            clienteOuFornecedor,
            documento,
            itens,
            quantidade,
            valor,
        } = body

        await connectDB()
        const itensComCampos = itens.map((item: any) => ({
            ...item,
            status: item.status || 'Ativo',
            localizacao: item.localizacao || '-'
        }))

        const novaMov = await Movimentacao.create({
            dataHora,
            nota,
            tipo,
            responsavel,
            clienteOuFornecedor: clienteOuFornecedor || '',
            documento: documento || '',
            itens: itensComCampos,
            quantidade,
            valor,
        });

        await publishMovimentacao(novaMov)


        return NextResponse.json(novaMov, { status: 201 })
    } catch (error) {
        console.error('❌ Erro ao criar movimentação:', error)
        console.log('[DEBUG] Erro capturado, não foi possível recuperar o corpo do request.')

        return NextResponse.json({ error: 'Erro no servidor.' }, { status: 500 })
    }


}
export async function PUT(req: Request) {
    try {
        const body = await req.json()
        const { codprod, ...dados } = body

        if (!codprod) {
            return NextResponse.json({ message: 'Código do produto não informado' }, { status: 400 })
        }

        await connectDB()
        const updateFields: any = {}

        if (dados.nome !== undefined) updateFields['itens.$[elem].produto'] = dados.nome
        if (dados.descricao !== undefined) updateFields['itens.$[elem].descricao'] = dados.descricao
        if (dados.valorVenda !== undefined) updateFields['itens.$[elem].valorUnitario'] = dados.valorVenda
        if (dados.alertaEstoque !== undefined) updateFields['itens.$[elem].alertaEstoque'] = dados.alertaEstoque
        if (dados.tipoEmbalagem !== undefined) updateFields['itens.$[elem].tipoEmbalagem'] = dados.tipoEmbalagem

        const result = await Movimentacao.updateMany(
            { 'itens.codprod': String(codprod) },
            { $set: updateFields },
            { arrayFilters: [{ 'elem.codprod': String(codprod) }] }
        )

        return NextResponse.json({ message: 'Produto atualizado', result }, { status: 200 })
    } catch (error) {
        console.error('Erro no PUT /api/movimentacoes:', error)
        return NextResponse.json({ message: 'Erro ao atualizar' }, { status: 500 })
    }
}


