'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import ModalEditProduto from '@/components/ModalEditProduto'
import { temPermissao } from '@/utils/permissoes'

type ProdutoEstoque = {
    codprod: string
    produto: string
    quantidade: number
    status: string
    localizacao: string
}

export default function ConsultaEstoquePage() {
    const [categorias, setCategorias] = useState<string[]>([])
    const [produtos, setProdutos] = useState<ProdutoEstoque[]>([])
    const [modalAberto, setModalAberto] = useState(false)
    const [produtoSelecionado, setProdutoSelecionado] = useState<ProdutoEstoque | null>(null)

    const handleEditar = (produto: ProdutoEstoque) => {
        setProdutoSelecionado(produto)
        setModalAberto(true)
    }

    const handleSalvarEdicao = (produtoEditado: ProdutoEstoque) => {
        const atualizados = produtos.map(p =>
            p.produto === produtoEditado.produto ? produtoEditado : p
        )
        setProdutos(atualizados)
        // Opcional: persistir no banco via API
    }

    const handleExcluir = (produto: ProdutoEstoque) => {
        const novos = produtos.filter(p => p.produto !== produto.produto)
        setProdutos(novos)
        // Opcional: excluir do banco via API
    }

    const fetchCategorias = async () => {
        try {
            const res = await fetch('/api/categorias')
            if (!res.ok) throw new Error('Erro ao buscar categorias')
            const data = await res.json()
            setCategorias(data || [])
        } catch (err) {
            console.error('Erro ao buscar categorias:', err)
        }
    }

    useEffect(() => {
        fetchCategorias()
    }, [])

    return (
        <>
            {/* Modal de edição */}
            {modalAberto && produtoSelecionado && (
                <ModalEditProduto
                    produto={produtoSelecionado}
                    statusOptions={statusList}
                    localizacoesOptions={localizacoes}
                    onClose={() => setModalAberto(false)}
                    onSalvar={handleSalvarEdicao}
                />

            )}

            {/* Conteúdo da página */}
            <div>
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Categorias de Estoque</h1>
                    <div className="flex gap-2">
                        <Link
                            href="/dashboard/estoque"
                            className="bg-slate-300 hover:bg-slate-400 text-black px-4 py-2 rounded"
                        >
                            Voltar
                        </Link>
                        <Link
                            href="/dashboard/estoque/categorias"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                        >
                            + Cadastrar Categoria
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {categorias.map((categoria) => (
                        <Link
                            key={categoria}
                            href={`/dashboard/estoque/consultar/${categoria.toLowerCase()}`}
                            className="block bg-slate-100 p-4 rounded shadow hover:bg-slate-200 text-center font-medium"
                        >
                            {categoria}
                        </Link>
                    ))}
                </div>
            </div>
        </>
    )
}
