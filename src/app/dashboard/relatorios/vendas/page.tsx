'use client'

import { useState } from 'react'
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

export default function RelatorioVendasPage() {
    const router = useRouter()
    const [filtros, setFiltros] = useState({ inicio: '', fim: '' })
    const [resultado, setResultado] = useState<string | null>(null)
    const [dadosTabela, setDadosTabela] = useState<any[]>([])
    const [dadosGrafico, setDadosGrafico] = useState<any[]>([])

    const aplicarFiltro = async () => {
        try {
            const res = await fetch('/api/movimentacoes')
            const data = await res.json()
            const lista: any[] = Array.isArray(data.movimentacoes) ? data.movimentacoes : data

            const filtrados = lista.filter((mov) => {
                const dataMov = new Date(mov.dataHora || mov.data)
                const isSaida = mov.tipo === 'saida'
                if (!isSaida) return false
                const dtIni = filtros.inicio ? new Date(filtros.inicio) : null
                const dtFim = filtros.fim ? new Date(filtros.fim + 'T23:59:59') : null
                return (!dtIni || dataMov >= dtIni) && (!dtFim || dataMov <= dtFim)
            })

            const agrupadoTabela = filtrados.flatMap((mov) => {
                const cliente = mov.clienteOuFornecedor || 'Não informado'
                return (mov.itens || []).map((item: any) => ({
                    produto: item.produto || 'Sem nome',
                    cliente,
                    valor: item.totalItem || 0
                }))
            })

            const agrupadoGrafico: Record<string, number> = {}
            for (const mov of filtrados) {
                const dia = new Date(mov.dataHora || mov.data).toLocaleDateString('pt-BR')
                const total = mov.itens?.reduce((acc: number, i: any) => acc + (i.totalItem || 0), 0) || 0
                agrupadoGrafico[dia] = (agrupadoGrafico[dia] || 0) + total
            }

            const grafico = Object.entries(agrupadoGrafico).map(([dia, valor]) => ({ dia, valor }))
            setResultado(`Vendas entre ${filtros.inicio} e ${filtros.fim}`)
            setDadosTabela(agrupadoTabela)
            setDadosGrafico(grafico)
        } catch (err) {
            console.error('Erro ao gerar relatório de vendas:', err)
            setResultado('Erro ao gerar relatório.')
            setDadosTabela([])
            setDadosGrafico([])
        }
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">📈 Relatório de Vendas Mensais</h1>
                <button
                    onClick={() => router.push('/dashboard/relatorios')}
                    className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300 text-sm"
                >
                    ← Voltar aos Relatórios
                </button>
            </div>

            <div className="flex gap-2 mb-4">
                <input
                    type="date"
                    value={filtros.inicio}
                    onChange={(e) => setFiltros({ ...filtros, inicio: e.target.value })}
                    className="border p-2 rounded"
                />
                <input
                    type="date"
                    value={filtros.fim}
                    onChange={(e) => setFiltros({ ...filtros, fim: e.target.value })}
                    className="border p-2 rounded"
                />
                <button
                    onClick={aplicarFiltro}
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                    Visualizar
                </button>
            </div>

            {resultado && (
                <>
                    <p className="text-sm text-gray-700 mb-2">{resultado}</p>

                    <div className="overflow-auto mb-6">
                        <table className="min-w-full text-sm border border-gray-300">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="border p-2">Produto</th>
                                    <th className="border p-2">Cliente</th>
                                    <th className="border p-2">Valor Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dadosTabela.map((item, i) => (
                                    <tr key={i}>
                                        <td className="border p-2">{item.produto}</td>
                                        <td className="border p-2">{item.cliente}</td>
                                        <td className="border p-2">R$ {item.valor.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-6">
                        <Bar
                            data={{
                                labels: dadosGrafico.map((d) => d.dia),
                                datasets: [
                                    {
                                        label: 'Total por Dia (R$)',
                                        data: dadosGrafico.map((d) => d.valor),
                                        backgroundColor: 'rgba(37, 99, 235, 0.6)'
                                    }
                                ]
                            }}
                            options={{ responsive: true, plugins: { legend: { position: 'top' } } }}
                        />
                    </div>
                </>
            )}
        </div>
    )
}
