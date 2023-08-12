import { assert, warn } from '../assertions';
import { InjectionKeys, di } from '../di';
import type { Env } from '../env';
import { JwtSerde } from '../formats/jwt';
import { RateLimiter } from '../rate-limiter';
import { Just, Maybe } from '../types';

// NOTE: We MUST export our Durable Object namespace from the root module
export { RateLimiter } from '../rate-limiter';

// NOTE: Default export defines the request controller as `fetch`
export default {
  async fetch(request: Readonly<Request>, env: Env) {
    try {
      assert(env.RATE_LIMITER, 'RateLimiter must be defined');
      assert(env.IDENTIFIER_CLAIM, 'Identifier claim must be defined');
      assert(env.RATE_LIMIT_RULES, 'Rate limit rules must be defined');
      warn(
        env.JWKS_URI,
        'No JWKS URI provided, no verification will be performed',
      );

      return await handleRequest(
        request,
        env,
        di().get<JwtSerde>(InjectionKeys.JwtSerde),
      );
    } catch (e) {
      return new Response(String(e));
    }
  },
};

// NOTE: the main request handler, implements the rate limiter evaluation and proxy logic
async function handleRequest(
  request: Readonly<Request>,
  env: Env,
  jwt: JwtSerde,
) {
  const accessToken = request.headers.get('access_token');

  const identifier = determineIdentifier(
    jwt,
    accessToken,
    env.IDENTIFIER_CLAIM,
  );

  const rateLimiter = getDurableObject(env.RATE_LIMITER, identifier);

  const res = await executeRateLimiter(rateLimiter, request, identifier);

  const isRateLimited = await shouldApplyRateLimit(res);

  if (isRateLimited) {
    return new Response(null, { status: RateLimiter.STATUS_CODE });
  }

  // continue request...
  return fetch(request);
}

function determineIdentifier(
  jwt: JwtSerde,
  token: string | null,
  claimKey: string,
): Maybe<string> {
  try {
    if (token) {
      const { payload } = jwt.deserialize(token);
      const identifier = payload[claimKey] ?? null;

      assert(
        typeof identifier === 'string',
        'An identifier claim must be resolved from access token',
      );

      return identifier;
    }
  } catch (err) {
    // safely catch all errors, we'll default a unique ID next
    // TODO: trace/log errors
    console.log(err);
  }

  return null;
}

function getDurableObject(
  ns: DurableObjectNamespace,
  id: Maybe<string>,
): DurableObject {
  return ns.get(Just(id) ? ns.idFromName(id) : ns.newUniqueId());
}

async function executeRateLimiter(
  rateLimiter: DurableObject,
  request: Readonly<Request>,
  identifier: Maybe<string>,
): Promise<Response> {
  return rateLimiter.fetch(doRequest(request, identifier));
}

function doRequest(
  request: Readonly<Request>,
  identifier: Maybe<string>,
): Request {
  const cloned = request.clone();

  cloned.headers.delete(RateLimiter.IDENTIFIER_HEADER);

  if (Just(identifier)) {
    cloned.headers.set(RateLimiter.IDENTIFIER_HEADER, identifier);
  }

  return cloned;
}

async function shouldApplyRateLimit(res: Response): Promise<boolean> {
  try {
    return (await res.text()) !== 'true';
  } catch (err) {
    return false;
  }
}
