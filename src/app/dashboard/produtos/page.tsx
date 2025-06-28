// src/app/dashboard/produtos/page.tsx

'use client'

import { useEffect, useState } from 'react'

interface Produto {
    codprod: string
    nome: string
    descricao: string
    valorVenda: number
    categoria: string
    tipoEmbalagem: string
    estoque: number
    alertaEstoque: number
    ativo: boolean
}

export default function ProdutosPage() {
    const [produtos, setProdutos] = useState<Produto[]>([])
    const [busca, setBusca] = useState('')
    const [editandoCodprod, setEditandoCodprod] = useState<string | null>(null)
    const [produtoEditado, setProdutoEditado] = useState<any>({})
    const [salvando, setSalvando] = useState(false)

    useEffect(() => {
        const carregarProdutos = async () => {
            try {
                const res = await fetch('/api/movimentacoes')
                const data = await res.json()
                const todosProdutos: Record<string, any> = {}

                data.forEach((mov: any) => {
                    mov.itens.forEach((item: any) => {
                        const vencido = item.validade && new Date(item.validade) < new Date()
                        const quantidade = (mov.tipo === 'entrada' ? 1 : -1) * item.quantidade

                        if (!todosProdutos[item.codprod]) {
                            todosProdutos[item.codprod] = {
                                codprod: item.codprod,
                                nome: item.produto,
                                descricao: item.descricao || '',
                                valorVenda: item.valorUnitario || 0,
                                categoria: item.categoria || '',
                                tipoEmbalagem: item.tipoEmbalagem || '',
                                estoque: 0,
                                ativo: true,
                                alertaEstoque: item.alertaEstoque ?? 0
                            }
                        }

                        if (vencido) {
                            todosProdutos[item.codprod].estoque -= item.quantidade
                        } else {
                            todosProdutos[item.codprod].estoque += quantidade
                        }

                        if (todosProdutos[item.codprod].estoque < 0) {
                            todosProdutos[item.codprod].estoque = 0
                        }
                    })
                })

                setProdutos(Object.values(todosProdutos))
            } catch (error) {
                console.error('Erro ao carregar produtos:', error)
            }
        }
        carregarProdutos()
    }, [])

    const produtosFiltrados = produtos.filter((p) =>
        p.nome.toLowerCase().includes(busca.toLowerCase())
    )

    const iniciarEdicao = (produto: any) => {
        setEditandoCodprod(produto.codprod)
        setProdutoEditado({ ...produto })
    }

    const cancelarEdicao = () => {
        setEditandoCodprod(null)
        setProdutoEditado({})
    }

    const salvarEdicao = async () => {
        try {
            setSalvando(true)
            const payload = {
                codprod: produtoEditado.codprod,
                nome: produtoEditado.nome,
                descricao: produtoEditado.descricao,
                valorVenda: produtoEditado.valorVenda,
                alertaEstoque: produtoEditado.alertaEstoque,
                tipoEmbalagem: produtoEditado.tipoEmbalagem
            }
            const res = await fetch('/api/movimentacoes', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            if (!res.ok) throw new Error('Erro ao salvar produto')

            const atualizado = produtos.map(p =>
                p.codprod === produtoEditado.codprod ? { ...p, ...produtoEditado } : p
            )

            setProdutos(atualizado)
            setEditandoCodprod(null)
            setProdutoEditado({})
        } catch (error) {
            console.error(error)
            alert('Erro ao salvar alterações. Verifique o console para mais detalhes.')
        } finally {
            setSalvando(false)
        }
    }

    const handleChange = (e: any) => {
        const { name, value } = e.target
        setProdutoEditado((prev: any) => ({
            ...prev,
            [name]: name === 'valorVenda' || name === 'alertaEstoque' ? Number(value) : value
        }))
    }

    const handleExcluir = async (codprod: string) => {
        if (!confirm('Tem certeza que deseja excluir este produto?')) return
        try {
            await fetch(`/api/movimentacoes`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ codprod })
            })
            setProdutos(produtos.filter(p => p.codprod !== codprod))
        } catch (error) {
            console.error('Erro ao excluir produto:', error)
        }
    }

    return (
        <main className="p-6 space-y-6">
            <h1 className="text-2xl font-bold">📦 Produtos</h1>
            <input
                type="text"
                placeholder="Buscar produto..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="border p-2 rounded w-64"
            />
            <div className="overflow-auto">
                <table className="min-w-full border text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="border p-2">Código</th>
                            <th className="border p-2">Nome</th>
                            <th className="border p-2">Descrição</th>
                            <th className="border p-2">Valor de Venda</th>
                            <th className="border p-2">Categoria</th>
                            <th className="border p-2">Tipo de Embalagem</th>
                            <th className="border p-2">Estoque</th>
                            <th className="border p-2">Alerta de Estoque</th>
                            <th className="border p-2">Ativo</th>
                            <th className="border p-2">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {produtosFiltrados.map((produto) => (
                            <tr key={produto.codprod} className={`hover:bg-gray-50 ${editandoCodprod === produto.codprod ? 'bg-yellow-100' : ''}`}>
                                <td className="border p-2">{produto.codprod}</td>
                                <td className="border p-2">
                                    {editandoCodprod === produto.codprod ? (
                                        <input name="nome" value={produtoEditado.nome} onChange={handleChange} className="border px-1" />
                                    ) : (
                                        produto.nome
                                    )}
                                </td>
                                <td className="border p-2">
                                    {editandoCodprod === produto.codprod ? (
                                        <input name="descricao" value={produtoEditado.descricao} onChange={handleChange} className="border px-1" />
                                    ) : (
                                        produto.descricao || '-'
                                    )}
                                </td>
                                <td className="border p-2">
                                    {editandoCodprod === produto.codprod ? (
                                        <input name="valorVenda" type="number" value={produtoEditado.valorVenda} onChange={handleChange} className="border px-1 w-24" />
                                    ) : (
                                        produto.valorVenda < 0 ? 'R$ 0,00' : `R$ ${produto.valorVenda.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                                    )}
                                </td>
                                <td className="border p-2">{produto.categoria}</td>
                                <td className="border p-2">
                                    {editandoCodprod === produto.codprod ? (
                                        <select
                                            name="tipoEmbalagem"
                                            value={produtoEditado.tipoEmbalagem}
                                            onChange={handleChange}
                                            className="border px-1"
                                        >
                                            <option value="">-</option>
                                            <option value="UN.">UN.</option>
                                            <option value="CX">CX</option>
                                            <option value="KG">KG</option>
                                            <option value="KG-PV">KG-PV</option>
                                        </select>
                                    ) : (
                                        produto.tipoEmbalagem || '-'
                                    )}
                                </td>
                                <td className="border p-2">{produto.estoque}</td>
                                <td className="border p-2">
                                    {editandoCodprod === produto.codprod ? (
                                        <input name="alertaEstoque" type="number" value={produtoEditado.alertaEstoque} onChange={handleChange} className="border px-1 w-16" />
                                    ) : (
                                        produto.alertaEstoque ?? '-'
                                    )}
                                </td>
                                <td className="border p-2">{produto.ativo ? 'Sim' : 'Não'}</td>
                                <td className="border p-2 space-x-2">
                                    {editandoCodprod === produto.codprod ? (
                                        <>
                                            <button onClick={salvarEdicao} disabled={salvando} className="text-green-600 hover:underline">
                                                {salvando ? 'Salvando...' : 'Salvar'}
                                            </button>
                                            <button onClick={cancelarEdicao} className="text-gray-600 hover:underline">Cancelar</button>
                                        </>
                                    ) : (
                                        <>
                                            <button onClick={() => iniciarEdicao(produto)} className="text-indigo-600 hover:underline">Editar</button>
                                            
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </main>
    )
}
