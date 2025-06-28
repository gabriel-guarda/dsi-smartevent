'use client'

import { useState } from 'react'

export default function ModalNovaCategoria({
    onClose,
    onSalvou,
}: {
    onClose: () => void
    onSalvou: () => void
}) {
    const [nome, setNome] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const res = await fetch('/api/categorias', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome }),
        })

        if (res.ok) {
            setNome('')
            onSalvou()
            onClose()
        } else {
            const error = await res.json()
            alert(error.error || 'Erro ao salvar categoria')
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-lg flex flex-col gap-4 w-[400px]">
                <h2 className="text-xl font-bold">Nova Categoria</h2>

                <input
                    type="text"
                    placeholder="Nome da categoria"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="border p-2 rounded"
                    required
                />

                <div className="flex justify-end gap-2">
                    <button type="button" onClick={onClose} className="bg-gray-300 px-4 py-2 rounded">Cancelar</button>
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Salvar</button>
                </div>
            </form>
        </div>
    )
}
