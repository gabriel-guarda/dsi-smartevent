import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Usuario from '@/models/Usuario'

export async function GET() {
  try {
    await connectDB()

    // Retorna empresas únicas dos usuários cadastrados
    const empresas = await Usuario.distinct('empresa')

    return NextResponse.json({ empresas })
  } catch (erro) {
    console.error('[GET EMPRESAS]', erro)
    return NextResponse.json({ erro: 'Erro ao buscar empresas' }, { status: 500 })
  }
}
