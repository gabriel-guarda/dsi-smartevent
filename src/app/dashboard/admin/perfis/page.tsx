'use client'

import { useEffect, useState } from 'react'
import ModalPerfil from '@/components/ModalPerfil'
import { Perfil } from '@/types/perfil'

export default function PerfisModeloPage() {
    const [perfis, setPerfis] = useState<Perfil[]>([])
    const [modalAberto, setModalAberto] = useState(false)
    const [perfilSelecionado, setPerfilSelecionado] = useState<Perfil | null>(null)

    const carregarPerfis = async () => {
        const res = await fetch('/api/perfis')
        const dados = await res.json()
        if (res.ok) setPerfis(dados.perfis)
    }

    useEffect(() => {
        carregarPerfis()
    }, [])

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Perfis Modelo</h1>
                <button
                    onClick={() => {
                        setPerfilSelecionado(null)
                        setModalAberto(true)
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                    Novo Perfil
                </button>
            </div>

            <table className="w-full bg-white rounded shadow">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="p-3 text-left">Nome</th>
                        <th className="p-3 text-left">Descrição</th>
                        <th className="p-3 text-left">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {perfis.map(perfil => (
                        <tr key={perfil._id} className="border-b hover:bg-gray-50">
                            <td className="p-3">{perfil.nome}</td>
                            <td className="p-3">{perfil.descricao}</td>
                            <td className="p-3 space-x-2">
                                <button
                                    onClick={() => {
                                        setPerfilSelecionado(perfil)
                                        setModalAberto(true)
                                    }}
                                    className="text-blue-600"
                                >
                                    Editar
                                </button>
                                <button
                                    onClick={async () => {
                                        await fetch(`/api/perfis/${perfil._id}`, { method: 'DELETE' })
                                        carregarPerfis()
                                    }}
                                    className="text-red-600"
                                >
                                    Excluir
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {modalAberto && (
                <ModalPerfil
                    perfil={perfilSelecionado}
                    onClose={() => {
                        setModalAberto(false)
                        carregarPerfis()
                    }}
                />
            )}
        </div>
    )
}
