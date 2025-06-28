'use client'

import { useState } from 'react'
import { Usuario } from '@/types/usuario'

interface Props {
    usuario: Usuario
    onClose: () => void
}

export default function ModalPermissoes({ usuario, onClose }: Props) {
    const [permissoes, setPermissoes] = useState(
        usuario.permissoes?.estoque || {
            visualizar: false,
            incluir: false,
            alterar: false,
            excluir: false
        }
    )


    const toggle = (campo: keyof typeof permissoes) => {
        setPermissoes(prev => ({ ...prev, [campo]: !prev[campo] }))
    }

    const salvar = async () => {
        const body = {
            permissoes: {
                estoque: permissoes
            }
        }

        const res = await fetch(`/api/usuarios/${usuario._id}/permissoes`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        })

        if (res.ok) {
            alert('Permissões atualizadas com sucesso!')
            onClose()
        } else {
            const erro = await res.json()
            alert('Erro: ' + erro?.erro)
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-lg">
                <h2 className="text-xl font-semibold mb-4">Permissões - {usuario.nome}</h2>

                <h3 className="text-lg font-medium mb-2">Estoque</h3>
                <div className="space-y-2">
                    <label className="flex items-center gap-2">
                        <input type="checkbox" checked={permissoes.visualizar} onChange={() => toggle('visualizar')} />
                        Visualizar
                    </label>
                    <label className="flex items-center gap-2">
                        <input type="checkbox" checked={permissoes.incluir} onChange={() => toggle('incluir')} />
                        Incluir
                    </label>
                    <label className="flex items-center gap-2">
                        <input type="checkbox" checked={permissoes.alterar} onChange={() => toggle('alterar')} />
                        Alterar
                    </label>
                    <label className="flex items-center gap-2">
                        <input type="checkbox" checked={permissoes.excluir} onChange={() => toggle('excluir')} />
                        Excluir
                    </label>

                </div>

                <div className="flex justify-end mt-6 space-x-3">
                    <button onClick={onClose} className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">Cancelar</button>
                    <button onClick={salvar} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Salvar</button>
                </div>
            </div>
        </div>
    )
}
