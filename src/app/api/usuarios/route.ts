import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/mongodb'
import Usuario from '@/models/Usuario'


export async function GET(req: NextRequest) {
    try {
        await connectDB()

        const usuarios = await Usuario.find({}, '-senhaHash') // oculta o campo de senha

        return NextResponse.json({ usuarios })
    } catch (erro) {
        console.error('[GET USUARIOS]', erro)
        return NextResponse.json({ erro: 'Erro ao carregar usuários' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        await connectDB()
        const data = await req.json()

        const { nome, email, usuario, senha, perfil, empresa, licenca, permissoes } = data

        if (!nome || !email || !usuario || !senha || !perfil || !empresa || !licenca) {
            return NextResponse.json({ erro: 'Campos obrigatórios faltando.' }, { status: 400 })
        }

        const existente = await Usuario.findOne({ email })
        if (existente) {
            return NextResponse.json({ erro: 'E-mail já cadastrado.' }, { status: 409 })
        }

        const senhaHash = await bcrypt.hash(senha, 10)

        const novoUsuario = new Usuario({
            nome,
            email,
            usuario,
            senhaHash,
            perfil,
            empresa,
            licenca,
            permissoes: permissoes || {},
            ativo: true
        })

        await novoUsuario.save()

        return NextResponse.json({ sucesso: true, usuario: novoUsuario })
    } catch (erro: any) {
        console.error('[ERRO API USUARIOS]', erro)
        return NextResponse.json({ erro: 'Erro interno no servidor.' }, { status: 500 })
    }
}
