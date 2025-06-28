'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CadastrarMovimentacao() {
    const router = useRouter()

    const [nota, setNota] = useState('')
    const [tipo, setTipo] = useState('Entrada')
    const [quantidade, setQuantidade] = useState(0)
    const [valor, setValor] = useState(0)
    const [responsavel, setResponsavel] = useState('')

    const cadastrar = async () => {
        const res = await fetch('/api/movimentacoes', {
            method: 'POST',
            body: JSON.stringify({
                nota,
                tipo,
                quantidade,
                valor,
                responsavel
            })
        })

        if (res.ok) {
            alert('Movimentação cadastrada com sucesso!')
            router.push('/dashboard/estoque/movimentacoes')
        }
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">➕ Nova Movimentação</h1>

            <div className="flex flex-col gap-4">
                <div>
                    <label>Número da Nota</label>
                    <input
                        type="text"
                        value={nota}
                        onChange={(e) => setNota(e.target.value)}
                        className="border rounded px-3 py-2 w-full"
                    />
                </div>

                <div>
                    <label>Tipo</label>
                    <select
                        value={tipo}
                        onChange={(e) => setTipo(e.target.value)}
                        className="border rounded px-3 py-2 w-full"
                    >
                        <option value="Entrada">Entrada</option>
                        <option value="Saída">Saída</option>
                    </select>
                </div>

                <div>
                    <label>Quantidade</label>
                    <input
                        type="number"
                        value={quantidade}
                        onChange={(e) => setQuantidade(Number(e.target.value))}
                        className="border rounded px-3 py-2 w-full"
                    />
                </div>

                <div>
                    <label>Valor</label>
                    <input
                        type="number"
                        value={valor}
                        onChange={(e) => setValor(Number(e.target.value))}
                        className="border rounded px-3 py-2 w-full"
                    />
                </div>

                <div>
                    <label>Responsável</label>
                    <input
                        type="text"
                        value={responsavel}
                        onChange={(e) => setResponsavel(e.target.value)}
                        className="border rounded px-3 py-2 w-full"
                    />
                </div>

                <button
                    onClick={cadastrar}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                    Salvar Movimentação
                </button>
            </div>
        </div>
    )
}
