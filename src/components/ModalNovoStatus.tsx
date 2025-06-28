// src/components/ModalNovoStatus.tsx
'use client'

import { useState } from 'react'

export default function ModalNovoStatus({ onClose, onSalvou }: any) {
    const [status, setStatus] = useState('')

    const salvar = async () => {
        if (!status.trim()) return alert('Digite um status válido.')

        try {
            const res = await fetch('/api/status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome: status })
            })

            if (!res.ok) throw new Error('Erro ao salvar status.')
            setStatus('')
            onClose()
            onSalvou()
        } catch (err) {
            console.error('Erro ao salvar:', err)
            alert('Erro ao salvar.')
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-lg w-[400px]">
                <h2 className="text-xl font-bold mb-4">Novo Status</h2>
                <input
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    placeholder="Ex: Ativo, Vencido, Avariado"
                    className="border p-2 rounded w-full mb-4"
                />
                <div className="flex justify-end gap-2">
                    <button onClick={onClose} className="bg-gray-300 px-4 py-2 rounded">Cancelar</button>
                    <button onClick={salvar} className="bg-blue-600 text-white px-4 py-2 rounded">Salvar</button>
                </div>
            </div>
        </div>
    )
}
