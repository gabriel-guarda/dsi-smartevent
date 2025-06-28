'use client'

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
    Legend,
    Cell,
} from 'recharts'
import { useEffect, useState } from 'react'

interface ProdutoVendido {
    produto: string
    quantidade: number
    categoria: string
}

const coresPorCategoria: Record<string, string> = {
    'Padaria': '#f59e0b',
    'Bebidas': '#3b82f6',
    'Petshop': '#10b981',
    'Higiene Pessoal': '#8b5cf6',
    'Alimentos Não Perecíveis': '#ef4444',
    'Snacks e Doces': '#ec4899',
    'Congelados': '#0ea5e9',
    'Outros': '#6b7280'
}

export function ChartTopProdutosVendidos() {
    const [data, setData] = useState<ProdutoVendido[]>([])

    useEffect(() => {
        async function fetchData() {
            const res = await fetch('/api/movimentacoes')
            const movimentacoes = await res.json()

            const contagem: Record<string, ProdutoVendido> = {}

            movimentacoes
                .filter((mov: any) => mov.tipo === 'saida')
                .forEach((mov: any) => {
                    mov.itens?.forEach((item: any) => {
                        if (!item.produto || !item.quantidade) return
                        const nome = item.produto
                        const categoriaItem = typeof item.categoria === 'string' && item.categoria.trim() !== ''
                            ? item.categoria
                            : 'Outros'

                        if (!contagem[nome]) {
                            contagem[nome] = {
                                produto: nome,
                                quantidade: 0,
                                categoria: categoriaItem
                            }
                        }

                        contagem[nome].quantidade += Number(item.quantidade)
                    })
                })

            const resultado = Object.values(contagem)
                .sort((a, b) => b.quantidade - a.quantidade)
                .slice(0, 10)

            setData(resultado)
        }

        fetchData()
    }, [])

    return (
        <div className="w-full h-[350px] bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">🥇 Produtos Mais Vendidos</h2>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="produto" type="category" />
                    <Tooltip
                        formatter={(value: number, name: string, props: any) =>
                            [`${value} un.`, `Categoria: ${props.payload.categoria}`]
                        }
                    />
                    <Legend />
                    <Bar dataKey="quantidade" name="Quantidade Vendida">
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={coresPorCategoria[entry.categoria] || '#6b7280'}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}
