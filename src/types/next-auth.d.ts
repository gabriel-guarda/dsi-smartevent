import NextAuth from 'next-auth'

declare module 'next-auth' {
    interface Session {
        user: {
            name?: string
            email?: string
            perfil?: string
            empresa?: string
            permissoes?: {
                estoque?: {
                    visualizar?: boolean
                    incluir?: boolean
                    alterar?: boolean
                    excluir?: boolean
                }
            }
        }
    }
}


interface User {
    perfil?: 'administrador' | 'operador'
}

