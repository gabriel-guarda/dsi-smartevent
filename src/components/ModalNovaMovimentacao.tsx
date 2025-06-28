'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface ModalNovaMovimentacaoProps {
    onClose: () => void
    onSalvou: (novaMov: any) => void
    categorias: string[]
    produtosExistentes: {
        codprod: string
        nome: string
        categoria: string
    }[]
}

export default function ModalNovaMovimentacao({
    onClose,
    onSalvou,
    categorias: categoriasExternas,
    produtosExistentes,
}: ModalNovaMovimentacaoProps) {
    const { data: session } = useSession()

    const [form, setForm] = useState({
        dataHora: '',
        nota: '',
        tipo: 'entrada',
        responsavel: '',
        clienteOuFornecedor: '',
    })

    const [categorias, setCategorias] = useState<string[]>(categoriasExternas || [])

    useEffect(() => {
        if (session?.user?.name) {
            setForm((prev) => ({ ...prev, responsavel: session.user.name }))
        }
    }, [session])

    useEffect(() => {
        if (!categoriasExternas || categoriasExternas.length === 0) {
            const carregarCategorias = async () => {
                try {
                    const res = await fetch('/api/categorias')
                    const data = await res.json()
                    if (Array.isArray(data)) setCategorias(data)
                } catch (error) {
                    console.error('Erro ao buscar categorias:', error)
                }
            }

            carregarCategorias()
        }
    }, [categoriasExternas])

    useEffect(() => {
        if (session?.user?.name) {
            setForm((prev) => ({ ...prev, responsavel: session.user.name }))
        }
    }, [session])

    const [itens, setItens] = useState<{
        codprod: string
        produto: string
        categoria: string
        quantidade: string
        valorUnitario: string
        lote: string
        fabricacao: string
        validade: string
        editavel?: boolean
        descricao: string
        tipoEmbalagem: string
        alertaEstoque: number
    }[]>([])

    const adicionarItem = () => {
        setItens((prev) => [
            ...prev,
            {
                codprod: '',
                produto: '',
                categoria: '',
                quantidade: '',
                valorUnitario: '',
                lote: '',
                fabricacao: '',
                validade: '',
                descricao: '',
                tipoEmbalagem: '',
                alertaEstoque: 0,
                editavel: true,
            },
        ])
    }

    const atualizarItem = async (index: number, key: string, value: string | boolean) => {
        if (key === 'codprod' && !value) return

        const novosItens = [...itens]
        novosItens[index] = { ...novosItens[index], [key]: value as string }

        if (key === 'codprod') {
            try {
                const res = await fetch(`/api/movimentacoes`)
                const data = await res.json()
                const lista = Array.isArray(data.movimentacoes) ? data.movimentacoes : data

                let encontrado = null
                for (const mov of lista) {
                    for (const item of mov.itens) {
                        if (item.codprod === value) {
                            encontrado = item
                            break
                        }
                    }
                    if (encontrado) break
                }

                if (encontrado) {
                    novosItens[index].produto = encontrado.produto
                    novosItens[index].categoria = encontrado.categoria
                    novosItens[index].editavel = true
                } else {
                    novosItens[index].produto = ''
                    novosItens[index].categoria = ''
                    novosItens[index].editavel = true
                }
            } catch (err) {
                console.error('Erro ao buscar produto:', err)
                novosItens[index].produto = ''
                novosItens[index].categoria = ''
                novosItens[index].editavel = true
            }
        }

        setItens(novosItens)
    }

    const removerItem = (index: number) => {
        setItens(itens.filter((_, i) => i !== index))
    }

    const calcularTotal = () => {
        return itens.reduce(
            (acc, item) => acc + Number(item.quantidade) * Number(item.valorUnitario),
            0
        ) * (form.tipo === 'saida' ? -1 : 1)
    }

    const calcularQuantidadeTotal = () => {
        return itens.reduce((acc, item) => acc + Number(item.quantidade), 0) * (form.tipo === 'saida' ? -1 : 1)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const itensFormatados = itens.map((i) => ({
            codprod: i.codprod,
            produto: i.produto,
            descricao: i.descricao || '',
            alertaEstoque: Number(i.alertaEstoque) || 0,
            tipoEmbalagem: i.tipoEmbalagem,
            categoria: i.categoria,
            quantidade: Number(i.quantidade),
            valorUnitario: Number(i.valorUnitario),
            totalItem: Number(i.quantidade) * Number(i.valorUnitario),
            lote: i.lote,
            fabricacao: new Date(i.fabricacao),
            validade: new Date(i.validade),
        }))

        const payload = {
            dataHora: form.dataHora,
            nota: form.nota,
            tipo: form.tipo,
            responsavel: form.responsavel.trim() || 'Não informado',
            clienteOuFornecedor: form.clienteOuFornecedor,
            itens: itensFormatados,
            quantidade: calcularQuantidadeTotal(),
            valor: calcularTotal(),
        }

        const camposInvalidos = itens.some(item => !item.codprod || !item.produto || !item.categoria)
        if (camposInvalidos) {
            alert("Preencha todos os campos obrigatórios dos itens.")
            return
        }

        try {
            const res = await fetch('/api/movimentacoes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })

            const novaMov = await res.json()
            onSalvou(novaMov)
            onClose()
        } catch (err) {
            console.error('❌ Erro no envio:', err)
            alert('Erro inesperado ao salvar.')
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-lg w-[700px] max-h-[90vh] overflow-auto space-y-4">
                <h2 className="text-xl font-bold">Nova Movimentação</h2>

                <input type="datetime-local" value={form.dataHora} onChange={(e) => setForm({ ...form, dataHora: e.target.value })} className="border p-2 rounded w-full" required />
                <input type="text" placeholder="Nota Fiscal" value={form.nota} onChange={(e) => setForm({ ...form, nota: e.target.value })} className="border p-2 rounded w-full" required />

                <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} className="border p-2 rounded w-full">
                    <option value="entrada">Entrada</option>
                    <option value="saida">Saída</option>
                </select>

                <input type="text" placeholder={form.tipo === 'entrada' ? 'Fornecedor' : 'Cliente'} value={form.clienteOuFornecedor} onChange={(e) => setForm({ ...form, clienteOuFornecedor: e.target.value })} className="border p-2 rounded w-full" />

                <div>
                    <h3 className="font-bold mb-2">Itens</h3>
                    {itens.map((item, idx) => (
                        <div key={idx} className="flex flex-wrap gap-2 mb-2">
                            <input
                                type="text"
                                placeholder="Código do Produto"
                                value={item.codprod}
                                onChange={(e) => atualizarItem(idx, 'codprod', e.target.value)}
                                className="border p-2 rounded w-[110px]"
                                required
                            />
                            <input
                                type="text"
                                placeholder="Produto"
                                value={item.produto}
                                onChange={(e) => atualizarItem(idx, 'produto', e.target.value)}
                                className="border p-2 rounded w-[150px]"
                            />
                            <select
                                value={item.categoria || ''}
                                onChange={(e) => atualizarItem(idx, 'categoria', e.target.value)}
                                className="border p-2 rounded w-[140px] bg-white"
                            >
                                <option value="">Selecione</option>
                                {categorias.length > 0 ? (
                                    categorias.map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat}
                                        </option>
                                    ))
                                ) : (
                                    <option disabled>Carregando categorias...</option>
                                )}
                            </select>

                            <input type="number" placeholder="Qtd" value={item.quantidade} onChange={(e) => atualizarItem(idx, 'quantidade', e.target.value)} className="border p-2 rounded w-[70px]" required />
                            <input type="number" placeholder="Vlr Unit" value={item.valorUnitario} onChange={(e) => atualizarItem(idx, 'valorUnitario', e.target.value)} className="border p-2 rounded w-[90px]" required />
                            <input type="text" placeholder="Lote" value={item.lote} onChange={(e) => atualizarItem(idx, 'lote', e.target.value)} className="border p-2 rounded w-[100px]" />
                            <input type="date" value={item.fabricacao} onChange={(e) => atualizarItem(idx, 'fabricacao', e.target.value)} className="border p-2 rounded w-[120px]" />
                            <input type="date" value={item.validade} onChange={(e) => atualizarItem(idx, 'validade', e.target.value)} className="border p-2 rounded w-[120px]" />
                            <button type="button" onClick={() => removerItem(idx)} className="bg-red-500 text-white px-2 rounded">X</button>
                        </div>
                    ))}
                    <button type="button" onClick={adicionarItem} className="bg-slate-200 px-3 py-1 rounded">+ Adicionar Item</button>
                </div>

                <div className="text-right font-bold">Valor Total: R$ {calcularTotal().toFixed(2)}</div>

                <div className="flex gap-2 justify-end">
                    <button type="button" onClick={onClose} className="bg-slate-300 px-4 py-2 rounded">Cancelar</button>
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Salvar</button>
                </div>
            </form>
        </div>
    )
}
