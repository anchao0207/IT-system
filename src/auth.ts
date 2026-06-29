import NextAuth from "next-auth";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import type { MicrosoftEntraIDProfile } from "next-auth/providers/microsoft-entra-id";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: {
    strategy: "jwt",
  },
  providers: [
    MicrosoftEntraID({
      clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID,
      clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET,
      issuer:
        process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER ||
        "https://login.microsoftonline.com/common/v2.0",
      profile(profile: MicrosoftEntraIDProfile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email ?? profile.preferred_username,
          image: null,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, profile }) {
      if (profile?.sub) token.entraSubject = profile.sub;
      return token;
    },
    session({ session, token }) {
      session.user.entraSubject =
        typeof token.entraSubject === "string" ? token.entraSubject : undefined;
      return session;
    },
  },
  pages: {
    signIn: "/sign-in",
  },
});
