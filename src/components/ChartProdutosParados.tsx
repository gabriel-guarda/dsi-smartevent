'use client'

import { useEffect, useState } from 'react'
import { format, parseISO, differenceInDays, subDays } from 'date-fns'
import { saveAs } from 'file-saver'

interface ProdutoParado {
    codprod: string
    produto: string
    categoria: string
    ultimaSaida?: string
    localizacao?: string
}

export function ChartProdutosParados() {
    const [dados, setDados] = useState<ProdutoParado[]>([])
    const [dias, setDias] = useState(30)
    const [categoriaFiltro, setCategoriaFiltro] = useState('Todos')

    useEffect(() => {
        async function fetchData() {
            const res = await fetch('/api/movimentacoes')
            const movimentacoes = await res.json()

            const baseData = new Date()
            const limite = subDays(baseData, dias)

            const produtosAtivos: Record<string, ProdutoParado> = {}
            const ultimasSaidas: Record<string, string> = {}

            movimentacoes.forEach((mov: any) => {
                mov.itens?.forEach((item: any) => {
                    const key = item.codprod
                    if (!key) return

                    if (!produtosAtivos[key]) {
                        produtosAtivos[key] = {
                            codprod: key,
                            produto: item.produto,
                            categoria: item.categoria || 'Outros',
                            localizacao: item.localizacao || '-',
                            ultimaSaida: undefined,
                        }
                    }

                    if (mov.tipo === 'saida' && mov.dataHora) {
                        const data = new Date(mov.dataHora)
                        if (!ultimasSaidas[key] || data > new Date(ultimasSaidas[key])) {
                            ultimasSaidas[key] = data.toISOString()
                        }
                    }
                })
            })

            const resultado = Object.values(produtosAtivos).filter((p) => {
                const ultima = ultimasSaidas[p.codprod]
                if (!ultima) return true
                return new Date(ultima) < limite
            })

            resultado.forEach((r) => {
                r.ultimaSaida = ultimasSaidas[r.codprod]
                    ? format(parseISO(ultimasSaidas[r.codprod]!), 'dd/MM/yyyy')
                    : 'Sem registro'
            })

            // Ordenar por data de última saída (mais recente primeiro)
            resultado.sort((a, b) => {
                const dataA = a.ultimaSaida === 'Sem registro' ? new Date(0) : parseISO(a.ultimaSaida.split('/').reverse().join('-'))
                const dataB = b.ultimaSaida === 'Sem registro' ? new Date(0) : parseISO(b.ultimaSaida.split('/').reverse().join('-'))
                return dataB.getTime() - dataA.getTime()
            })

            setDados(resultado)
        }

        fetchData()
    }, [dias])

    const categoriasDisponiveis = ['Todos', ...new Set(dados.map(p => p.categoria))]

    const filtrados = categoriaFiltro === 'Todos'
        ? dados
        : dados.filter(p => p.categoria === categoriaFiltro)

    const exportar = () => {
        const headers = ['Código', 'Produto', 'Categoria', 'Localização', 'Última Saída']
        const linhas = filtrados.map(d =>
            [d.codprod, d.produto, d.categoria, d.localizacao, d.ultimaSaida].join(';')
        )
        const conteudo = [headers.join(';'), ...linhas].join('\n')
        const blob = new Blob([conteudo], { type: 'text/csv;charset=utf-8;' })
        saveAs(blob, 'produtos_parados_estoque.csv')
    }

    return (
        <div className="bg-white p-6 rounded shadow space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <h2 className="text-xl font-semibold">🕒 Produtos Parados no Estoque</h2>

                <div className="flex gap-2 items-center">
                    <label className="font-medium">Sem saída há:</label>
                    <select
                        className="border p-2 rounded"
                        value={dias}
                        onChange={(e) => setDias(Number(e.target.value))}
                    >
                        <option value={7}>7 dias</option>
                        <option value={15}>15 dias</option>
                        <option value={30}>30 dias</option>
                        <option value={60}>60 dias</option>
                    </select>

                    <label className="ml-4 font-medium">Categoria:</label>
                    <select
                        className="border p-2 rounded"
                        value={categoriaFiltro}
                        onChange={(e) => setCategoriaFiltro(e.target.value)}
                    >
                        {categoriasDisponiveis.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                <button
                    onClick={exportar}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                    📥 Exportar CSV
                </button>
            </div>

            <table className="w-full text-sm border rounded overflow-hidden">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="p-2 border">Código</th>
                        <th className="p-2 border">Produto</th>
                        <th className="p-2 border">Categoria</th>
                        <th className="p-2 border">Localização</th>
                        <th className="p-2 border">Última Saída</th>
                    </tr>
                </thead>
                <tbody>
                    {filtrados.map((item, idx) => (
                        <tr key={idx} className={item.ultimaSaida === 'Sem registro' ? 'bg-red-100' : ''}>
                            <td className="p-2 border">{item.codprod}</td>
                            <td className="p-2 border">{item.produto}</td>
                            <td className="p-2 border">{item.categoria}</td>
                            <td className="p-2 border">{item.localizacao}</td>
                            <td className="p-2 border text-center">{item.ultimaSaida}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
