import { StackServerApp } from "@stackframe/stack";

export const stackServerApp = new StackServerApp({
  projectId: process.env.NEXT_PUBLIC_STACK_PROJECT_ID!,
  secretServerKey: process.env.STACK_SECRET_SERVER_KEY!,
  tokenStore: "nextjs-cookie",
  urls: {
    signIn: "/auth/sign-in",
    signUp: "/auth/sign-up", 
    emailVerification: "/auth/email-verification",
    passwordReset: "/auth/password-reset",
    home: "/dashboard",
    afterSignIn: "/dashboard",
    afterSignUp: "/auth/setup-profile",
    afterPasswordReset: "/dashboard",
  },
  // Configurações de segurança básicas
  cookies: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "strict",
    maxAge: 24 * 60 * 60 * 1000, // 24 horas
  },
});
