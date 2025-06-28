import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import db from '@/models/db'

let statusList: string[] = ['Ativo', 'Inativo', 'Avariado', 'Vencido', 'Reservado']

export async function GET() {
    await connectDB()
    return NextResponse.json(statusList)
}

export async function POST(req: Request) {
    const body = await req.json()
    const novo = (body?.nome || '').trim()

    if (!novo) {
        return NextResponse.json({ error: 'Nome inválido' }, { status: 400 })
    }

    if (!statusList.includes(novo)) {
        statusList.push(novo)
    }

    return NextResponse.json({ ok: true })
}
