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
} from 'recharts'
import { useEffect, useState } from 'react'

interface CategoriaEstoque {
    categoria: string
    saldo: number
}

export function ChartEstoquePorCategoria() {
    const [data, setData] = useState<CategoriaEstoque[]>([])

    useEffect(() => {
        async function fetchData() {
            const res = await fetch('/api/movimentacoes')
            const movimentacoes = await res.json()

            const categorias: Record<string, number> = {}

            movimentacoes.forEach((mov: any) => {
                if (!mov.itens || !mov.tipo) return

                mov.itens.forEach((item: any) => {
                    if (!item.categoria || !item.quantidade) return

                    const key = item.categoria
                    const qtd = Number(item.quantidade)

                    if (!categorias[key]) categorias[key] = 0

                    categorias[key] += mov.tipo === 'entrada' ? qtd : -qtd
                })
            })

            const resultado = Object.entries(categorias).map(([categoria, saldo]) => ({
                categoria,
                saldo,
            }))

            setData(resultado)
        }

        fetchData()
    }, [])

    return (
        <div className="w-full h-[350px] bg-white p-4 rounded shadow">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="categoria" />
                    <Tooltip />
                    <Legend />
                    <Bar
                        dataKey="saldo"
                        fill="#4f46e5"
                        name="Qtd. em Estoque"
                        radius={[0, 8, 8, 0]}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}
