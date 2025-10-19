import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        // Simple demo authentication - replace with real database later
        const users = [
          { id: '1', email: 'demo@student.com', password: 'demo123', name: 'Demo Student' },
          { id: '2', email: 'test@student.com', password: 'test123', name: 'Test Student' },
          { id: '3', email: 'user@study.com', password: 'user123', name: 'Study User' }
        ]
        
        const user = users.find(u => 
          u.email === credentials?.email && u.password === credentials?.password
        )
        
        if (user) {
          return { id: user.id, email: user.email, name: user.name }
        }
        return null
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  pages: {
    signIn: '/login',
    signOut: '/'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
      }
      return session
    }
  }
}