'use client'

import { ReactNode, useEffect, useState } from 'react'
import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from "next/image"

export default function DashboardLayout({ children }: { children: ReactNode }) {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [openEstoque, setOpenEstoque] = useState(false)

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/Login')
        }
    }, [status, router])

    if (status === 'loading') {
        return <p style={{ padding: '2rem' }}>Carregando...</p>
    }

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <aside
                style={{
                    width: '220px',
                    background: '#1e293b',
                    color: '#fff',
                    padding: '2rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    gap: '1rem'
                }}
            >
                {/* Logo no topo */}
                <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                    <Image
                        src="/images/smartevent-logo.png"
                        alt="SmartEvent Logo"
                        width={160}
                        height={40}
                        priority
                    />
                </div>

                {/* Menu de navegação */}
                <nav className="flex flex-col gap-4">
                    <Link href="/dashboard" className="text-white"> Início</Link>
                    <Link href="/dashboard/produtos" className="text-white">Produtos</Link>
                    <Link href="/dashboard/vendas" className="text-white"> Vendas</Link>
                    <Link href="/dashboard/campanhas" className="text-white">Campanhas</Link>
                    {/* Estoque com submenu */}
                    <div className="flex flex-col">
                        <button
                            onClick={() => setOpenEstoque(!openEstoque)}
                            className="text-white flex items-center justify-between"
                        >
                            <span className="flex gap-2">Estoque</span>
                            <span className={`transition-transform ${openEstoque ? 'rotate-90' : ''}`}>
                                ▶
                            </span>
                        </button>

                        {openEstoque && (
                            <div className="flex flex-col gap-2 pl-4 mt-2">
                                <Link href="/dashboard/estoque/consultar" className="text-white hover:underline">
                                    Consult. Estoque
                                </Link>
                                <Link href="/dashboard/estoque/movimentacoes" className="text-white hover:underline">
                                    Movimentações
                                </Link>
                                <Link href="/dashboard/estoque/local-e-status" className="text-white hover:underline">
                                    Config. Estoque
                                </Link>
                                <Link href="/dashboard/estoque/baixo" className="text-white hover:underline">
                                    Itens com Estoque Baixo
                                </Link>
                            </div>
                        )}
                    </div>

                    <Link href="/dashboard/relatorios" className="text-white">Relatórios</Link>
                    <div className="flex flex-col gap-2 pl-4 mt-2">
                        <Link href="/dashboard/admin/usuarios" className="text-white hover:underline">
                            ⚙️👷 Usuários
                        </Link>
                        <Link href="/dashboard/admin/perfis" className="text-white hover:underline">
                            ⚙️👷 Perfil
                        </Link></div>
                    <button
                        onClick={() => signOut({ callbackUrl: '/Login' })}
                        style={{
                            marginTop: 'auto',
                            background: '#ef4444',
                            color: '#fff',
                            padding: '0.5rem',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Sair
                    </button>
                </nav>

                {/* Botão de sair */}

            </aside>

            <main style={{ flex: 1, padding: '2rem' }}>
                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '1.5rem', color: '#1e293b' }}>
                        Bem-vindo, <span style={{ fontWeight: 600 }}>{session?.user?.name || session?.user?.email}</span>!
                    </h1>
                </div>
                {children}
            </main>
        </div >
    )
}
