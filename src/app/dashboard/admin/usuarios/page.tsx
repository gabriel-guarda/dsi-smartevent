'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import Modal from '@/components/ModalUsuario'
import { Usuario } from '@/types/usuario'

export default function GerenciarUsuarios() {
    const { data: session } = useSession()
    const [usuarios, setUsuarios] = useState<Usuario[]>([])
    const [mostrarModal, setMostrarModal] = useState(false)

    // Restrição de acesso
    if (session && session.user?.perfil !== 'administrador') {
      return (
        <div className="p-6 text-red-600">
          Acesso restrito ao administrador
    </div>
        )
    }

    const carregarUsuarios = async () => {
        const res = await fetch('/api/usuarios', { cache: 'no-store' })
        const dados = await res.json()
        if (res.ok) {
            setUsuarios(dados.usuarios)
        }
    }

    useEffect(() => {
        carregarUsuarios()
    }, [])

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Gerenciamento de Usuários</h1>
                <button
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                    onClick={() => setMostrarModal(true)}
                >
                    Novo Usuário
                </button>
            </div>

            <table className="min-w-full bg-white rounded shadow">
                <thead>
                    <tr className="bg-gray-100 text-left">
                        <th className="p-3">Nome</th>
                        <th className="p-3">E-mail</th>
                        <th className="p-3">Perfil</th>
                        <th className="p-3">Empresa</th>
                        <th className="p-3">Licença</th>
                    </tr>
                </thead>
                <tbody>
                    {usuarios.map((u) => (
                        <tr key={u._id} className="border-b hover:bg-gray-50">
                            <td className="p-3">{u.nome}</td>
                            <td className="p-3">{u.email}</td>
                            <td className="p-3">{u.perfil}</td>
                            <td className="p-3">{u.empresa}</td>
                            <td className="p-3">{u.licenca?.tipo}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {mostrarModal && (
                <Modal
                    onClose={() => {
                        setMostrarModal(false)
                        carregarUsuarios()
                    }}
                />
            )}
        </div>
    )
}
