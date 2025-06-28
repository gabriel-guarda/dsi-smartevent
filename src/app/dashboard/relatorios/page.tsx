'use client'

import { useRouter } from 'next/navigation'

export default function RelatoriosPage() {
    const router = useRouter()

    const relatorios = [
        { id: 'vendas', nome: '📈 Vendas Mensais' },
        { id: 'estoque-categoria', nome: '📦 Estoque por Categoria' },
        { id: 'produtos-parados', nome: '⏸️ Produtos Parados' },
        { id: 'itens-vencidos', nome: '❌ Itens Vencidos' },
        { id: 'usuarios', nome: '👤 Relatório de Usuários' },
        { id: 'estoque-baixo', nome: '📉 Itens com Estoque Baixo' },
        { id: 'excesso-estoque', nome: '⚠️ Itens com Excesso de Estoque' },
        { id: 'alteracao-preco', nome: '💲 Alterações de Preço de Vendas' },
        { id: 'alteracao-prateleiras', nome: '🧱 Alterações em Prateleiras' },
        { id: 'movimentacao-localizacao', nome: '🚚 Movimentações por Localização' },
    ]

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">📊 Relatórios</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {relatorios.map((rel) => (
                    <button
                        key={rel.id}
                        onClick={() => router.push(`/dashboard/relatorios/${rel.id}`)}
                        className="border p-4 rounded hover:bg-gray-50 text-left"
                    >
                        {rel.nome}
                    </button>
                ))}
            </div>
        </div>
    )
}
