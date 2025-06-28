'use client'

import { useEffect, useState } from 'react'
import ModalNovaLocalizacao from '@/components/ModalNovaLocalizacao'
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline'

export default function LocalizacoesPage() {
    const [localizacoes, setLocalizacoes] = useState<string[]>([])
    const [modalAberto, setModalAberto] = useState(false)
    const [edicaoIndex, setEdicaoIndex] = useState<number | null>(null)
    const [novoValor, setNovoValor] = useState('')

    const carregar = async () => {
        try {
            const res = await fetch('/api/localizacoes')
            if (!res.ok) throw new Error('Erro ao buscar')
            const data = await res.json()
            setLocalizacoes(data || [])
        } catch (err) {
            console.error('Erro ao buscar localizações:', err)
        }
    }

    useEffect(() => {
        carregar()
    }, [])

    const salvarEdicao = async () => {
        if (edicaoIndex === null || !novoValor.trim()) return

        const nomeAntigo = localizacoes[edicaoIndex]

        try {
            const res = await fetch('/api/localizacoes', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ antigo: nomeAntigo, novo: novoValor }),
            })

            if (!res.ok) throw new Error('Erro ao atualizar localização')
            setEdicaoIndex(null)
            setNovoValor('')
            carregar()
        } catch (err) {
            console.error('Erro ao editar:', err)
            alert('Erro ao editar localização.')
        }
    }

    const excluir = async (nome: string) => {
        const confirmacao = confirm(`Deseja excluir a localização "${nome}"?`)
        if (!confirmacao) return

        try {
            const res = await fetch('/api/localizacoes', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome }),
            })

            if (!res.ok) throw new Error('Erro ao excluir localização')
            carregar()
        } catch (err) {
            console.error('Erro ao excluir localização:', err)
            alert('Erro ao excluir localização.')
        }
    }

    return (
        <div className="p-6">
            <div className="flex justify-between mb-4">
                <h1 className="text-2xl font-bold">Localizações Cadastradas</h1>
                <button
                    onClick={() => setModalAberto(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                    + Nova Localização
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {localizacoes.map((loc, idx) => (
                    <div key={idx} className="bg-slate-100 p-4 rounded shadow flex justify-between items-center">
                        {edicaoIndex === idx ? (
                            <div className="flex w-full gap-2">
                                <input
                                    type="text"
                                    value={novoValor}
                                    onChange={(e) => setNovoValor(e.target.value)}
                                    className="flex-1 border p-2 rounded"
                                />
                                <button onClick={salvarEdicao} className="bg-green-600 text-white px-3 py-1 rounded text-sm">
                                    Salvar
                                </button>
                                <button onClick={() => setEdicaoIndex(null)} className="bg-gray-300 px-3 py-1 rounded text-sm">
                                    Cancelar
                                </button>
                            </div>
                        ) : (
                            <>
                                <span className="text-gray-800">{loc}</span>
                                <div className="flex gap-2">
                                    <PencilSquareIcon
                                        onClick={() => {
                                            setEdicaoIndex(idx)
                                            setNovoValor(loc)
                                        }}
                                        className="w-5 h-5 text-blue-600 hover:text-blue-800 cursor-pointer"
                                    />
                                    <TrashIcon
                                        onClick={() => excluir(loc)}
                                        className="w-5 h-5 text-red-600 hover:text-red-800 cursor-pointer"
                                    />
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>

            {modalAberto && (
                <ModalNovaLocalizacao
                    onClose={() => setModalAberto(false)}
                    onSalvou={carregar}
                />
            )}
        </div>
    )
}
