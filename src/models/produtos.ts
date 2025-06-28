import mongoose, { Schema, model, models } from 'mongoose'

const ProdutoSchema = new Schema(
    {
        codprod: { type: String, required: true, unique: true },
        produto: { type: String, required: true },
        categoria: { type: String, required: true },
    },
    { timestamps: true }
)

const Produto = models.Produto || model('Produto', ProdutoSchema)
export default Produto
