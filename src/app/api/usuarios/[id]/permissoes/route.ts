import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Usuario from '@/models/Usuario'
import mongoose from 'mongoose'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        await connectDB()

        const id = params.id
        const body = await req.json()

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ erro: 'ID inválido.' }, { status: 400 })
        }

        if (!body.permissoes || typeof body.permissoes !== 'object') {
            return NextResponse.json({ erro: 'Permissões não fornecidas corretamente.' }, { status: 400 })
        }

        const atualizado = await Usuario.findByIdAndUpdate(
            id,
            { permissoes: body.permissoes },
            { new: true }
        ).select('-senhaHash')

        if (!atualizado) {
            return NextResponse.json({ erro: 'Usuário não encontrado.' }, { status: 404 })
        }

        return NextResponse.json({ sucesso: true, usuario: atualizado })
    } catch (erro) {
        console.error('[PUT /usuarios/:id/permissoes]', erro)
        return NextResponse.json({ erro: 'Erro ao atualizar permissões.' }, { status: 500 })
    }
}
