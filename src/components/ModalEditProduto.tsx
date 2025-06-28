'use client'

import { useState, useEffect } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'

type ProdutoEstoque = {
    codprod: string
    produto: string
    quantidade: number
    status: string
    localizacao: string
}

interface ModalEditProdutoProps {
    produto: ProdutoEstoque
    onClose: () => void
    onSalvar: (produto: ProdutoEstoque) => void
}

export default function ModalEditProduto({ produto, onClose, onSalvar }: ModalEditProdutoProps) {
    const [status, setStatus] = useState(produto.status)
    const [localizacao, setLocalizacao] = useState(produto.localizacao)
    const [statusOptions, setStatusOptions] = useState<string[]>([])
    const [localizacoes, setLocalizacoes] = useState<string[]>([])

    useEffect(() => {
        const carregarStatus = async () => {
            try {
                const res = await fetch('/api/status')
                if (!res.ok) throw new Error('Erro ao buscar status')
                const data = await res.json()
                setStatusOptions(data || [])
            } catch (err) {
                console.error('Erro ao carregar status:', err)
            }
        }

        const carregarLocalizacoes = async () => {
            try {
                const res = await fetch('/api/localizacoes')
                if (!res.ok) throw new Error('Erro ao buscar localizações')
                const data = await res.json()
                setLocalizacoes(data || [])
            } catch (err) {
                console.error('Erro ao carregar localizações:', err)
            }
        }

        carregarStatus()
        carregarLocalizacoes()
    }, [])

    const handleSalvar = async () => {
        const atualizado = { ...produto, status, localizacao }

        try {
            const res = await fetch(`/api/movimentacoes/item/${produto.codprod}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status, localizacao }),
            })



            if (!res.ok) throw new Error('Erro ao salvar alterações')

            onSalvar(atualizado)
            onClose()
        } catch (error) {
            console.error('Erro ao atualizar produto:', error)
            alert('Erro ao salvar no banco.')
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-lg w-[400px] relative">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                >
                    <XMarkIcon className="h-5 w-5" />
                </button>

                <h2 className="text-xl font-bold mb-4">Editar Produto</h2>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Selecione</option>
                        {statusOptions.map((opt) => (
                            <option key={opt} value={opt}>
                                {opt}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Localização</label>
                    <select
                        value={localizacao}
                        onChange={(e) => setLocalizacao(e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Selecione</option>
                        {localizacoes.map((loc) => (
                            <option key={loc} value={loc}>
                                {loc}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSalvar}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                    >
                        Salvar
                    </button>
                </div>
            </div>
        </div>
    )
}
