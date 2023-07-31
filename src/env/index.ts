import { RateLimitRule } from "../rate-limiter/types";

export interface Env {
  RATE_LIMITER: DurableObjectNamespace;
  IDENTIFIER_CLAIM: string;
  JWKS_URI: string;
  RATE_LIMIT_RULES: RateLimitRule[] | string;
  LOG_LEVEL?: string;
}
