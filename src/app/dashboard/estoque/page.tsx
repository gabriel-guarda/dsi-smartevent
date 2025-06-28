'use client'

import { useSession } from 'next-auth/react'

export default function EstoquePage() {
    const { data: session } = useSession()
    const perm = session?.user?.permissoes?.estoque

    if (!perm?.visualizar) {
        return <p className="text-red-500 p-6">Você não tem acesso ao módulo de Estoque.</p>
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Consulta de Estoque</h1>

            {/* Exibir botão de inclusão */}
            {perm.incluir && (
                <button className="bg-green-600 text-white px-4 py-2 rounded mb-4">
                    Novo Item
                </button>
            )}

            {/* Lista de produtos, com botões de edição e exclusão */}
            <table className="w-full">
                <thead>
                    <tr><th>Produto</th><th>Ações</th></tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Produto 1</td>
                        <td className="space-x-2">
                            {perm.alterar && <button className="text-blue-600">Editar</button>}
                            {perm.excluir && <button className="text-red-600">Excluir</button>}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
}
