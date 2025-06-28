'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Item {
    produto: string
    categoria: string
    quantidade: number
    lote: string
    validade: string
}

export default function RelatorioVencimentos() {
    const [dados, setDados] = useState<Item[]>([])
    const [filtros, setFiltros] = useState({ inicio: '', fim: '' })
    const [resultado, setResultado] = useState('')
    const router = useRouter()

    const aplicarFiltro = async () => {
        try {
            const res = await fetch('/api/movimentacoes')
            const data = await res.json()
            const lista = Array.isArray(data.movimentacoes) ? data.movimentacoes : data

            const vencidos: Item[] = []

            for (const mov of lista) {
                for (const item of mov.itens || []) {
                    const validade = item.validade ? new Date(item.validade) : null
                    if (!validade) continue

                    const dtIni = filtros.inicio ? new Date(filtros.inicio) : null
                    const dtFim = filtros.fim ? new Date(filtros.fim + 'T23:59:59') : null

                    if (
                        (!dtIni || validade >= dtIni) &&
                        (!dtFim || validade <= dtFim)
                    ) {
                        vencidos.push({
                            produto: item.produto || 'Sem nome',
                            categoria: item.categoria || '-',
                            quantidade: Number(item.quantidade || 0),
                            lote: item.lote || '-',
                            validade: validade.toISOString().split('T')[0],
                        })
                    }
                }
            }

            setResultado(`Período: ${filtros.inicio} até ${filtros.fim}`)
            setDados(vencidos)
        } catch (err) {
            console.error('Erro ao carregar vencimentos:', err)
        }
    }

    const corLinha = (validade: string) => {
        const hoje = new Date()
        const dataVal = new Date(validade)
        const diff = (dataVal.getTime() - hoje.getTime()) / (1000 * 3600 * 24)

        if (diff < 0) return 'bg-red-100'
        if (diff <= 15) return 'bg-orange-100'
        return 'bg-green-100'
    }
    function exportarCSV(dados: Item[]) {
        const linhas = [
            ['Produto', 'Categoria', 'Quantidade', 'Lote', 'Validade']
        ]

        dados.forEach(item => {
            linhas.push([
                item.produto,
                item.categoria,
                item.quantidade.toString(),
                item.lote,
                new Date(item.validade).toLocaleDateString('pt-BR')
            ])
        })

        const csvContent = linhas.map(l => l.join(';')).join('\n')
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', 'relatorio_vencimentos.csv')
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">🕒 Relatório de Vencimentos</h1>
                <button
                    onClick={() => router.push('/dashboard/relatorios')}
                    className="bg-blue-100 text-blue-800 px-4 py-1 rounded text-sm hover:bg-blue-200"
                >
                    ⬅️ Voltar para Relatórios
                </button>

            </div>

            <div className="bg-gray-50 border p-4 rounded mb-4 space-y-2">
                <p className="font-medium">Filtrar por data de validade:</p>
                <div className="flex gap-2">
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
                {resultado && <p className="text-sm text-gray-700">{resultado}</p>}
            </div>



            {dados.length > 0 && (
                <>
                    <div className="mt-6 flex flex-wrap gap-4 items-center">
                        <div className="flex gap-3 mt-2 ml-auto justify-end w-full">
                            <p className="text-sm text-gray-600">
                                <strong>Resumo:</strong>
                                {' '}
                                🔴 Vencidos: {dados.filter(d => corLinha(d.validade) === 'bg-red-100').length} |
                                🟠 Próximos do vencimento: {dados.filter(d => corLinha(d.validade) === 'bg-orange-100').length} |
                                🟢 Validade segura: {dados.filter(d => corLinha(d.validade) === 'bg-green-100').length}
                            </p>



                            <button
                                className="px-4 py-1 bg-green-600 text-white rounded"
                                onClick={() => exportarCSV(dados)}
                            >
                                Exportar CSV
                            </button>
                            <button className="px-4 py-1 bg-red-600 text-white rounded" disabled>
                                Exportar PDF
                            </button>
                        </div>
                    </div>

                    <div className="overflow-auto mt-4">
                        <table className="min-w-full text-sm border border-gray-300">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="border p-2">Produto</th>
                                    <th className="border p-2">Categoria</th>
                                    <th className="border p-2">Quantidade</th>
                                    <th className="border p-2">Lote</th>
                                    <th className="border p-2">Validade</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dados.map((item, i) => (
                                    <tr key={i} className={`${corLinha(item.validade)} border-b`}>
                                        <td className="border p-2">{item.produto}</td>
                                        <td className="border p-2">{item.categoria}</td>
                                        <td className="border p-2 text-center">{item.quantidade}</td>
                                        <td className="border p-2">{item.lote}</td>
                                        <td className="border p-2">{new Date(item.validade).toLocaleDateString('pt-BR')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    )
}