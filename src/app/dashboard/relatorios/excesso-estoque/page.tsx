'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Item {
    codprod: string
    produto: string
    categoria: string
    quantidade: number
    alertaEstoque: number
    localizacao: string
}

export default function RelatorioExcessoEstoque() {
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
                                alertaEstoque: Number(item.alertaEstoque || 0),
                                localizacao: item.localizacao || '-'
                            }
                        }

                        estoque[id].quantidade += entrada - saida

                        // Atualiza sempre com a última localização conhecida
                        estoque[id].localizacao = item.localizacao || estoque[id].localizacao
                    }
                }

                const resultado = Object.values(estoque).filter(item =>
                    item.alertaEstoque > 0 && item.quantidade > item.alertaEstoque * 7
                )
                setDados(resultado)
            } catch (err) {
                console.error('Erro ao carregar estoque:', err)
            }
        }

        carregarDados()
    }, [])

    const exportarCSV = () => {
        const linhas = [['Código', 'Produto', 'Categoria', 'Quantidade', 'Alerta', 'Localização']]
        dados.forEach(item => {
            linhas.push([
                item.codprod,
                item.produto,
                item.categoria,
                item.quantidade.toString(),
                item.alertaEstoque.toString(),
                item.localizacao
            ])
        })
        const csv = linhas.map(l => l.join(';')).join('\n')
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', 'estoque_excesso.csv')
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">⚠️ Relatório de Excesso de Estoque</h1>
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
                    Mostrando produtos com saldo maior que o dobro do nível de alerta de estoque.
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
                                <th className="border p-2">Localização</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dados.map((item, i) => (
                                <tr key={i} className="bg-yellow-100">
                                    <td className="border p-2">{item.codprod}</td>
                                    <td className="border p-2">{item.produto}</td>
                                    <td className="border p-2">{item.categoria}</td>
                                    <td className="border p-2 text-center">{item.quantidade}</td>
                                    <td className="border p-2 text-center">{item.alertaEstoque}</td>
                                    <td className="border p-2">{item.localizacao}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-sm text-gray-600 mt-6">
                    Nenhum produto com excesso de estoque encontrado.
                </p>
            )}
        </div>
    )
}
