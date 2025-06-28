'use client'

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
    CartesianGrid,
} from 'recharts'
import { useEffect, useState } from 'react'

const mesesOrdem = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun']

interface ComparativoMensal {
    mes: string
    entradas: number
    saidas: number
}

export function ChartEntradaVsSaida() {
    const [data, setData] = useState<ComparativoMensal[]>([])

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

            const resultado = mesesOrdem.map((mes) => ({
                mes,
                entradas: Number((agregadas[mes]?.entradas || 0).toFixed(2)),
                saidas: Number((agregadas[mes]?.saidas || 0).toFixed(2)),
            }))

            setData(resultado)
        }

        fetchData()
    }, [])

    return (
        <div className="w-full h-[350px] bg-white p-4 rounded shadow">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} barCategoryGap={20}>
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
                    <Bar dataKey="entradas" fill="#22c55e" name="Entradas" />
                    <Bar dataKey="saidas" fill="#4f46e5" name="Saídas" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}
