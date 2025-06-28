import mongoose, { Schema, model, models } from 'mongoose'

const schema = new Schema({
    nome: { type: String, required: true, unique: true }
})

const Localizacao = models.Localizacao || model('Localizacao', schema)
export default Localizacao
