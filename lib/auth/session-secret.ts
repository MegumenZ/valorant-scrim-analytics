interface SessionSecretEnvironment {
  AUTH_SECRET?: string;
  DISCORD_CLIENT_SECRET?: string;
  NODE_ENV?: string;
}

const DEVELOPMENT_ONLY_SECRET = "valorant-scrim-analytics-dev-only-session-secret";

export function resolveSessionSecret(environment: SessionSecretEnvironment): string {
  if (environment.NODE_ENV === "production") {
    if (!environment.AUTH_SECRET || environment.AUTH_SECRET.length < 32) {
      throw new Error("AUTH_SECRET is required in production and must be at least 32 characters.");
    }
    return environment.AUTH_SECRET;
  }

  return environment.AUTH_SECRET || environment.DISCORD_CLIENT_SECRET || DEVELOPMENT_ONLY_SECRET;
}

export function getSessionSecret(): string {
  return resolveSessionSecret(process.env);
}
