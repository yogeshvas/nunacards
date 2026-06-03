import CredentialsProvider from "next-auth/providers/credentials";
import type { AuthOptions } from "next-auth";
import bcrypt from "bcrypt";
import { prisma } from "./db";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "credentials",

      credentials: {
        email: {},
        password: {},
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          return null;
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          orgId: user.orgId,
          tokenVersion: user.tokenVersion,
        };
      },
    }),

    CredentialsProvider({
      id: "otp",
      name: "OTP",

      credentials: {
        email: {},
        otp: {},
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.otp) return null;

        const token = await prisma.otpToken.findUnique({
          where: { email: credentials.email },
        });

        if (!token || token.verified) return null;
        if (new Date() > token.expiresAt) return null;
        if (token.otp !== credentials.otp) return null;

        await prisma.otpToken.update({
          where: { email: credentials.email },
          data: { verified: true },
        });

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          orgId: user.orgId,
          tokenVersion: user.tokenVersion,
        };
      },
    }),
  ],

  pages: {
    signIn: "/login",
  },

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.orgId = user.orgId;
        token.tokenVersion = user.tokenVersion;
      }
      return token;
    },

    async session({ session, token }: any) {
      session.user.id = token.id ?? token.sub;
      session.user.role = token.role;
      session.user.orgId = token.orgId;
      session.user.tokenVersion = token.tokenVersion;
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};
