import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { connectDB } from '@/lib/mongodb'
import Usuario from '@/models/Usuario'
import bcrypt from 'bcryptjs'

const handler = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!
        }),
        CredentialsProvider({
            name: 'Login com Usuário e Senha',
            credentials: {
                usuario: { label: 'Usuário', type: 'text' },
                senha: { label: 'Senha', type: 'password' },
                empresa: { label: 'Empresa', type: 'text' }
            },
            async authorize(credentials) {
                await connectDB()

                const user = await Usuario.findOne({ usuario: credentials?.usuario })

                if (!user || !user.ativo) return null

                const senhaCorreta = await bcrypt.compare(credentials!.senha, user.senhaHash)
                if (!senhaCorreta) return null

                if (user.empresa !== credentials?.empresa) {
                    console.log('Empresa não confere!')
                    return null
                }

                return {
                    id: user._id.toString(),
                    nome: user.nome,
                    email: user.email,
                    perfil: user.perfil,
                    empresa: user.empresa,
                    permissoes: user.permissoes


                }
            }
        })

    ],


    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.perfil = user.perfil
                token.permissoes = user.permissoes // ESSENCIAL!
            }
            return token
        },


        async session({ session, token }) {
            if (token) {
                session.user.permissoes = token.permissoes
                session.user.perfil = token.perfil
            }
            return session
        }

    },

    pages: {
        signIn: '/login'
    },

    session: {
        strategy: 'jwt'
    }
})

export { handler as GET, handler as POST }
