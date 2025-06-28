import mongoose, { Schema, model, models } from 'mongoose'

const ProdutoSchema = new Schema({
    codprod: String,
    produto: String,
    categoria: String,
    quantidade: Number,
    validade: String,
    alertaEstoque: Number,
    localizacao: String,
    tipoCampanha: String,
    descricaoCampanha: String
})

const CampanhaSchema = new Schema({
    tipo: { type: String, required: true },
    titulo: { type: String, required: true },
    descricao: { type: String },
    produtos: [ProdutoSchema],
    dataCriacao: { type: Date, default: Date.now }
})

export const Campanha = models.Campanha || model('Campanha', CampanhaSchema)
