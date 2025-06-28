'use client'

import { ChartVendas } from '@/components/ChartVendas'
import { ChartEstoquePorCategoria } from '@/components/ChartEstoquePorCategoria'
import { ChartTopProdutosVendidos } from '@/components/ChartTopProdutosVendidos'
import { ChartProdutosVencimento } from '@/components/ChartProdutosVencimento'
import { ChartProdutosParados } from '@/components/ChartProdutosParados'
import { ChartEntradas } from '@/components/ChartEntradas'
import { ChartEntradaVsSaida } from '@/components/ChartEntradaVsSaida'
import { ChartLucroEstimado } from '@/components/ChartLucroEstimado'
import { ChartEstoquePorProduto } from '@/components/ChartEstoquePorProduto'

export default function DashboardPage() {
    return (
        <div className="space-y-10">

            {/* Gráficos compactos em grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <div>
                    <h2 className="text-lg font-semibold mb-2">📊 Vendas Mensais</h2>
                    <ChartVendas />
                </div>
                <div>
                    <h2 className="text-lg font-semibold mb-2">📥 Compras Mensais</h2>
                    <ChartEntradas />
                </div>
                <div>
                    <h2 className="text-lg font-semibold mb-2">📊 Entrada vs Saída</h2>
                    <ChartEntradaVsSaida />
                </div>
                <div>
                    <h2 className="text-lg font-semibold mb-2">💰 Lucro Estimado</h2>
                    <ChartLucroEstimado />
                </div>
                <div>
                    <h2 className="text-lg font-semibold mb-2">🔥 Produtos Mais Vendidos</h2>
                    <ChartTopProdutosVendidos />
                </div>
                <div>
                    <h2 className="text-lg font-semibold mb-2">📦 Estoque por Categoria</h2>
                    <ChartEstoquePorCategoria />
                </div>
            </div>

            {/* Gráficos em largura total */}
            <div>
                <h2 className="text-xl font-semibold mb-4">📦 Estoque por Produto</h2>
                <ChartEstoquePorProduto />
            </div>

            <div>
                <h2 className="text-xl font-semibold mb-4">📅 Produtos Próximos do Vencimento</h2>
                <ChartProdutosVencimento />
            </div>

            <div>
                <h2 className="text-xl font-semibold mb-4">🕒 Produtos Parados no Estoque</h2>
                <ChartProdutosParados />
            </div>
        </div>
    )
}
