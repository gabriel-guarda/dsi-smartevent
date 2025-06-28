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

const mesesOrdem = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun']

interface LucroMensal {
    mes: string
    lucro: number
}

export function ChartLucroEstimado() {
    const [data, setData] = useState<LucroMensal[]>([])

    useEffect(() => {
        async function fetchData() {
            const res = await fetch('/api/movimentacoes')
            const movimentacoes = await res.json()

            const agregadas: Record<string, { entradas: number; saidas: number }> = {}

            movimentacoes.forEach((mov: any) => {
                if (!mov.dataHora || !mov.valor) return
                const data = new Date(mov.dataHora)
                if (isNaN(data.getTime())) return

                const mes = mesesOrdem[data.getMonth()]
                if (!agregadas[mes]) {
                    agregadas[mes] = { entradas: 0, saidas: 0 }
                }

                if (mov.tipo === 'entrada') {
                    agregadas[mes].entradas += mov.valor
                } else if (mov.tipo === 'saida') {
                    agregadas[mes].saidas += mov.valor
                }
            })

            const resultado = mesesOrdem.map((mes) => {
                const totalEntrada = agregadas[mes]?.entradas || 0
                const totalSaida = agregadas[mes]?.saidas || 0
                return {
                    mes,
                    lucro: Number((totalSaida - totalEntrada).toFixed(2)),
                }
            })

            setData(resultado)
        }

        fetchData()
    }, [])

    return (
        <div className="w-full h-[350px] bg-white p-4 rounded shadow">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip
                        formatter={(value: number) =>
                            new Intl.NumberFormat('pt-BR', {
                                style: 'currency',
                                currency: 'BRL',
                            }).format(value)
                        }
                    />
                    <Legend />
                    <Bar dataKey="lucro" name="Lucro Estimado">
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={entry.lucro >= 0 ? '#10b981' : '#ef4444'}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}
