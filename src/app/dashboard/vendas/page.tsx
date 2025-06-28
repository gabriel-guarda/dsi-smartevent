'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { Card, CardContent } from '@/components/ui/card'
import { useEffect, useState } from 'react'
import { subDays, subWeeks, subMonths, subYears, isAfter } from 'date-fns'

const FILTROS = {
  dia: () => subDays(new Date(), 1),
  semana: () => subWeeks(new Date(), 1),
  mes: () => subMonths(new Date(), 1),
  trimestre: () => subMonths(new Date(), 3),
  semestre: () => subMonths(new Date(), 6),
  ano: () => subYears(new Date(), 1),
}

const formatarValor = (valor: number) =>
  valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export default function VendasPage() {
  const [vendas, setVendas] = useState<any[]>([])
  const [filtro, setFiltro] = useState<'dia' | 'semana' | 'mes' | 'trimestre' | 'semestre' | 'ano'>('dia')

  useEffect(() => {
    const fetchVendas = async () => {
      try {
        const res = await fetch('/api/movimentacoes')
        const data = await res.json()
        const saidas = data.filter((m: any) => m.tipo === 'saida')
        const detalhadas = saidas.flatMap((mov: any) =>
          mov.itens.map((item: any) => ({
            data: mov.dataHora,
            cliente: mov.clienteOuFornecedor || 'Não informado',
            produto: item.produto,
            quantidade: item.quantidade,
            valor: item.totalItem,
          }))
        )
        setVendas(detalhadas)
      } catch (err) {
        console.error('Erro ao carregar vendas:', err)
        setVendas([])
      }
    }
    fetchVendas()
  }, [])

  const dataCorte = FILTROS[filtro]()
  const vendasFiltradas = vendas.filter(v => isAfter(new Date(v.data), dataCorte))

  const totalVendido = vendasFiltradas.reduce((acc, v) => acc + v.valor, 0)
  const totalPedidos = vendasFiltradas.length
  const ticketMedio = totalPedidos > 0 ? totalVendido / totalPedidos : 0

  const dadosGrafico = vendasFiltradas.reduce((acc: any[], venda) => {
    const dataFormatada = new Date(venda.data).toLocaleDateString('pt-BR')
    const existente = acc.find((item: any) => item.data === dataFormatada)
    if (existente) {
      existente.valor += venda.valor
    } else {
      acc.push({ data: dataFormatada, valor: venda.valor })
    }
    return acc
  }, []).sort((a, b) => new Date(a.data.split('/').reverse().join('-')).getTime() - new Date(b.data.split('/').reverse().join('-')).getTime())

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">💰 Vendas</h1>

      <div className="flex gap-2 items-center mb-4">
        <label className="font-medium">Filtrar por:</label>
        <select
          value={filtro}
          onChange={(e) => setFiltro(e.target.value as any)}
          className="border p-2 rounded"
        >
          <option value="dia">Último Dia</option>
          <option value="semana">Última Semana</option>
          <option value="mes">Último Mês</option>
          <option value="trimestre">Último Trimestre</option>
          <option value="semestre">Último Semestre</option>
          <option value="ano">Último Ano</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Total Vendido</p>
            <p className="text-xl font-semibold">{formatarValor(totalVendido)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Pedidos</p>
            <p className="text-xl font-semibold">{totalPedidos}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Ticket Médio</p>
            <p className="text-xl font-semibold">{formatarValor(ticketMedio)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-4">📊 Vendas por Dia</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dadosGrafico}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="data" />
              <YAxis />
              <Tooltip formatter={(value: any) => formatarValor(value)} />
              <Bar dataKey="valor" fill="#4f46e5" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h2 className="text-lg font-semibold mb-4">🧾 Histórico de Vendas</h2>
          <div className="overflow-auto">
            <table className="min-w-full border">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="p-2 border-b">Data</th>
                  <th className="p-2 border-b">Nome Fantasia</th>
                  <th className="p-2 border-b">Produto</th>
                  <th className="p-2 border-b">Qtd</th>
                  <th className="p-2 border-b">Valor</th>
                </tr>
              </thead>
              <tbody>
                {vendasFiltradas.map((venda, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="p-2 border-b">{new Date(venda.data).toLocaleDateString('pt-BR')}</td>
                    <td className="p-2 border-b">{venda.cliente}</td>
                    <td className="p-2 border-b">{venda.produto}</td>
                    <td className="p-2 border-b">{venda.quantidade}</td>
                    <td className="p-2 border-b">{formatarValor(venda.valor)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
