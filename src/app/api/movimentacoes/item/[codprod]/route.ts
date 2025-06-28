// @ts-nocheck
import { connectDB } from '@/lib/mongodb'
import Movimentacao from '@/models/Movimentacao'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function PUT(
  req: NextRequest,
  context: { params: { codprod: string } }
) {
  await connectDB();
  const { codprod } = params;
  const { status, localizacao } = await req.json();

  try {
    const resultado = await Movimentacao.updateMany(
      { 'itens.codprod': codprod },
      {
        $set: {
          'itens.$[elem].status': status,
          'itens.$[elem].localizacao': localizacao,
        },
      },
      {
        arrayFilters: [{ 'elem.codprod': codprod }],
      }
    );

    return NextResponse.json({
      sucesso: true,
      modificado: resultado.modifiedCount,
    });
  } catch (error) {
    console.error('Erro ao atualizar item:', error);
    return NextResponse.json(
      { erro: 'Erro ao atualizar item' },
      { status: 500 }
    );
  }
}