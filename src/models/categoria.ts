import mongoose, { Schema, models, model } from 'mongoose'

const CategoriaSchema = new Schema(
    {
        nome: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
)

const Categoria = models.Categoria || model('Categoria', CategoriaSchema)

export default Categoria
