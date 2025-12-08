// Purpose: Configure NextAuth with JWT strategy and credentials provider
// Handles: User authentication, password verification with bcrypt, JWT token creation
// Used by: API route handlers and middleware for authentication
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signInSchema } from "@/lib/validations/zodauth";
import { UserRole } from "@/generated/prisma";

export const authOptions: NextAuthOptions = {
  // Use JWT strategy for stateless authentication
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  // Custom sign-in page
  pages: {
    signIn: "/auth/signin",
    error: "/auth/signin",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        // Validate input with Zod schema
        const validatedFields = signInSchema.safeParse({
          email: credentials.email,
          password: credentials.password,
        });

        if (!validatedFields.success) {
          throw new Error("Invalid credentials");
        }

        // Find user in database using Prisma
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user) {
          throw new Error("Invalid credentials");
        }

        // Check if user has a password (members only can sign in)
        if (!user.password) {
          throw new Error(
            "This account cannot sign in. Please contact support or register as a member."
          );
        }

        // Verify hashed password using bcrypt
        const isPasswordValid = await compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }

        // Return user object that matches NextAuth User type (including isMember)
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          isMember: user.isMember,
        };
      },
    }),
  ],
  callbacks: {
    // Add user info to JWT token
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
        token.isMember = user.isMember;
      }
      return token;
    },
    // Add token info to session
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.role = token.role as UserRole;
        session.user.isMember = token.isMember as boolean;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
