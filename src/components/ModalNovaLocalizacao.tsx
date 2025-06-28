'use client'

import { useState } from 'react'

export default function ModalNovaLocalizacao({ onClose, onSalvou }: { onClose: () => void, onSalvou: () => void }) {
    const [nome, setNome] = useState('')

    const salvar = async () => {
        if (!nome.trim()) return alert('Digite um nome válido.')

        try {
            const res = await fetch('/api/localizacoes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome }),
            })
            if (!res.ok) throw new Error('Erro ao salvar')
            setNome('')
            onClose()
            onSalvou()
        } catch (err) {
            console.error('Erro:', err)
            alert('Erro ao salvar localização.')
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow w-[400px]">
                <h2 className="text-xl font-bold mb-4">Nova Localização</h2>
                <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Ex: Freezer A1, Prateleira B2"
                    className="border p-2 rounded w-full mb-4"
                />
                <div className="flex justify-end gap-2">
                    <button onClick={onClose} className="bg-gray-300 px-4 py-2 rounded">
                        Cancelar
                    </button>
                    <button onClick={salvar} className="bg-blue-600 text-white px-4 py-2 rounded">
                        Salvar
                    </button>
                </div>
            </div>
        </div>
    )
}
