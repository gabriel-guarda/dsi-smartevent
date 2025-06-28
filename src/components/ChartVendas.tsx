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

interface VendaMensal {
    mes: string
    vendas: number
}

const mesesOrdem = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun']

export function ChartVendas() {
    const [data, setData] = useState<VendaMensal[]>([])

    useEffect(() => {
        async function fetchData() {
            const res = await fetch('/api/movimentacoes')
            const movimentacoes = await res.json()

            const saidas = movimentacoes.filter((m: any) => m.tipo === 'saida')

            const agregadas: Record<string, number> = {}

            saidas.forEach((mov: any) => {
                if (!mov.dataHora || !mov.valor) return
                const data = new Date(mov.dataHora)
                if (isNaN(data.getTime())) return
                const mes = mesesOrdem[data.getMonth()]
                agregadas[mes] = (agregadas[mes] || 0) + mov.valor
            })

            const resultado = mesesOrdem.map((mes) => ({
                mes,
                vendas: Number((agregadas[mes] || 0).toFixed(2)),
            }))

            console.log('✅ Dados finais para gráfico:', resultado)
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

                    <Bar dataKey="vendas" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}
