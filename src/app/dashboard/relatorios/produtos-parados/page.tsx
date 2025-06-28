'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface ProdutoParado {
    codprod: string
    produto: string
    ultimaMovimentacao: string | null
    diasSemMovimentar: number
    localizacao: string
}

export default function ProdutosParadosRelatorio() {
    const [produtosParados, setProdutosParados] = useState<ProdutoParado[]>([])

    useEffect(() => {
        const carregarProdutos = async () => {
            const res = await fetch('/api/movimentacoes')
            const data = await res.json()
            const movimentacoes = Array.isArray(data.movimentacoes) ? data.movimentacoes : data

            const mapaUltimaMov: Record<string, ProdutoParado> = {}

            for (const mov of movimentacoes) {
                const dataMov = mov.dataHora || mov.data
                const dataObj = new Date(dataMov)

                for (const item of mov.itens || []) {
                    if (!item.codprod) continue

                    const cod = item.codprod
                    const nome = item.produto || 'Sem nome'
                    const local = item.localizacao || 'Não informada'

                    if (!mapaUltimaMov[cod] || new Date(mapaUltimaMov[cod].ultimaMovimentacao!) < dataObj) {
                        mapaUltimaMov[cod] = {
                            codprod: cod,
                            produto: nome,
                            ultimaMovimentacao: dataMov,
                            diasSemMovimentar: 0,
                            localizacao: local
                        }
                    }
                }
            }

            const hoje = new Date()

            const lista: ProdutoParado[] = Object.values(mapaUltimaMov).map((p) => {
                const dataMov = new Date(p.ultimaMovimentacao || '')
                const dias = Math.floor((hoje.getTime() - dataMov.getTime()) / (1000 * 60 * 60 * 24))

                return {
                    ...p,
                    ultimaMovimentacao: dataMov.toLocaleDateString('pt-BR'),
                    diasSemMovimentar: dias
                }
            })

            const ordenado = lista.sort((a, b) => b.diasSemMovimentar - a.diasSemMovimentar)
            setProdutosParados(ordenado)
        }

        carregarProdutos()
    }, [])

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">⏸️ Produtos Parados no Estoque</h1>
                <Link
                    href="/dashboard/relatorios"
                    className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                >
                    Voltar para Relatórios
                </Link>
            </div>

            <div className="overflow-auto">
                <table className="min-w-full border text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="border p-2">Código</th>
                            <th className="border p-2">Produto</th>
                            <th className="border p-2">Localização</th>
                            <th className="border p-2">Última Movimentação</th>
                            <th className="border p-2">Dias Sem Movimentar</th>
                        </tr>
                    </thead>
                    <tbody>
                        {produtosParados.map((p, i) => (
                            <tr key={i}>
                                <td className="border p-2">{p.codprod}</td>
                                <td className="border p-2">{p.produto}</td>
                                <td className="border p-2">{p.localizacao}</td>
                                <td className="border p-2">{p.ultimaMovimentacao}</td>
                                <td className="border p-2">{p.diasSemMovimentar}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
