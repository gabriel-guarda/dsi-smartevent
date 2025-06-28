'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bar } from 'react-chartjs-2'


import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export default function RelatorioEstoqueCategoria() {
    const router = useRouter()
    const [dados, setDados] = useState<any[]>([])
    const [categorias, setCategorias] = useState<string[]>([])

    useEffect(() => {
        const carregarDados = async () => {
            try {
                const res = await fetch('/api/movimentacoes')
                const data = await res.json()
                const lista: any[] = Array.isArray(data.movimentacoes) ? data.movimentacoes : data

                // Agrupar por categoria
                const mapaCategoria: Record<string, { qtd: number; valor: number }> = {}

                for (const mov of lista) {
                    for (const item of mov.itens || []) {
                        const categoria = item.categoria || 'Sem categoria'
                        const quantidade = Number(item.quantidade) || 0
                        const valor = Number(item.totalItem) || 0

                        if (!mapaCategoria[categoria]) {
                            mapaCategoria[categoria] = { qtd: 0, valor: 0 }
                        }
                        mapaCategoria[categoria].qtd += quantidade
                        mapaCategoria[categoria].valor += valor
                    }
                }

                const categoriasExtraidas = Object.keys(mapaCategoria)
                const dadosFormatados = categoriasExtraidas.map((cat) => ({
                    categoria: cat,
                    qtd: mapaCategoria[cat].qtd,
                    valor: mapaCategoria[cat].valor
                }))

                setCategorias(categoriasExtraidas)
                setDados(dadosFormatados)
            } catch (err) {
                console.error('Erro ao carregar dados:', err)
            }
        }

        carregarDados()
    }, [])

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">📦 Estoque por Categoria</h1>
            <div className="flex justify-end mb-4">
                <button
                    onClick={() => router.push('/dashboard/relatorios')}
                    className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300 text-sm"
                >
                    ← Voltar aos Relatórios
                </button>
            </div>
            {/* Tabela */}
            <div className="overflow-auto mt-4">
                <table className="min-w-full text-sm border border-gray-300">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="border p-2">Categoria</th>
                            <th className="border p-2">Quantidade Total</th>
                            <th className="border p-2">Valor Total (R$)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dados.map((d, i) => (
                            <tr key={i}>
                                <td className="border p-2">{d.categoria}</td>
                                <td className="border p-2">{d.qtd}</td>
                                <td className="border p-2">R$ {d.valor.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Gráfico */}
            <div className="mt-8">
                <Bar
                    data={{
                        labels: categorias,
                        datasets: [
                            {
                                label: 'Valor por Categoria (R$)',
                                data: dados.map((d) => d.valor),
                                backgroundColor: 'rgba(37, 99, 235, 0.6)'
                            }
                        ]
                    }}
                    options={{
                        responsive: true,
                        plugins: { legend: { position: 'top' }, title: { display: false } }
                    }}
                />
            </div>
        </div>
    )
}
