'use client'

import { useState } from 'react'
import { Perfil } from '@/types/perfil'

interface Props {
    perfil?: Perfil | null
    onClose: () => void
}

export default function ModalPerfil({ perfil, onClose }: Props) {
    const [nome, setNome] = useState(perfil?.nome || '')
    const [descricao, setDescricao] = useState(perfil?.descricao || '')
    const [estoque, setEstoque] = useState(
        perfil?.permissoes?.estoque || {
            visualizar: false,
            incluir: false,
            alterar: false,
            excluir: false
        }
    )

    const toggle = (campo: keyof typeof estoque) => {
        setEstoque(prev => ({ ...prev, [campo]: !prev[campo] }))
    }

    const salvar = async () => {
        const body = {
            nome,
            descricao,
            permissoes: {
                estoque
            }
        }

        const res = await fetch(perfil?._id ? `/api/perfis/${perfil._id}` : '/api/perfis', {
            method: perfil?._id ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        })

        if (res.ok) {
            onClose()
        } else {
            const erro = await res.json()
            alert(erro.erro || 'Erro ao salvar perfil.')
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-lg">
                <h2 className="text-xl font-semibold mb-4">
                    {perfil ? 'Editar Perfil' : 'Novo Perfil'}
                </h2>

                <input
                    type="text"
                    placeholder="Nome do perfil"
                    value={nome}
                    onChange={e => setNome(e.target.value)}
                    className="w-full mb-3 border px-4 py-2 rounded"
                />

                <input
                    type="text"
                    placeholder="Descrição"
                    value={descricao}
                    onChange={e => setDescricao(e.target.value)}
                    className="w-full mb-4 border px-4 py-2 rounded"
                />

                <h3 className="text-lg font-medium mb-2">Permissões - Estoque</h3>
                <div className="space-y-2">
                    {(['visualizar', 'incluir', 'alterar', 'excluir'] as const).map((p) => (
                        <label key={p} className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={estoque[p]}
                                onChange={() => toggle(p)}
                            />
                            {p.charAt(0).toUpperCase() + p.slice(1)}
                        </label>
                    ))}
                </div>

                <div className="flex justify-end mt-6 space-x-3">
                    <button onClick={onClose} className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">Cancelar</button>
                    <button onClick={salvar} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Salvar</button>
                </div>
            </div>
        </div>
    )
}
