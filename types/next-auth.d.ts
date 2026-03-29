import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: "ADMIN" | "MANAGER" | "EVALUATOR";
    };
  }

  interface User {
    role: "ADMIN" | "MANAGER" | "EVALUATOR";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "ADMIN" | "MANAGER" | "EVALUATOR";
  }
}
