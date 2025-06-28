'use client'

import { useEffect, useState } from 'react'
import { format, differenceInDays } from 'date-fns'
import ptBR from 'date-fns/locale/pt-BR'
import { saveAs } from 'file-saver'
interface Produto {
    produto: string
    categoria: string
    quantidade: number
    validade: string
    diasRestantes: number
    lote?: string
}

export function ChartProdutosVencimento() {
    const [dados, setDados] = useState<Produto[]>([])
    const [diasFiltro, setDiasFiltro] = useState(15)

    useEffect(() => {
        async function fetchData() {
            const res = await fetch('/api/movimentacoes')
            const movimentacoes = await res.json()

            const hoje = new Date()
            const limite = new Date()
            limite.setDate(hoje.getDate() + diasFiltro)

            const resultado: Produto[] = []

            movimentacoes
                .filter((mov: any) => mov.tipo === 'entrada')
                .forEach((mov: any) => {
                    mov.itens?.forEach((item: any) => {
                        if (!item.validade) return
                        const dataVal = new Date(item.validade)
                        if (dataVal >= hoje && dataVal <= limite) {
                            resultado.push({
                                produto: item.produto,
                                categoria: item.categoria || 'Outros',
                                quantidade: Number(item.quantidade),
                                validade: format(dataVal, 'dd/MM/yyyy', { locale: ptBR }),
                                diasRestantes: differenceInDays(dataVal, hoje),
                                lote: item.lote || '-',
                            })
                        }
                    })
                })

            setDados(resultado)
        }

        fetchData()
    }, [diasFiltro])

    const getClass = (dias: number) => {
        if (dias <= 7) return 'bg-red-100 text-red-800 font-semibold'
        if (dias <= 15) return 'bg-yellow-100 text-yellow-800'
        return 'bg-gray-50'
    }
    const exportarCSV = () => {
        const headers = ['Produto', 'Categoria', 'Quantidade', 'Validade', 'Dias Restantes', 'Lote']
        const linhas = dados.map(d =>
            [d.produto, d.categoria, d.quantidade, d.validade, d.diasRestantes, d.lote].join(';')
        )
        const conteudo = [headers.join(';'), ...linhas].join('\n')
        const blob = new Blob([conteudo], { type: 'text/csv;charset=utf-8;' })
        saveAs(blob, 'produtos_proximos_vencimento.csv')
    }

    return (
        <div className="bg-white p-6 rounded shadow space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div className="flex gap-2 items-center">
                    <h2 className="text-xl font-semibold">⏳ Produtos Próximos do Vencimento</h2>
                    <h1></h1>
                    <label className="font-medium">Filtrar por:</label>
                    <select
                        className="border p-2 rounded"
                        value={diasFiltro}
                        onChange={(e) => setDiasFiltro(Number(e.target.value))}
                    >
                        <option value={7}>7 dias</option>
                        <option value={15}>15 dias</option>
                        <option value={30}>30 dias</option>
                        <option value={60}>60 dias</option>
                    </select>
                </div>

                <button
                    onClick={exportarCSV}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                    📥 Exportar CSV
                </button>
            </div>

            <div className="overflow-auto rounded border">
                <table className="w-full text-sm text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="p-2 border">Produto</th>
                            <th className="p-2 border">Categoria</th>
                            <th className="p-2 border">Quantidade</th>
                            <th className="p-2 border">Validade</th>
                            <th className="p-2 border">Dias</th>
                            <th className="p-2 border">Lote</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dados.map((item, idx) => (
                            <tr key={idx} className={getClass(item.diasRestantes)}>
                                <td className="p-2 border">{item.produto}</td>
                                <td className="p-2 border">{item.categoria}</td>
                                <td className="p-2 border">{item.quantidade}</td>
                                <td className="p-2 border">{item.validade}</td>
                                <td className="p-2 border text-center">{item.diasRestantes}</td>
                                <td className="p-2 border">{item.lote}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
