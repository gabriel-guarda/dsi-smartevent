export interface Perfil {
    _id?: string
    nome: string
    descricao?: string
    permissoes: {
        estoque?: {
            visualizar?: boolean
            incluir?: boolean
            alterar?: boolean
            excluir?: boolean
        }
    }
}
