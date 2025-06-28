// src/app/dashboard/estoque/baixo/page.tsx
'use client'

import { useEffect, useState } from 'react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface ItemMovimentado {
    codprod: string
    produto: string
    categoria: string
    quantidade: number
    valorUnitario: number
    totalItem: number
    lote?: string
    validade?: string
    fabricacao?: string
    status?: string
    localizacao?: string
    alertaEstoque?: number
}

interface Movimentacao {
    tipo: 'entrada' | 'saida'
    itens: ItemMovimentado[]
    dataHora: string
}

interface ProdutoEstoque {
    codprod: string
    produto: string
    categoria: string
    quantidade: number
    status?: string
    localizacao?: string
    valorUnitario?: number
    alertaEstoque?: number
    validade?: string
}

interface SugestaoCompra {
    codprod: string
    produto: string
    categoria: string
    quantidade: number
    valorUnitario?: number
    salva?: boolean
}

export default function EstoqueBaixoPage() {
    const [itensBaixos, setItensBaixos] = useState<ProdutoEstoque[]>([])
    const [sugestoes, setSugestoes] = useState<SugestaoCompra[][]>([])
    const [form, setForm] = useState({ empresa: '', responsavel: '', email: '' })
    const [modalAberto, setModalAberto] = useState<number | null>(null)
    const [ultimosValores, setUltimosValores] = useState<Map<string, number>>(new Map())

    const fetchEstoque = async () => {
        try {
            const res = await fetch('/api/movimentacoes')
            const data: Movimentacao[] = await res.json()

            const estoqueMap = new Map<string, ProdutoEstoque>()
            const ultimos = new Map<string, number>()
            const agora = new Date()

            data.forEach(mov => {
                mov.itens.forEach(item => {
                    const key = item.codprod
                    const anterior = estoqueMap.get(key) || {
                        codprod: item.codprod,
                        produto: item.produto,
                        categoria: item.categoria,
                        quantidade: 0,
                        status: item.status,
                        localizacao: item.localizacao,
                        valorUnitario: 0,
                        alertaEstoque: item.alertaEstoque ?? 0,
                        validade: item.validade
                    }
                    const quantidadeAjustada = mov.tipo === 'entrada' ? item.quantidade : -item.quantidade
                    anterior.quantidade += quantidadeAjustada
                    if (mov.tipo === 'entrada') {
                        ultimos.set(key, item.valorUnitario)
                        anterior.valorUnitario = item.valorUnitario
                    }
                    if (item.alertaEstoque !== undefined) {
                        anterior.alertaEstoque = item.alertaEstoque
                    }
                    if (item.validade) {
                        anterior.validade = item.validade
                    }
                    estoqueMap.set(key, anterior)
                })
            })

            const filtrados = Array.from(estoqueMap.values()).map(prod => {
                const vencido = prod.validade ? new Date(prod.validade) < agora : false
                const estoqueAjustado = prod.quantidade < 0 ? (vencido ? 0 : 0) : prod.quantidade
                return { ...prod, quantidade: estoqueAjustado }
            }).filter(prod => prod.quantidade <= (prod.alertaEstoque ?? 0))

            setItensBaixos(filtrados)
            setUltimosValores(ultimos)

            const salvas = sessionStorage.getItem('sugestoesCompra')
            if (salvas) setSugestoes(JSON.parse(salvas))
        } catch (err) {
            console.error('Erro ao buscar movimentações:', err)
        }
    }

    useEffect(() => {
        fetchEstoque()
    }, [])

    // ... resto do código permanece inalterado ...



    const adicionarProduto = (produto: ProdutoEstoque) => {
        const indexExistente = sugestoes.findIndex(sug => sug.some(p => p.codprod === produto.codprod))
        if (indexExistente === -1) {
            const quantidadeSugerida = produto.quantidade < 0 ? -produto.quantidade : produto.alertaEstoque - produto.quantidade
            const valorUnitario = ultimosValores.get(produto.codprod) || 0
            const novaSugestao = [{ ...produto, quantidade: quantidadeSugerida, valorUnitario, salva: false }]
            const atualizadas = [...sugestoes, novaSugestao]
            setSugestoes(atualizadas)
            sessionStorage.setItem('sugestoesCompra', JSON.stringify(atualizadas))
            setModalAberto(atualizadas.length - 1)
        } else {
            setModalAberto(indexExistente)
        }
    }

    const atualizarSugestao = (formIndex: number, itemIndex: number, campo: keyof SugestaoCompra, valor: any) => {
        const novas = [...sugestoes]
        novas[formIndex][itemIndex][campo] = valor
        setSugestoes(novas)
        sessionStorage.setItem('sugestoesCompra', JSON.stringify(novas))
    }

    const removerProduto = (formIndex: number, itemIndex: number) => {
        const novas = [...sugestoes]
        novas[formIndex].splice(itemIndex, 1)
        setSugestoes(novas)
        sessionStorage.setItem('sugestoesCompra', JSON.stringify(novas))
    }

    const fecharModal = () => {
        setModalAberto(null)
        setForm({ empresa: '', responsavel: '', email: '' })
    }

    const salvarSugestoes = () => {
        const atualizadas = [...sugestoes]
        if (modalAberto !== null) {
            atualizadas[modalAberto] = atualizadas[modalAberto].map(p => ({ ...p, salva: true }))
            setSugestoes(atualizadas)
            sessionStorage.setItem('sugestoesCompra', JSON.stringify(atualizadas))
            setModalAberto(null)
        }
    }

    const adicionarMaisProduto = (formIndex: number) => {
        const novas = [...sugestoes]
        novas[formIndex].push({ codprod: '', produto: '', categoria: '', quantidade: 0, salva: false })
        setSugestoes(novas)
        sessionStorage.setItem('sugestoesCompra', JSON.stringify(novas))
    }

    const buscarProduto = async (codprod: string, formIndex: number, itemIndex: number) => {
        try {
            const res = await fetch('/api/movimentacoes')
            const data: Movimentacao[] = await res.json()
            let encontrado: ItemMovimentado | null = null
            for (const mov of data) {
                for (const item of mov.itens) {
                    if (item.codprod === codprod) {
                        encontrado = item
                        break
                    }
                }
                if (encontrado) break
            }
            if (encontrado) {
                atualizarSugestao(formIndex, itemIndex, 'produto', encontrado.produto)
                atualizarSugestao(formIndex, itemIndex, 'categoria', encontrado.categoria)
                const estoque = itensBaixos.find(p => p.codprod === encontrado!.codprod)
                const qtdAtual = estoque?.quantidade || 0
                const quantidadeSugerida = qtdAtual < 0 ? -qtdAtual : encontrado.alertaEstoque - qtdAtual
                atualizarSugestao(formIndex, itemIndex, 'quantidade', quantidadeSugerida)
                atualizarSugestao(formIndex, itemIndex, 'valorUnitario', encontrado.valorUnitario)
            }
        } catch (err) {
            console.error('Erro ao buscar produto:', err)
        }
    }

    const exportarPDF = () => {
        const doc = new jsPDF()
        doc.setFontSize(16)
        doc.text(`Sugestão de Compra`, 10, 10)
        doc.setFontSize(12)
        doc.text(`Empresa: ${form.empresa}`, 10, 18)
        doc.text(`Responsável: ${form.responsavel}`, 10, 24)
        doc.text(`E-mail: ${form.email}`, 10, 30)
        const todos = sugestoes.flat()
        autoTable(doc, {
            startY: 35,
            head: [['Código', 'Produto', 'Categoria', 'Qtd', 'Valor Unitário']],
            body: todos.map(s => [s.codprod, s.produto, s.categoria, String(s.quantidade), `R$ ${s.valorUnitario?.toFixed(2)}`])
        })
        doc.save('sugestao-compra.pdf')
    }

    return (
        <div>
            <h2 className="text-xl font-bold mb-4">📉 Itens com Estoque Baixo</h2>
            {itensBaixos.length === 0 ? (
                <p className="text-gray-600">Nenhum item com estoque abaixo de {buscarProduto.alertaEstoque} unidades.</p>
            ) : (
                <table className="w-full border">
                    <thead>
                        <tr>
                            <th>Código</th>
                            <th>Produto</th>
                            <th>Categoria</th>
                            <th>Qtd</th>
                            <th>Status</th>
                            <th>Localização</th>
                            <th>Sugestão</th>
                        </tr>
                    </thead>
                    <tbody>
                        {itensBaixos.map((item) => {
                            const index = sugestoes.findIndex(sug => sug.some(p => p.codprod === item.codprod))
                            const status = index !== -1 && sugestoes[index].some(p => p.salva)
                            return (
                                <tr key={item.codprod} className={status ? 'bg-green-100' : ''}>
                                    <td>{item.codprod}</td>
                                    <td>{item.produto}</td>
                                    <td>{item.categoria}</td>
                                    <td className="text-red-600 font-bold">{item.quantidade}</td>
                                    <td>{item.status || '-'}</td>
                                    <td>{item.localizacao || '-'}</td>
                                    <td>
                                        <button
                                            onClick={() => adicionarProduto(item)}
                                            className={`px-2 py-1 rounded text-white ${status ? 'bg-green-600' : 'bg-yellow-500'}`}
                                        >
                                            {status ? '✅ Sugestão de Compra' : '⚠️ Sugerir Compra'}
                                        </button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            )}

            {modalAberto !== null && sugestoes[modalAberto] && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded shadow-lg w-[800px] max-h-[90vh] overflow-auto space-y-4">
                        <h2 className="text-xl font-bold">📦 Sugestão de Compra</h2>
                        <input className="border p-2 rounded w-full" placeholder="Empresa" value={form.empresa} onChange={e => setForm({ ...form, empresa: e.target.value })} />
                        <div className="flex gap-2">
                            <input className="border p-2 rounded w-full" placeholder="Responsável" value={form.responsavel} onChange={e => setForm({ ...form, responsavel: e.target.value })} />
                            <input className="border p-2 rounded w-full" placeholder="E-mail" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                        </div>

                        {sugestoes[modalAberto].length > 0 && (
                            <div className="space-y-1">
                                <div className="grid grid-cols-6 gap-2 font-semibold text-center">
                                    <span>Código</span>
                                    <span>Produto</span>
                                    <span>Categoria</span>
                                    <span>Qtd</span>
                                    <span>Valor Unitário</span>
                                    <span>Ação</span>
                                </div>

                                {sugestoes[modalAberto].map((item, idx) => (
                                    <div key={idx} className="grid grid-cols-6 gap-2 items-center">
                                        <input
                                            value={item.codprod}
                                            onChange={e => atualizarSugestao(modalAberto, idx, 'codprod', e.target.value)}
                                            onBlur={e => buscarProduto(e.target.value, modalAberto, idx)}
                                            placeholder="Código"
                                            className="border p-2 rounded"
                                        />
                                        <input value={item.produto} readOnly placeholder="Produto" className="border p-2 rounded bg-gray-100" />
                                        <input value={item.categoria} readOnly placeholder="Categoria" className="border p-2 rounded bg-gray-100" />
                                        <input type="number" value={item.quantidade} onChange={e => atualizarSugestao(modalAberto, idx, 'quantidade', Number(e.target.value))} placeholder="Qtd" className="border p-2 rounded" />
                                        <input type="number" value={item.valorUnitario || 0} onChange={e => atualizarSugestao(modalAberto, idx, 'valorUnitario', Number(e.target.value))} placeholder="Vlr Unit" className="border p-2 rounded" />
                                        <button onClick={() => removerProduto(modalAberto, idx)} className="text-red-600 px-2 font-bold">✖</button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <button onClick={() => adicionarMaisProduto(modalAberto)} className="bg-slate-200 px-3 py-1 rounded">+ Adicionar Produto</button>

                        <div className="flex gap-2 justify-end mt-4">
                            <button onClick={fecharModal} className="bg-slate-300 px-4 py-2 rounded">Cancelar</button>
                            <button onClick={salvarSugestoes} className="bg-green-600 text-white px-4 py-2 rounded">Salvar Sugestão</button>
                            <button onClick={exportarPDF} className="bg-blue-600 text-white px-4 py-2 rounded">Exportar PDF</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
