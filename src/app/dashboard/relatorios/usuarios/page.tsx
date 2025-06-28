'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Usuario {
    nome: string
    email: string
    perfil: string
    ultimoAcesso: string
}

export default function RelatorioUsuarios() {
    const [usuarios, setUsuarios] = useState<Usuario[]>([])
    const [filtros, setFiltros] = useState({ inicio: '', fim: '' })
    const [resultado, setResultado] = useState('')
    const router = useRouter()

    const aplicarFiltro = async () => {
        try {
            const res = await fetch('/api/usuarios') // Supondo que essa rota traga todos os usuários
            const data = await res.json()
            const lista = Array.isArray(data) ? data : []

            const dtIni = filtros.inicio ? new Date(filtros.inicio) : null
            const dtFim = filtros.fim ? new Date(filtros.fim + 'T23:59:59') : null

            const filtrados = lista.filter((u: any) => {
                const acesso = u.ultimoAcesso ? new Date(u.ultimoAcesso) : null
                if (!acesso) return false
                return (!dtIni || acesso >= dtIni) && (!dtFim || acesso <= dtFim)
            })

            const formatados = filtrados.map((u: any) => ({
                nome: u.nome,
                email: u.email,
                perfil: u.perfil,
                ultimoAcesso: u.ultimoAcesso
                    ? new Date(u.ultimoAcesso).toLocaleString('pt-BR')
                    : 'Sem registro'
            }))

            setUsuarios(formatados)
            setResultado(`Período: ${filtros.inicio} até ${filtros.fim}`)
        } catch (err) {
            console.error('Erro ao buscar usuários:', err)
        }
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">👥 Relatório de Usuários</h1>
                <button
                    onClick={() => router.push('/dashboard/relatorios')}
                    className="text-sm text-blue-600 border px-3 py-1 rounded hover:bg-blue-50"
                >
                    Voltar
                </button>
            </div>

            <div className="bg-gray-50 border p-4 rounded mb-4 space-y-2">
                <p className="font-medium">Filtrar por data de último acesso:</p>
                <div className="flex gap-2">
                    <input
                        type="date"
                        value={filtros.inicio}
                        onChange={(e) => setFiltros({ ...filtros, inicio: e.target.value })}
                        className="border p-2 rounded"
                    />
                    <input
                        type="date"
                        value={filtros.fim}
                        onChange={(e) => setFiltros({ ...filtros, fim: e.target.value })}
                        className="border p-2 rounded"
                    />
                    <button
                        onClick={aplicarFiltro}
                        className="bg-blue-600 text-white px-4 py-2 rounded"
                    >
                        Visualizar
                    </button>
                </div>
                {resultado && <p className="text-sm text-gray-700">{resultado}</p>}
            </div>

            {usuarios.length > 0 && (
                <div className="overflow-auto mt-4">
                    <table className="min-w-full text-sm border border-gray-300">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border p-2">Nome</th>
                                <th className="border p-2">Email</th>
                                <th className="border p-2">Perfil</th>
                                <th className="border p-2">Último Acesso</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usuarios.map((u, i) => (
                                <tr key={i}>
                                    <td className="border p-2">{u.nome}</td>
                                    <td className="border p-2">{u.email}</td>
                                    <td className="border p-2">{u.perfil}</td>
                                    <td className="border p-2">{u.ultimoAcesso}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
