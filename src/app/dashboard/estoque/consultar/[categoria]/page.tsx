'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import EstoqueHeader from '@/components/EstoqueHeader'
import ModalEditProduto from '@/components/ModalEditProduto'

type ProdutoEstoque = {
    codprod: string
    produto: string
    quantidade: number
    status: string
    localizacao: string
}

export default function ConsultaEstoqueCategoriaPage() {
    const params = useParams()
    const categoriaParam = params?.categoria?.toString() || ''
    const categoriaNormalizada = decodeURIComponent(categoriaParam).normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s]/gi, '')
        .toLowerCase()
        .trim()

    const [modalAberto, setModalAberto] = useState(false)
    const [produtos, setProdutos] = useState<ProdutoEstoque[]>([])
    const [produtoSelecionado, setProdutoSelecionado] = useState<ProdutoEstoque | null>(null)

    const handleEditar = (produto: ProdutoEstoque) => {
        setProdutoSelecionado(produto)
        setModalAberto(true)
    }

    const handleSalvarEdicao = (produtoEditado: ProdutoEstoque) => {
        const atualizados = produtos.map(p =>
            p.codprod === produtoEditado.codprod ? produtoEditado : p
        )
        setProdutos(atualizados)
    }

    useEffect(() => {
        const fetchMovimentacoes = async () => {
            try {
                const res = await fetch('/api/movimentacoes')
                if (!res.ok) throw new Error('Erro na resposta da API')
                const data = await res.json()

                const normalizar = (str: string) =>
                    str.normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '')
                        .replace(/[^\w\s]/gi, '')
                        .toLowerCase()
                        .trim()

                const daCategoria = data
                    .filter((mov: any) =>
                        mov.itens?.some((i: any) =>
                            normalizar(i.categoria || '') === categoriaNormalizada
                        )
                    )
                    .flatMap((mov: any) =>
                        mov.itens
                            .filter((i: any) =>
                                normalizar(i.categoria || '') === categoriaNormalizada
                            )
                            .map((i: any) => ({
                                codprod: i.codprod || '-',
                                produto: i.produto,
                                quantidade: mov.tipo === 'saida' ? -i.quantidade : i.quantidade,
                                status: i.status || 'Ativo',
                                localizacao: i.localizacao || '-',
                            }))
                    )

                const agrupado: { [produto: string]: ProdutoEstoque } = {}
                daCategoria.forEach((item) => {
                    if (!agrupado[item.produto]) {
                        agrupado[item.produto] = { ...item }
                    } else {
                        agrupado[item.produto].quantidade += item.quantidade
                    }
                })

                setProdutos(Object.values(agrupado))
            } catch (err) {
                console.error('Erro ao buscar movimentações:', err)
            }
        }

        fetchMovimentacoes()
    }, [categoriaNormalizada])

    return (
        <div>
            <EstoqueHeader
                titulo={`Categoria: ${decodeURIComponent(categoriaParam)}`}
                exibirVoltar
                exibirCadastrarCategoria
            />

            <h2 className="text-xl font-bold mb-4 text-gray-800">Produtos - Estoque</h2>

            {modalAberto && produtoSelecionado && (
                <ModalEditProduto
                    produto={produtoSelecionado}
                    onClose={() => setModalAberto(false)}
                    onSalvar={(produtoEditado: ProdutoEstoque) => {
                        const atualizados = produtos.map(p =>
                            p.codprod === produtoEditado.codprod ? produtoEditado : p
                        )
                        setProdutos(atualizados)
                        setModalAberto(false)
                    }}
                />
            )}

            <table className="w-full table-auto bg-white rounded shadow">
                <thead>
                    <tr className="bg-slate-200">
                        <th className="text-left px-4 py-2">Código</th>
                        <th className="text-left px-4 py-2">Produto</th>
                        <th className="text-left px-4 py-2">Quantidade</th>
                        <th className="text-left px-4 py-2">Status</th>
                        <th className="text-left px-4 py-2">Localização</th>
                        <th className="text-left px-4 py-2">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {produtos.map((produto, idx) => (
                        <tr key={`${produto.codprod}-${produto.produto}-${idx}`} className="border-b hover:bg-slate-50">
                            <td className="px-4 py-2">{produto.codprod}</td>
                            <td className="px-4 py-2">{produto.produto}</td>
                            <td className="px-4 py-2">{produto.quantidade}</td>
                            <td className="px-4 py-2">
                                <span className={`px-2 py-1 rounded text-xs ${produto.status === 'Ativo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {produto.status}
                                </span>
                            </td>
                            <td className="px-4 py-2">{produto.localizacao}</td>
                            <td className="px-4 py-2">
                                <button
                                    onClick={() => handleEditar(produto)}
                                    className="bg-yellow-400 text-white px-3 py-1 rounded"
                                >
                                    Editar
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
