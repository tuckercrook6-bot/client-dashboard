const SUPABASE_KEYS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
] as const;

function hasValue(s: string | undefined): boolean {
  return typeof s === "string" && s.trim().length > 0;
}

export function getEnv(key: (typeof SUPABASE_KEYS)[number]): string | undefined {
  return process.env[key];
}

export function getEnvRequired(key: (typeof SUPABASE_KEYS)[number]): string {
  const v = process.env[key];
  if (!hasValue(v)) {
    throw new Error(`Missing required env: ${key}`);
  }
  return v!;
}

/**
 * Returns keys that are missing or empty. Useful for dev checks.
 */
export function missingEnvKeys(
  keys: readonly string[] = SUPABASE_KEYS
): string[] {
  return keys.filter((k) => !hasValue(process.env[k]));
}
