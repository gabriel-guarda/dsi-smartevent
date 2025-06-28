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

interface EntradaMensal {
    mes: string
    compras: number
}

const mesesOrdem = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun']

export function ChartEntradas() {
    const [data, setData] = useState<EntradaMensal[]>([])

    useEffect(() => {
        async function fetchData() {
            const res = await fetch('/api/movimentacoes')
            const movimentacoes = await res.json()

            const entradas = movimentacoes.filter((m: any) => m.tipo === 'entrada')

            const agregadas: Record<string, number> = {}

            entradas.forEach((mov: any) => {
                if (!mov.dataHora || !mov.valor) return
                const data = new Date(mov.dataHora)
                if (isNaN(data.getTime())) return
                const mes = mesesOrdem[data.getMonth()]
                agregadas[mes] = (agregadas[mes] || 0) + mov.valor
            })

            const resultado = mesesOrdem.map((mes) => ({
                mes,
                compras: Number((agregadas[mes] || 0).toFixed(2)),
            }))

            setData(resultado)
        }

        fetchData()
    }, [])

    return (
        <div className="w-full h-[300px] bg-white p-4 rounded shadow">
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
                    <Bar dataKey="compras" fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}
