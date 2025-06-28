'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface PrecoHistorico {
    codprod: string
    produto: string
    data: string
    precoUnit: number
}

interface AlteracaoPreco {
    codprod: string
    produto: string
    data: string
    precoAntigo: number
    precoNovo: number
}

export default function RelatorioAlteracaoPreco() {
    const [alteracoes, setAlteracoes] = useState<AlteracaoPreco[]>([])
    const [filtros, setFiltros] = useState({ inicio: '', fim: '' })
    const [resultado, setResultado] = useState('')
    const router = useRouter()

    useEffect(() => {
        const carregar = async () => {
            try {
                const res = await fetch('/api/movimentacoes')
                const data = await res.json()
                const lista = Array.isArray(data.movimentacoes) ? data.movimentacoes : data

                const historico: PrecoHistorico[] = []

                for (const mov of lista) {
                    if (mov.tipo !== 'saida') continue
                    const dataMov = new Date(mov.dataHora || mov.data)
                    if (!dataMov) continue

                    const dtIni = filtros.inicio ? new Date(filtros.inicio) : null
                    const dtFim = filtros.fim ? new Date(filtros.fim + 'T23:59:59') : null

                    if (
                        (dtIni && dataMov < dtIni) ||
                        (dtFim && dataMov > dtFim)
                    ) continue

                    for (const item of mov.itens || []) {
                        historico.push({
                            codprod: item.codprod,
                            produto: item.produto || '-',
                            data: dataMov.toISOString(),
                            precoUnit: Number(item.valorUnitario || 0)
                        })
                    }
                }

                // Agrupa e detecta alterações
                const porProduto: Record<string, PrecoHistorico[]> = {}
                for (const h of historico) {
                    if (!porProduto[h.codprod]) porProduto[h.codprod] = []
                    porProduto[h.codprod].push(h)
                }

                const alteracoesDetectadas: AlteracaoPreco[] = []
                for (const [cod, lista] of Object.entries(porProduto)) {
                    const ordenado = lista.sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
                    let anterior: PrecoHistorico | null = null

                    for (const atual of ordenado) {
                        if (anterior && anterior.precoUnit !== atual.precoUnit) {
                            alteracoesDetectadas.push({
                                codprod: atual.codprod,
                                produto: atual.produto,
                                data: new Date(atual.data).toLocaleDateString('pt-BR'),
                                precoAntigo: anterior.precoUnit,
                                precoNovo: atual.precoUnit
                            })
                        }
                        anterior = atual
                    }
                }

                setResultado(`Período: ${filtros.inicio} até ${filtros.fim}`)
                setAlteracoes(alteracoesDetectadas)
            } catch (err) {
                console.error('Erro ao carregar alterações de preço:', err)
            }
        }

        if (filtros.inicio && filtros.fim) carregar()
    }, [filtros])

    const exportarCSV = () => {
        const linhas = [['Código', 'Produto', 'Data', 'Preço Antigo', 'Preço Novo']]
        alteracoes.forEach(a => {
            linhas.push([
                a.codprod,
                a.produto,
                a.data,
                a.precoAntigo.toFixed(2),
                a.precoNovo.toFixed(2)
            ])
        })
        const csv = linhas.map(l => l.join(';')).join('\n')
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', 'alteracoes_preco.csv')
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">💲 Relatório de Alterações de Preço</h1>
                <div className="flex gap-2">
                    <button
                        onClick={exportarCSV}
                        className="px-4 py-1 bg-green-600 text-white rounded"
                    >
                        Exportar CSV
                    </button>
                    <button
                        onClick={() => router.push('/dashboard/relatorios')}
                        className="text-sm text-blue-600 border px-3 py-1 rounded hover:bg-blue-50"
                    >
                        Voltar
                    </button>
                </div>
            </div>

            <div className="bg-gray-50 border p-4 rounded mb-4 space-y-2">
                <p className="font-medium">Filtrar por período:</p>
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
                </div>

                <button
                    onClick={() => {
                        if (filtros.inicio && filtros.fim) {
                            setResultado('')
                            setAlteracoes([]) // limpa antes de recarregar
                            // Força recarregar useEffect via mudança de estado
                            setFiltros({ ...filtros }) // trigger
                        }
                    }}
                    className="mt-2 bg-blue-600 text-white px-4 py-2 rounded"
                >
                    Filtrar
                </button>

                {resultado && <p className="text-sm text-gray-700">{resultado}</p>}
            </div>

            {alteracoes.length > 0 ? (
                <div className="overflow-auto">
                    <table className="min-w-full text-sm border border-gray-300">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border p-2">Código</th>
                                <th className="border p-2">Produto</th>
                                <th className="border p-2">Data</th>
                                <th className="border p-2">Preço Antigo</th>
                                <th className="border p-2">Preço Novo</th>
                            </tr>
                        </thead>
                        <tbody>
                            {alteracoes.map((a, i) => (
                                <tr key={i}>
                                    <td className="border p-2">{a.codprod}</td>
                                    <td className="border p-2">{a.produto}</td>
                                    <td className="border p-2">{a.data}</td>
                                    <td className="border p-2">R$ {a.precoAntigo.toFixed(2)}</td>
                                    <td className="border p-2 font-semibold text-blue-600">R$ {a.precoNovo.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-sm text-gray-600 mt-4">Nenhuma alteração de preço detectada.</p>
            )}
        </div>
    )
}
