'use client'

import { useEffect, useState } from 'react'

type Produto = {
    codprod: string
    produto: string
    status: string
    localizacao: string
    nota: string
    quantidade: number
}

export default function BuscaAvancadaPage() {
    const [busca, setBusca] = useState('')
    const [status, setStatus] = useState('')
    const [localizacao, setLocalizacao] = useState('')
    const [nota, setNota] = useState('')
    const [resultados, setResultados] = useState<Produto[]>([])
    const [localizacoesDisponiveis, setLocalizacoesDisponiveis] = useState<string[]>([])

    const buscar = async () => {
        try {
            const res = await fetch('/api/movimentacoes')
            if (!res.ok) throw new Error('Erro na API')

            const data = await res.json()

            const todosItens: Produto[] = data.flatMap((mov: any) =>
                mov.itens.map((item: any) => ({
                    codprod: item.codprod || '-',
                    produto: item.produto || '-',
                    status: item.status || 'Ativo',
                    localizacao: item.localizacao || '-',
                    nota: mov.nota || '-',
                    quantidade: mov.tipo === 'saida' ? -item.quantidade : item.quantidade,
                }))
            )

            // normalização
            const normalizar = (str: string) =>
                str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()

            const buscaNormalizada = normalizar(busca)
            const statusNorm = normalizar(status)
            const localizacaoNorm = normalizar(localizacao)
            const notaNorm = normalizar(nota)

            const filtrados = todosItens.filter((item) =>
                (!busca || normalizar(item.codprod).includes(buscaNormalizada) || normalizar(item.produto).includes(buscaNormalizada)) &&
                (!status || normalizar(item.status) === statusNorm) &&
                (!localizacao || normalizar(item.localizacao).includes(localizacaoNorm)) &&
                (!nota || normalizar(item.nota) === notaNorm)
            )

            setResultados(filtrados)

            // localizações únicas
            const unicas = [...new Set(todosItens.map(i => i.localizacao).filter(Boolean))]
            setLocalizacoesDisponiveis(unicas)

        } catch (err) {
            console.error('Erro ao buscar:', err)
            setResultados([])
        }
    }

    useEffect(() => {
        buscar()
    }, [busca, status, localizacao, nota])

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Busca Avançada</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <input
                    type="text"
                    placeholder="Código ou nome do produto"
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="border p-2 rounded"
                />

                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="border p-2 rounded"
                >
                    <option value="">Status</option>
                    <option value="Ativo">Ativo</option>
                    <option value="Inativo">Inativo</option>
                    <option value="Avariado">Avariado</option>
                    <option value="Vencido">Vencido</option>
                    <option value="Reservado">Reservado</option>
                </select>

                <select
                    value={localizacao}
                    onChange={(e) => setLocalizacao(e.target.value)}
                    className="border p-2 rounded"
                >
                    <option value="">Localização</option>
                    {localizacoesDisponiveis.map((loc, idx) => (
                        <option key={idx} value={loc}>{loc}</option>
                    ))}
                </select>

                <input
                    type="text"
                    placeholder="Nota fiscal"
                    value={nota}
                    onChange={(e) => setNota(e.target.value)}
                    className="border p-2 rounded"
                />
            </div>

            <table className="w-full bg-white rounded shadow">
                <thead className="bg-slate-200">
                    <tr>
                        <th className="text-left px-4 py-2">Código</th>
                        <th className="text-left px-4 py-2">Produto</th>
                        <th className="text-left px-4 py-2">Quantidade</th>
                        <th className="text-left px-4 py-2">Status</th>
                        <th className="text-left px-4 py-2">Localização</th>
                        <th className="text-left px-4 py-2">Nota</th>
                    </tr>
                </thead>
                <tbody>
                    {resultados.map((item, idx) => (
                        <tr key={idx} className="border-b hover:bg-slate-50">
                            <td className="px-4 py-2">{item.codprod}</td>
                            <td className="px-4 py-2">{item.produto}</td>
                            <td className="px-4 py-2">{item.quantidade}</td>
                            <td className="px-4 py-2">{item.status}</td>
                            <td className="px-4 py-2">{item.localizacao}</td>
                            <td className="px-4 py-2">{item.nota}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {resultados.length === 0 && (
                <p className="text-gray-500 mt-4">Nenhum resultado encontrado.</p>
            )}
        </div>
    )
}