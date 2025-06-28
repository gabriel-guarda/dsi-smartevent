'use client'

import { signIn, useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
    const { data: session, status } = useSession()
    const router = useRouter()

    const [usuario, setUsuario] = useState('')
    const [senha, setSenha] = useState('')
    const [empresa, setEmpresa] = useState('')
    const [empresas, setEmpresas] = useState<string[]>([])

    const [erro, setErro] = useState('')
    useEffect(() => {
        const carregarEmpresas = async () => {
            const res = await fetch('/api/empresas')
            const dados = await res.json()
            if (res.ok) setEmpresas(dados.empresas)
        }

        carregarEmpresas()
    }, [])

    useEffect(() => {
        if (status === 'authenticated') {
            router.push('/dashboard')
        }
    }, [status, router])

    const autenticar = async () => {
        const res = await signIn('credentials', {
            redirect: false,
            usuario,
            senha,
            empresa
        })

        if (!res?.ok) {
            setErro('Usuário, senha ou empresa inválida')
        }
    }

    return (
        <div
            className="min-h-screen bg-cover bg-center flex items-center justify-center px-4"
            style={{ backgroundImage: "url('/images/tela-login.png')" }}
        >
            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-8 max-w-md w-full">
                <h1 className="text-2xl font-bold mb-6 text-gray-800 text-center">Bem-vindo ao SmartEvent</h1>

                <select
                    value={empresa}
                    onChange={(e) => setEmpresa(e.target.value)}
                    className="w-full mb-3 px-4 py-2 rounded-md border border-gray-300"
                >
                    <option value="">Selecione a sua empresa</option>
                    {empresas.map((nome) => (
                        <option key={nome} value={nome}>
                            {nome}
                        </option>
                    ))}
                </select>


                <input
                    type="text"
                    placeholder="Usuário"
                    value={usuario}
                    onChange={(e) => setUsuario(e.target.value)}
                    className="w-full mb-3 px-4 py-2 rounded-md border border-gray-300"
                />
                <input
                    type="password"
                    placeholder="Senha"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className="w-full mb-3 px-4 py-2 rounded-md border border-gray-300"
                />

                {erro && <p className="text-red-500 text-sm mb-3">{erro}</p>}

                <button
                    onClick={autenticar}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition mb-4"
                >
                    Entrar
                </button>

                <div className="text-center text-sm text-gray-500 mb-4">ou</div>

                <button
                    onClick={() => signIn('google')}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md flex items-center justify-center gap-2 font-medium transition"
                >
                    <svg
                        className="w-5 h-5"
                        viewBox="0 0 488 512"
                        fill="currentColor"
                    >
                        <path d="M488 261.8c0-17.8-1.5-35-4.3-51.6H249v97.8h134.2c-5.8 31.1-23 57.4-49 75.2v62h79c46.3-42.6 74-105.3 74-183.4z" />
                        <path d="M249 492c66.3 0 121.8-21.8 162.4-59.3l-79-62c-21.9 14.7-50 23.2-83.4 23.2-64 0-118.2-43.2-137.7-101.2H30v63.4C70.2 429.7 152.4 492 249 492z" />
                        <path d="M111.3 292.7C105.6 276.4 102 259 102 241s3.6-35.4 9.3-51.7V125.9H30C10.8 165.3 0 202.2 0 241s10.8 75.7 30 115.1l81.3-63.4z" />
                        <path d="M249 96.8c35.9 0 68.2 12.4 93.6 32.7l70.2-70.2C373.4 21.6 317.3 0 249 0 152.4 0 70.2 62.3 30 125.9l81.3 63.4C130.8 140 185 96.8 249 96.8z" />
                    </svg>
                    Entrar com Google
                </button>
            </div>
        </div>
    )
}
