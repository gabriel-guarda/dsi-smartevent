'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import ModalNovaMovimentacao from '@/components/ModalNovaMovimentacao'
// import { temPermissao } from '@/utils/permissoes'

export default function MovimentacoesPage() {
    const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([])
    const [movimentacoesFiltradas, setMovimentacoesFiltradas] = useState<Movimentacao[]>([])
    const [mesSelecionado, setMesSelecionado] = useState<string>('')
    const [mesesDisponiveis, setMesesDisponiveis] = useState<string[]>([])
    const [categorias, setCategorias] = useState<string[]>([])
    const [categoriasExternas, setcategoriasExternas] = useState<string[]>([])
    const [produtosExistentes, setProdutosExistentes] = useState<any[]>([])
    const [showModal, setShowModal] = useState(false)
    const [expanded, setExpanded] = useState<string | null>(null)

    const { data: session } = useSession()
    const p = session?.user?.permissoes

    useEffect(() => {
        const carregarMovimentacoes = async () => {
            const res = await fetch('/api/movimentacoes')
            const data = await res.json()
            const lista = Array.isArray(data?.movimentacoes)
                ? data.movimentacoes
                : Array.isArray(data)
                    ? data
                    : []

            setMovimentacoes(lista)
            setMovimentacoesFiltradas(lista)

            const meses = [...new Set(lista.map((m: any) => {
                const dataValida = m.dataHora || m.data || null;
                return dataValida ? new Date(dataValida).toISOString().slice(0, 7) : '0000-00'
            }))]
            setMesesDisponiveis(meses)
            setMesSelecionado(meses[0] || '')
        }

        carregarMovimentacoes()
    }, [])

    useEffect(() => {
        if (mesSelecionado) {
            const filtradas = movimentacoes.filter(mov => {
                const dataValida = mov.dataHora || mov.data
                if (!dataValida) return false
                return new Date(dataValida).toISOString().startsWith(mesSelecionado)
            })
            setMovimentacoesFiltradas(filtradas)
        }
    }, [mesSelecionado, movimentacoes])

    const addMovimentacao = (nova: Movimentacao) => {
        setMovimentacoes((prev) => [...prev, nova])
    }

    return (
        <div>
            <div className="flex justify-between mb-4 items-end">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold">Movimentações de Estoque</h1>
                    <select
                        value={mesSelecionado}
                        onChange={(e) => setMesSelecionado(e.target.value)}
                        className="border p-2 rounded"
                    >
                        {[...mesesDisponiveis]
                            .sort((a, b) => new Date(b + '-01').getTime() - new Date(a + '-01').getTime())
                            .map((mes) => (
                                <option key={mes} value={mes}>
                                    {new Date(mes + '-02').toLocaleDateString('pt-BR', {
                                        month: 'long',
                                        year: 'numeric'
                                    })}
                                </option>
                            ))}

                    </select>
                </div>


                <button
                    onClick={() => setShowModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                    + Nova Movimentação
                </button>

            </div>

            {showModal && (
                <ModalNovaMovimentacao
                    categorias={categorias || []}
                    produtosExistentes={produtosExistentes || []}
                    onClose={() => setShowModal(false)}
                    onSalvou={(movimentacao) => {
                        addMovimentacao(movimentacao)
                        setShowModal(false)
                    }}
                />
            )}

            <table className="w-full border mt-4">
                <thead>
                    <tr>
                        <th>Data e Hora</th>
                        <th>Nota</th>
                        <th>Tipo</th>
                        <th>Itens</th>
                        <th>Valor Total</th>
                        <th>Responsável</th>
                        <th>Detalhes</th>
                    </tr>
                </thead>
                <tbody>
                    {movimentacoesFiltradas.map((item, idx) => {
                        const estaExpandido = expanded === item._id
                        return (
                            <React.Fragment key={`mov-${item._id || idx}`}>
                                <tr
                                    className="border-b hover:bg-gray-50 cursor-pointer"
                                    onClick={() => setExpanded(estaExpandido ? null : item._id)}
                                >
                                    <td className="p-2">{item.dataHora ? new Date(item.dataHora).toLocaleString('pt-BR') : '-'}</td>
                                    <td className="p-2">{item.nota || '-'}</td>
                                    <td className="p-2">{item.tipo}</td>
                                    <td className="p-2">{item.itens?.length || item.quantidade || 0}</td>
                                    <td className="p-2">R$ {item.valor?.toFixed(2) || '0.00'}</td>
                                    <td className="p-2">{item.responsavel || '-'}</td>
                                    <td className="p-2">
                                        <button
                                            onClick={() => setExpanded(estaExpandido ? null : item._id)}
                                            className="bg-slate-200 px-2 py-1 rounded"
                                        >
                                            {estaExpandido ? 'Ocultar' : 'Visualizar'}
                                        </button>
                                    </td>
                                </tr>

                                {estaExpandido && (
                                    <tr className="bg-slate-50">
                                        <td colSpan={7} className="p-4 text-sm text-gray-700">
                                            <h4 className="text-md font-semibold mt-4">📦 Itens da Movimentação</h4>
                                            <div className="overflow-auto">
                                                <table className="w-full text-sm border border-gray-300">
                                                    <thead className="bg-gray-100">
                                                        <tr>
                                                            <th className="border p-1">Produto</th>
                                                            <th className="border p-1">Qtd</th>
                                                            <th className="border p-1">Vlr Unit</th>
                                                            <th className="border p-1">Total</th>
                                                            <th className="border p-1">Lote</th>
                                                            <th className="border p-1">Fabricação</th>
                                                            <th className="border p-1">Validade</th>
                                                            <th className="border p-1">Localização</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {item.itens?.map((i, idx) => (
                                                            <tr key={idx} className="border-t text-center">
                                                                <td className="border p-1">{i.produto || '-'}</td>
                                                                <td className="border p-1">{i.quantidade || 0}</td>
                                                                <td className="border p-1">R$ {i.valorUnitario?.toFixed(2) || '0,00'}</td>
                                                                <td className="border p-1">R$ {i.totalItem?.toFixed(2) || '0,00'}</td>
                                                                <td className="border p-1">{i.lote || '-'}</td>
                                                                <td className="border p-1">{i.fabricacao ? new Date(i.fabricacao).toLocaleDateString('pt-BR') : '-'}</td>
                                                                <td className="border p-1">{i.validade ? new Date(i.validade).toLocaleDateString('pt-BR') : '-'}</td>
                                                                <td className="border p-1">{i.localizacao || '-'}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>

                                            <div className="flex gap-2 mt-4">
                                                <button
                                                    onClick={() => handleEditar(item)}
                                                    className="text-blue-600"
                                                >
                                                    Editar
                                                </button>


                                                <button
                                                    onClick={() => handleExcluir(item)}
                                                    className="text-red-600"
                                                >
                                                    Excluir
                                                </button>

                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}
