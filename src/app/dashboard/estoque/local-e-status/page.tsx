'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CubeIcon, MapPinIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'

export default function LocalStatusPage() {
    const router = useRouter()

    const [statusCount, setStatusCount] = useState<number>(0)
    const [localizacoesCount, setLocalizacoesCount] = useState<number>(0)

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await fetch('/api/status')
                if (res.ok) {
                    const data = await res.json()
                    setStatusCount(data.length || 0)
                }
            } catch (err) {
                console.error('Erro ao carregar status:', err)
            }
        }

        const fetchLocalizacoes = async () => {
            try {
                const res = await fetch('/api/localizacoes')
                if (res.ok) {
                    const data = await res.json()
                    setLocalizacoesCount(data.length || 0)
                }
            } catch (err) {
                console.error('Erro ao carregar localizações:', err)
            }
        }

        fetchStatus()
        fetchLocalizacoes()
    }, [])

    const cards = [
        {
            titulo: 'Status',
            descricao: 'Visualize e gerencie os status dos produtos no estoque.',
            total: statusCount,
            icone: <CubeIcon className="h-10 w-10 text-blue-600" />,
            rota: '/dashboard/estoque/local-e-status/status',
        },
        {
            titulo: 'Localização',
            descricao: 'Gerencie locais físicos como prateleiras, freezers ou adegas.',
            total: localizacoesCount,
            icone: <MapPinIcon className="h-10 w-10 text-green-600" />,
            rota: '/dashboard/estoque/local-e-status/localizacao',
        },
        {
            titulo: 'Busca Avançada',
            descricao: 'Encontre produtos por código, nome, status, local ou nota.',
            total: null,
            icone: <MagnifyingGlassIcon className="h-10 w-10 text-purple-600" />,
            rota: '/dashboard/estoque/local-e-status/busca',
        },
    ]

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Local e Status</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {cards.map((card, idx) => (
                    <div
                        key={idx}
                        onClick={() => router.push(card.rota)}
                        className="bg-white border hover:border-blue-500 cursor-pointer p-5 rounded shadow flex flex-col gap-3 transition"
                    >
                        <div className="flex justify-between items-center">
                            <div>{card.icone}</div>
                            {card.total !== null && (
                                <span className="text-sm bg-slate-200 px-2 py-1 rounded text-gray-800">
                                    {card.total} itens
                                </span>
                            )}
                        </div>
                        <h2 className="text-lg font-semibold">{card.titulo}</h2>
                        <p className="text-sm text-gray-600">{card.descricao}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}
