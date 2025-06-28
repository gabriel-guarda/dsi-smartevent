// src/models/Perfil.ts
import mongoose, { Schema, Document } from 'mongoose'

export interface Perfil extends Document {
    nome: string
    descricao?: string
    permissoes: {
        estoque?: {
            visualizar?: boolean
            incluir?: boolean
            alterar?: boolean
            excluir?: boolean
        },
        documentos?: {
            visualizar?: boolean
            incluir?: boolean
            alterar?: boolean
            excluir?: boolean
        }
        // outros módulos no futuro
    }
}

const PerfilSchema = new Schema<Perfil>({
    nome: { type: String, required: true, unique: true },
    descricao: { type: String },
    permissoes: { type: Object, default: {} }
}, {
    timestamps: true
})

export default mongoose.models.Perfil || mongoose.model<Perfil>('Perfil', PerfilSchema)
