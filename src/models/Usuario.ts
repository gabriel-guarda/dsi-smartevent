import mongoose, { Schema, Document } from 'mongoose'

export interface Usuario extends Document {
  nome: string
  email: string
  usuario: string
  senhaHash: string
  perfil: 'administrador' | 'operador'
  empresa: string
  licenca: {
    tipo: string
    dataExpiracao: Date
  }
  permissoes: Record<string, {
    visualizar?: boolean
    incluir?: boolean
    alterar?: boolean
    excluir?: boolean
  }>
  ativo: boolean
}

const UsuarioSchema = new Schema<Usuario>({
  nome: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  usuario: { type: String, required: true, unique: true },
  senhaHash: { type: String, required: true },
  perfil: { type: String, enum: ['administrador', 'operador'], required: true },
  empresa: { type: String, required: true },
  licenca: {
    tipo: { type: String, required: true },
    dataExpiracao: { type: Date, required: true },
  },
  permissoes: {
    type: Map,
    of: {
      visualizar: { type: Boolean, default: false },
      incluir: { type: Boolean, default: false },
      alterar: { type: Boolean, default: false },
      excluir: { type: Boolean, default: false }
    },
    default: {}
  },
  ativo: { type: Boolean, default: true }
}, {
  timestamps: true
})

export default mongoose.models.Usuario || mongoose.model<Usuario>('Usuario', UsuarioSchema)
