'use client'

import { useEffect, useState } from 'react'
import ModalNovoStatus from '@/components/ModalNovoStatus'
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline'

export default function StatusPage() {
  const [statusList, setStatusList] = useState<string[]>([])
  const [modalAberto, setModalAberto] = useState(false)
  const [edicaoIndex, setEdicaoIndex] = useState<number | null>(null)
  const [novoValor, setNovoValor] = useState('')

  const carregar = async () => {
    try {
      const res = await fetch('/api/status')
      if (!res.ok) throw new Error('Erro ao buscar')
      const data = await res.json()
      setStatusList(data || [])
    } catch (err) {
      console.error('Erro ao buscar status:', err)
    }
  }

  useEffect(() => {
    carregar()
  }, [])

  const salvarEdicao = async () => {
    if (edicaoIndex === null || !novoValor.trim()) return
    const antigo = statusList[edicaoIndex]

    try {
      const res = await fetch('/api/status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ antigo, novo: novoValor }),
      })

      if (!res.ok) throw new Error('Erro ao editar status')
      setEdicaoIndex(null)
      setNovoValor('')
      carregar()
    } catch (err) {
      console.error('Erro ao editar:', err)
      alert('Erro ao salvar alteração.')
    }
  }

  const excluir = async (status: string) => {
    const confirmar = confirm(`Deseja excluir o status "${status}"?`)
    if (!confirmar) return

    try {
      const res = await fetch('/api/status', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: status }),
      })

      if (!res.ok) throw new Error('Erro ao excluir status')
      carregar()
    } catch (err) {
      console.error('Erro ao excluir status:', err)
      alert('Erro ao excluir.')
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Status Cadastrados</h1>
        <button
          onClick={() => setModalAberto(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          + Novo Status
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statusList.map((status, idx) => (
          <div key={idx} className="bg-slate-100 p-4 rounded shadow flex justify-between items-center">
            {edicaoIndex === idx ? (
              <div className="flex w-full gap-2">
                <input
                  value={novoValor}
                  onChange={(e) => setNovoValor(e.target.value)}
                  className="flex-1 border p-2 rounded"
                />
                <button onClick={salvarEdicao} className="bg-green-600 text-white px-3 py-1 rounded text-sm">
                  Salvar
                </button>
                <button onClick={() => setEdicaoIndex(null)} className="bg-gray-300 px-3 py-1 rounded text-sm">
                  Cancelar
                </button>
              </div>
            ) : (
              <>
                <span className="text-gray-800">{status}</span>
                <div className="flex gap-2">
                  <PencilSquareIcon
                    onClick={() => {
                      setEdicaoIndex(idx)
                      setNovoValor(status)
                    }}
                    className="w-5 h-5 text-blue-600 hover:text-blue-800 cursor-pointer"
                  />
                  <TrashIcon
                    onClick={() => excluir(status)}
                    className="w-5 h-5 text-red-600 hover:text-red-800 cursor-pointer"
                  />
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {modalAberto && (
        <ModalNovoStatus
          onClose={() => setModalAberto(false)}
          onSalvou={carregar}
        />
      )}
    </div>
  )
}
