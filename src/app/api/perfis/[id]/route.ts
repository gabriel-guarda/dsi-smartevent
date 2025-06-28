import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Perfil from '@/models/Perfil'

// PUT: atualizar perfil
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    await connectDB()
    const body = await req.json()
    const atualizado = await Perfil.findByIdAndUpdate(params.id, body, { new: true })
    return NextResponse.json({ sucesso: true, perfil: atualizado })
}

// DELETE: excluir perfil
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    await connectDB()
    await Perfil.findByIdAndDelete(params.id)
    return NextResponse.json({ sucesso: true })
}
