export interface Usuario {
    _id?: string
    nome: string
    email: string
    usuario: string
    perfil: 'administrador' | 'operador'
    empresa: string
    licenca: {
        tipo: string
        dataExpiracao: string
    }
}
