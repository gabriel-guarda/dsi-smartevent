'use client'

import { useRouter } from 'next/navigation'

interface EstoqueHeaderProps {
    titulo: string
}

export default function EstoqueHeader({ titulo }: EstoqueHeaderProps) {
    const router = useRouter()

    return (
        <div className="flex justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">{titulo}</h1>

            <div className="flex gap-4">
                <button
                    onClick={() => router.back()}
                    className="bg-slate-300 hover:bg-slate-400 text-slate-800 px-4 py-2 rounded"
                >
                    Voltar
                </button>
                <button
                    onClick={() => alert('Abrir modal ou navegar para cadastrar categoria')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                    Cadastrar Categoria
                </button>
            </div>
        </div>
    )
}
