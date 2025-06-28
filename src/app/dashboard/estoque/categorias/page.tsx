'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NovaCategoriaPage() {
    const [nome, setNome] = useState('')
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const res = await fetch('/api/categorias', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome }),
        })

        if (res.ok) {
            router.push('/dashboard/estoque/consultar') // Redireciona para consulta
        } else {
            alert('Erro ao cadastrar categoria')
        }
    }

    return (
        <div className="p-6 max-w-xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Cadastrar Nova Categoria</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="text"
                    placeholder="Nome da Categoria"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                    className="w-full border px-3 py-2 rounded"
                />
                <div className="flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="bg-slate-300 px-4 py-2 rounded"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-4 py-2 rounded"
                    >
                        Salvar
                    </button>
                </div>
            </form>
        </div>
    )
}
