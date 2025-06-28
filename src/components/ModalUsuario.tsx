'use client'

import { useEffect, useState } from 'react'
import { Perfil } from '@/types/perfil'

interface Props {
    onClose: () => void
}

export default function ModalUsuario({ onClose }: Props) {
    const [form, setForm] = useState({
        nome: '',
        email: '',
        usuario: '',
        senha: '',
        perfil: 'operador',
        empresa: '',
        licencaTipo: '',
        licencaData: ''
    })

    const [perfilId, setPerfilId] = useState('')
    const [perfis, setPerfis] = useState<Perfil[]>([])

    useEffect(() => {
        const carregarPerfis = async () => {
            const res = await fetch('/api/perfis')
            const dados = await res.json()
            if (res.ok) setPerfis(dados.perfis)
        }

        carregarPerfis()
    }, [])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setForm(prev => ({ ...prev, [name]: value }))
    }

    const salvar = async () => {
        const body = {
            nome: form.nome,
            email: form.email,
            usuario: form.usuario,
            senha: form.senha,
            perfil: form.perfil,
            empresa: form.empresa,
            licenca: {
                tipo: form.licencaTipo,
                dataExpiracao: form.licencaData
            },
            perfil_id: perfilId // 👈 aqui!
        }

        const res = await fetch('/api/usuarios', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        })

        if (res.ok) {
            alert('Usuário cadastrado com sucesso!')
            onClose()
        } else {
            const erro = await res.json()
            alert('Erro: ' + erro?.erro)
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-lg relative">
                <h2 className="text-xl font-semibold mb-4">Novo Usuário</h2>

                <div className="space-y-3">
                    <input name="nome" value={form.nome} onChange={handleChange} placeholder="Nome" className="w-full border p-2 rounded" />
                    <input name="email" value={form.email} onChange={handleChange} placeholder="E-mail" className="w-full border p-2 rounded" />
                    <input name="usuario" value={form.usuario} onChange={handleChange} placeholder="Usuário" className="w-full border p-2 rounded" />
                    <input name="senha" value={form.senha} onChange={handleChange} type="password" placeholder="Senha" className="w-full border p-2 rounded" />

                    {/* Tipo de usuário (administrador ou operador) */}
                    <label className="block text-sm font-medium text-gray-700 mt-2">Tipo de Usuário</label>
                    <select
                        name="perfil"
                        value={form.perfil}
                        onChange={handleChange}
                        className="w-full border p-2 rounded"
                    >
                        <option value="administrador">Administrador</option>
                        <option value="operador">Operador</option>
                    </select>

                    {/* Perfil de permissões – visível apenas se for operador */}
                    {form.perfil === 'operador' && (
                        <>
                            <label className="block text-sm font-medium text-gray-700 mt-2">Perfil de Permissões</label>
                            <select
                                value={perfilId}
                                onChange={(e) => setPerfilId(e.target.value)}
                                className="w-full border p-2 rounded"
                            >
                                <option value="">Selecione um perfil</option>
                                {perfis.map(p => (
                                    <option key={p._id} value={p._id}>{p.nome}</option>
                                ))}
                            </select>
                        </>
                    )}


                    <input name="empresa" value={form.empresa} onChange={handleChange} placeholder="Empresa" className="w-full border p-2 rounded" />
                    <input name="licencaTipo" value={form.licencaTipo} onChange={handleChange} placeholder="Tipo de licença" className="w-full border p-2 rounded" />
                    <input name="licencaData" value={form.licencaData} onChange={handleChange} type="date" className="w-full border p-2 rounded" />
                </div>

                <div className="flex justify-end mt-6 space-x-3">
                    <button onClick={onClose} className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">Cancelar</button>
                    <button onClick={salvar} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Salvar</button>
                </div>
            </div>
        </div>
    )
}
