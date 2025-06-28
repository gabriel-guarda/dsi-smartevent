'use client'

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from 'recharts'
import { useEffect, useState } from 'react'

type ProdutoEstoque = {
    codprod: string
    produto: string
    quantidade: number
    categoria: string
}

export function ChartEstoquePorProduto() {
    const [estoque, setEstoque] = useState<ProdutoEstoque[]>([])
    const [categoriaSelecionada, setCategoriaSelecionada] = useState('')

    useEffect(() => {
        async function fetchData() {
            const res = await fetch('/api/movimentacoes')
            const movimentacoes = await res.json()

            const mapa: Record<string, ProdutoEstoque> = {}

            movimentacoes.forEach((mov: any) => {
                if (!mov.itens || !mov.tipo) return

                mov.itens.forEach((item: any) => {
                    const key = item.codprod
                    if (!key) return

                    if (!mapa[key]) {
                        mapa[key] = {
                            codprod: key,
                            produto: item.produto,
                            categoria: item.categoria,
                            quantidade: 0,
                        }
                    }

                    const delta = Number(item.quantidade)
                    mapa[key].quantidade += mov.tipo === 'entrada' ? delta : -delta
                })
            })

            const lista = Object.values(mapa).filter(p => p.quantidade > 0)
            setEstoque(lista)
            if (lista.length > 0) {
                setCategoriaSelecionada(lista[0].categoria)
            }
        }

        fetchData()
    }, [])

    const categorias = [...new Set(estoque.map(p => p.categoria))]

    const produtosFiltrados = estoque
        .filter(p => p.categoria === categoriaSelecionada)
        .sort((a, b) => b.quantidade - a.quantidade)

    return (
        <div className="w-full bg-white p-6 rounded shadow space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                    📦 Estoque por Produto – Categoria
                </h2>
                <select
                    className="border p-2 rounded"
                    value={categoriaSelecionada}
                    onChange={(e) => setCategoriaSelecionada(e.target.value)}
                >
                    {categorias.map((cat) => (
                        <option key={cat} value={cat}>
                            {cat}
                        </option>
                    ))}
                </select>
            </div>

            <ResponsiveContainer width="100%" height={400}>
                <BarChart data={produtosFiltrados}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="produto" />
                    <YAxis />
                    <Tooltip
                        formatter={(value: number) => `${value} un.`}
                        labelFormatter={(label) => `Produto: ${label}`}
                    />
                    <Bar dataKey="quantidade" fill="#6366f1" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}
