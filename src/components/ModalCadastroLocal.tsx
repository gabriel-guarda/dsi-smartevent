'use client'

import { useState } from 'react'

interface Props {
    onClose: () => void
    onSalvar: (local: { nome: string; tipo: string }) => void
}

export default function ModalCadastroLocal({ onClose, onSalvar }: Props) {
    const [nome, setNome] = useState('')
    const [tipo, setTipo] = useState('Prateleira')

    const handleSalvar = () => {
        if (nome.trim()) {
            onSalvar({ nome, tipo })
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-lg w-[400px] flex flex-col gap-4">
                <h2 className="text-xl font-bold">Nova Localização</h2>

                <div>
                    <label className="block font-medium">Nome</label>
                    <input
                        type="text"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        className="border p-2 rounded w-full"
                    />
                </div>

                <div>
                    <label className="block font-medium">Tipo</label>
                    <select
                        value={tipo}
                        onChange={(e) => setTipo(e.target.value)}
                        className="border p-2 rounded w-full"
                    >
                        <option value="Prateleira">Prateleira</option>
                        <option value="Freezer">Freezer</option>
                        <option value="Adega">Adega</option>
                        <option value="Corredor">Corredor</option>
                        <option value="Sala">Sala</option>
                    </select>
                </div>

                <div className="flex justify-end gap-2">
                    <button onClick={onClose} className="bg-gray-300 px-4 py-2 rounded">
                        Cancelar
                    </button>
                    <button
                        onClick={handleSalvar}
                        className="bg-blue-600 text-white px-4 py-2 rounded"
                    >
                        Salvar
                    </button>
                </div>
            </div>
        </div>
    )
}
