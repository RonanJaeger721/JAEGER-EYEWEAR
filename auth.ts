import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { mutate, readState, storageReady } from "@/lib/db";
import { checkPassword } from "@/lib/password";
export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  pages: { signIn: "/account" },
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        if (!storageReady() || !process.env.AUTH_SECRET) return null;
        const parsed = z
          .object({
            email: z
              .email()
              .max(254)
              .transform((v) => v.toLowerCase()),
            password: z.string().min(1).max(128),
          })
          .safeParse(credentials);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;
        const allowed = await mutate((s) => {
          const now = Date.now();
          const key = `login:${email}`;
          const a = s.attempts[key];
          if (a && a.until > now && a.count >= 8) return false;
          s.attempts[key] = {
            count: a && a.until > now ? a.count + 1 : 1,
            until: now + 900000,
          };
          return true;
        });
        if (!allowed) return null;
        const s = await readState();
        const user = s.users.find((u) => u.email === email && !u.disabled);
        if (!user || !checkPassword(password, user.password)) return null;
        return { id: user.id, name: user.name, email: user.email };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.sub = user.id;
      return token;
    },
    session({ session, token }) {
      if (session.user && token.sub) session.user.id = token.sub;
      return session;
    },
  },
});
