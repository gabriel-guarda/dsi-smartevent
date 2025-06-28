'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Produto {
    codprod: string
    produto: string
    categoria: string
    quantidade: number
    validade?: string
    alertaEstoque?: number
    localizacao?: string
    selecionado?: boolean
    tipoCampanha?: string
    descricaoCampanha?: string
}

interface Sugestao {
    tipo: string
    titulo: string
    descricao: string
    produtos: Produto[]
}

interface Campanha {
    nome: string
    inicio: string
    fim: string
    descricao: string
    produtos: Produto[]
}

export default function SugestoesCampanha() {
    const [tipoFiltro, setTipoFiltro] = useState('')
    const [sugestoes, setSugestoes] = useState<Sugestao[]>([])
    const [campanhas, setCampanhas] = useState<Campanha[]>([])
    const [novaCampanha, setNovaCampanha] = useState<{
        nome: string
        inicio: string
        fim: string
        produtos: Produto[]
        descricao: string
    } | null>(null)

    const router = useRouter()

    useEffect(() => {
        gerarSugestoes()
    }, [tipoFiltro])

    const gerarSugestoes = async () => {
        const res = await fetch('/api/movimentacoes')
        const data = await res.json()
        const lista = Array.isArray(data.movimentacoes) ? data.movimentacoes : data

        const todosProdutos: Produto[] = []
        for (const mov of lista) {
            for (const item of mov.itens || []) {
                todosProdutos.push({
                    codprod: item.codprod,
                    produto: item.produto,
                    categoria: item.categoria,
                    quantidade: item.quantidade,
                    validade: item.validade,
                    alertaEstoque: item.alertaEstoque,
                    localizacao: item.localizacao,
                    selecionado: false,
                    tipoCampanha: 'Desconto',
                    descricaoCampanha: ''
                })
            }
        }

        const agora = new Date()
        const proximos30 = new Date()
        proximos30.setDate(agora.getDate() + 30)

        const sugeridas: Sugestao[] = []

        if (!tipoFiltro || tipoFiltro === 'excesso') {
            const comExcesso = todosProdutos.filter(p => p.quantidade > (p.alertaEstoque || 50) * 2)
            if (comExcesso.length > 0) {
                sugeridas.push({
                    tipo: 'excesso',
                    titulo: 'Campanha para Redução de Estoque',
                    descricao: 'Ofereça descontos progressivos para produtos com excesso de estoque.',
                    produtos: comExcesso
                })
            }
        }

        if (!tipoFiltro || tipoFiltro === 'vencimento') {
            const vencendo = todosProdutos.filter(p =>
                p.validade && new Date(p.validade) <= proximos30
            )
            if (vencendo.length > 0) {
                sugeridas.push({
                    tipo: 'vencimento',
                    titulo: 'Campanha para Produtos Próximos do Vencimento',
                    descricao: 'Sugestão de combos ou promoções rápidas para giro de produtos com validade curta.',
                    produtos: vencendo
                })
            }
        }

        if (!tipoFiltro || tipoFiltro === 'comemorativa') {
            const hoje = new Date()
            const mes = hoje.getMonth()
            const dataSazonal = [
                { mes: 1, nome: 'Carnaval' },
                { mes: 4, nome: 'Páscoa' },
                { mes: 5, nome: 'Dia das Mães' },
                { mes: 6, nome: 'Festas Juninas' },
                { mes: 9, nome: 'Dia das Crianças' },
                { mes: 10, nome: 'Natal' }
            ]
            const evento = dataSazonal.find(e => e.mes === mes)
            if (evento) {
                sugeridas.push({
                    tipo: 'comemorativa',
                    titulo: `Campanha Sazonal: ${evento.nome}`,
                    descricao: `Crie um combo temático com produtos da categoria relacionada a ${evento.nome}.`,
                    produtos: todosProdutos.slice(0, 5)
                })
            }
        }

        setSugestoes(sugeridas)
    }

    const atualizarProduto = (sugIndex: number, prodIndex: number, campo: string, valor: any) => {
        const novas = [...sugestoes]
        novas[sugIndex].produtos[prodIndex] = {
            ...novas[sugIndex].produtos[prodIndex],
            [campo]: valor
        }
        setSugestoes(novas)
    }

    const aprovarCampanha = (s: Sugestao) => {
        const produtosSelecionados = s.produtos.filter(p => p.selecionado)
        if (produtosSelecionados.length === 0) return

        const hoje = new Date()
        const daqui15dias = new Date()
        daqui15dias.setDate(hoje.getDate() + 15)

        setNovaCampanha({
            nome: '',
            inicio: hoje.toISOString().split('T')[0],
            fim: daqui15dias.toISOString().split('T')[0],
            descricao: s.descricao,
            produtos: produtosSelecionados
        })
    }


    const confirmarSalvar = async () => {
        if (!novaCampanha?.nome || novaCampanha.produtos.length === 0) {
            alert('Preencha todos os dados.')
            return
        }

        const payload = {
            titulo: novaCampanha.nome,
            tipo: 'subcampanha',
            descricao: novaCampanha.descricao,
            produtos: novaCampanha.produtos
        }

        const res = await fetch('/api/campanhas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })

        const json = await res.json()

        if (res.ok) {
            alert('✅ Campanha salva com sucesso!')
            setCampanhas(prev => [...prev, novaCampanha])
            setNovaCampanha(null)
        } else {
            console.error('Erro ao salvar campanha:', json.error)
            alert('❌ Erro ao salvar campanha.')
        }
    }
    useEffect(() => {
        const carregarCampanhas = async () => {
            try {
                const res = await fetch('/api/campanhas')
                if (!res.ok) throw new Error('Erro ao buscar campanhas')
                const data = await res.json()
                setCampanhas(data.campanhas || [])
            } catch (error) {
                console.error('❌ Erro ao carregar campanhas:', error)
                setCampanhas([]) // evita que fique undefined
            }
        }
        carregarCampanhas()
    }, [])

        return (
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">🎯 Sugestão de Campanhas</h1>
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="text-sm text-blue-600 border px-3 py-1 rounded hover:bg-blue-50"
                    >
                        Voltar
                    </button>
                </div>

                {campanhas.length > 0 && (
                    <div className="mb-6 border rounded p-4 bg-green-50">
                        <h2 className="text-lg font-bold mb-2">📢 Campanhas em Andamento</h2>
                        {campanhas.map((c, idx) => (
                            <div key={idx} className="mb-3">
                                <p className="font-semibold">{c.nome} ({c.inicio} → {c.fim})</p>
                                <p className="text-sm text-gray-700 mb-1">{c.descricao}</p>
                                <ul className="text-sm list-disc ml-6">
                                    {c.produtos.map((p, i) => (
                                        <li key={i}>{p.produto} ({p.quantidade} un)</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                )}

                <div className="mb-4">
                    <label className="block font-medium mb-1">Filtrar por tipo:</label>
                    <select
                        value={tipoFiltro}
                        onChange={(e) => setTipoFiltro(e.target.value)}
                        className="border p-2 rounded w-full max-w-sm"
                    >
                        <option value="">Todas as sugestões</option>
                        <option value="excesso">Excesso de Estoque</option>
                        <option value="vencimento">Próximos do Vencimento</option>
                        <option value="comemorativa">Data Comemorativa</option>
                    </select>
                </div>

                {sugestoes.length === 0 ? (
                    <p className="text-gray-600">Nenhuma sugestão gerada.</p>
                ) : (
                    sugestoes.map((s, i) => {
                        const produtosSelecionados = s.produtos.filter(p => p.selecionado)
                        return (
                            <div key={i} className="border rounded mb-6 p-4 bg-white shadow-sm">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h2 className="text-xl font-semibold">{s.titulo}</h2>
                                        <p className="text-sm text-gray-700 mb-3">{s.descricao}</p>
                                    </div>
                                    <button
                                        onClick={() => aprovarCampanha(s)}
                                        disabled={produtosSelecionados.length === 0}
                                        className={`px-4 py-2 rounded text-white ${produtosSelecionados.length === 0
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-green-600 hover:bg-green-700'
                                            }`}
                                    >
                                        {produtosSelecionados.length === 0 ? 'Selecione produtos' : 'Aprovar Campanha'}
                                    </button>

                                </div>

                                <table className="w-full text-sm border border-gray-300">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="p-2 border">✓</th>
                                            <th className="p-2 border">Produto</th>
                                            <th className="p-2 border">Qtd</th>
                                            <th className="p-2 border">Validade</th>
                                            <th className="p-2 border">Localização</th>
                                            <th className="p-2 border">Tipo</th>
                                            <th className="p-2 border">Descrição</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {s.produtos.map((p, j) => (
                                            <tr key={j}>
                                                <td className="p-2 border text-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={p.selecionado || false}
                                                        onChange={(e) => atualizarProduto(i, j, 'selecionado', e.target.checked)}
                                                    />

                                                </td>
                                                <td className="p-2 border">{p.produto}</td>
                                                <td className="p-2 border">{p.quantidade}</td>
                                                <td className="p-2 border">{p.validade || '-'}</td>
                                                <td className="p-2 border">{p.localizacao || '-'}</td>
                                                <td className="p-2 border">
                                                    <select
                                                        value={p.tipoCampanha}
                                                        onChange={(e) => atualizarProduto(i, j, 'tipoCampanha', e.target.value)}
                                                        className="border p-1 rounded bg-white"
                                                    >
                                                        <option value="Desconto">Desconto</option>
                                                        <option value="Compre 1 Leve 2">Compre 1 Leve 2</option>
                                                        <option value="Combo Temático">Combo Temático</option>
                                                    </select>
                                                </td>
                                                <td className="p-2 border">
                                                    <input
                                                        type="text"
                                                        value={p.descricaoCampanha || ''}
                                                        onChange={(e) => atualizarProduto(i, j, 'descricaoCampanha', e.target.value)}
                                                        className="border p-1 rounded w-full"
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )
                    })
                )}

                {novaCampanha && (
                    <div className="border rounded p-4 mt-4 bg-white">
                        <h3 className="text-lg font-semibold mb-4">📌 Criar Nova Subcampanha</h3>

                        <div className="mb-3">
                            <label className="block mb-1 font-medium">Nome da campanha:</label>
                            <input
                                type="text"
                                className="w-full border p-2 rounded"
                                value={novaCampanha.nome}
                                onChange={(e) =>
                                    setNovaCampanha({ ...novaCampanha, nome: e.target.value })
                                }
                                placeholder="Ex: Semana do Desconto Junino"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block mb-1 font-medium">Data de início:</label>
                                <input
                                    type="date"
                                    className="w-full border p-2 rounded"
                                    value={novaCampanha.inicio}
                                    onChange={(e) =>
                                        setNovaCampanha({ ...novaCampanha, inicio: e.target.value })
                                    }
                                />
                            </div>
                            <div>
                                <label className="block mb-1 font-medium">Data de término:</label>
                                <input
                                    type="date"
                                    className="w-full border p-2 rounded"
                                    value={novaCampanha.fim}
                                    onChange={(e) =>
                                        setNovaCampanha({ ...novaCampanha, fim: e.target.value })
                                    }
                                />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={confirmarSalvar}
                                className="bg-green-600 text-white px-4 py-2 rounded"
                                disabled={
                                    !novaCampanha.nome ||
                                    !novaCampanha.inicio ||
                                    !novaCampanha.fim ||
                                    novaCampanha.produtos.length === 0
                                }
                            >
                                ✅ Confirmar e Salvar
                            </button>
                            <button
                                onClick={() => setNovaCampanha(null)}
                                className="bg-gray-300 text-gray-800 px-4 py-2 rounded"
                            >
                                ❌ Cancelar
                            </button>
                        </div>
                    </div>

                )}
            </div>
        )
    }



