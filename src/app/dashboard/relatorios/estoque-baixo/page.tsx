'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Item {
    codprod: string
    produto: string
    categoria: string
    quantidade: number
    alertaEstoque: number
}

export default function RelatorioEstoqueBaixo() {
    const [dados, setDados] = useState<Item[]>([])
    const router = useRouter()

    useEffect(() => {
        const carregarDados = async () => {
            try {
                const res = await fetch('/api/movimentacoes')
                const data = await res.json()
                const lista = Array.isArray(data.movimentacoes) ? data.movimentacoes : data

                const estoque: Record<string, Item> = {}

                for (const mov of lista) {
                    const tipo = mov.tipo
                    for (const item of mov.itens || []) {
                        const id = item.codprod
                        if (!id) continue

                        const entrada = tipo === 'entrada' ? Number(item.quantidade) : 0
                        const saida = tipo === 'saida' ? Number(item.quantidade) : 0

                        if (!estoque[id]) {
                            estoque[id] = {
                                codprod: item.codprod,
                                produto: item.produto || '-',
                                categoria: item.categoria || '-',
                                quantidade: 0,
                                alertaEstoque: Number(item.alertaEstoque || 0)
                            }
                        }

                        estoque[id].quantidade += entrada - saida
                    }
                }

                const resultado = Object.values(estoque).filter(item => item.quantidade < item.alertaEstoque)
                setDados(resultado)
            } catch (err) {
                console.error('Erro ao carregar estoque:', err)
            }
        }

        carregarDados()
    }, [])

    const exportarCSV = () => {
        const linhas = [['Código', 'Produto', 'Categoria', 'Quantidade', 'Alerta']]
        dados.forEach(item => {
            linhas.push([
                item.codprod,
                item.produto,
                item.categoria,
                item.quantidade.toString(),
                item.alertaEstoque.toString()
            ])
        })
        const csv = linhas.map(l => l.join(';')).join('\n')
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', 'estoque_baixo.csv')
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">📉 Relatório de Estoque Baixo</h1>
                <div className="flex gap-2">
                    <button
                        onClick={exportarCSV}
                        className="px-4 py-1 bg-green-600 text-white rounded"
                    >
                        Exportar CSV
                    </button>
                    <button
                        onClick={() => router.push('/dashboard/relatorios')}
                        className="text-sm text-blue-600 border px-3 py-1 rounded hover:bg-blue-50"
                    >
                        Voltar
                    </button>
                </div>
            </div>

            <div className="bg-gray-50 border p-4 rounded mb-4">
                <p className="text-sm text-gray-600">
                    Mostrando produtos com saldo abaixo do alerta de estoque.
                </p>
            </div>

            {dados.length > 0 ? (
                <div className="overflow-auto mt-4">
                    <table className="min-w-full text-sm border border-gray-300">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border p-2">Código</th>
                                <th className="border p-2">Produto</th>
                                <th className="border p-2">Categoria</th>
                                <th className="border p-2">Qtd Atual</th>
                                <th className="border p-2">Alerta</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dados.map((item, i) => (
                                <tr
                                    key={i}
                                    className={item.quantidade === 0 ? 'bg-red-100' : 'bg-orange-100'}
                                >
                                    <td className="border p-2">{item.codprod}</td>
                                    <td className="border p-2">{item.produto}</td>
                                    <td className="border p-2">{item.categoria}</td>
                                    <td className="border p-2 text-center">{item.quantidade}</td>
                                    <td className="border p-2 text-center">{item.alertaEstoque}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-sm text-gray-600 mt-6">Nenhum produto com estoque abaixo do alerta.</p>
            )}
        </div>
    )
}
