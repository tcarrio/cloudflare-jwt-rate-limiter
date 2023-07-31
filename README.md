# cloudflare-jwt-rate-limiter

> Status: ⚠️ **Work In Progress**

## Prerequisites

[wrangler](https://developers.cloudflare.com/workers/cli-wrangler/install-update)@^2.0.0.

## Documentation

- [Durable Objects](https://developers.cloudflare.com/workers/learning/using-durable-objects)
- [TypeScript](https://www.typescriptlang.org/)
- [Jest](https://jest.io)
- [Rollup](https://rollupjs.org/)
- [Wrangler](https://developers.cloudflare.com/workers/wrangler/)

## Project Layout

The worker implementation is in `src/`. The Durable Object `RateLimiter` class is in `src/rate-limiter.ts`, and JWT parsing entrypoint script is in `src/index.ts`.

Rollup is configured to output a bundled ES Module to `dist/index.mjs`.

Unit tests are implemented in `src/index.test.ts`, which will run as part of `wrangler build`.  To run tests on their own use `yarn test`.

## Configuration

### Rate Limiting

The Worker applies rules based on a set of provided config rules. Each key of the top-level config refers to a claim value. When no claim value matches, the `%[default]` key will be evaluated. This must be set as a base64-encoded JSON in the environment to setup rate limiting rules per claim value like the following:

```json
{
    "basic": [
        {
            "timePeriod": 30000,
            "maximumRequests": 20
        },
        {
            "timePeriod": 3600000,
            "maximumRequests": 1000,
        }
    ],
    "premium": [
        {
            "timePeriod": 30000,
            "maximumRequests": 100
        },
        {
            "timePeriod": 3600000,
            "maximumRequests": 20000,
        }
    ],
    "enterprise": [
        {
            "timePeriod": 30000,
            "maximumRequests": 250
        },
        {
            "timePeriod": 3600000,
            "maximumRequests": 50000,
        }
    ],
    "%[default]": [
        {
            "timePeriod": 30000,
            "maximumRequests": 10
        },
        {
            "timePeriod": 3600000,
            "maximumRequests": 100,
        }
    ]
}
```

You can build the configuration string value from the command line using a JSON file, `jq`, and `base64`:

```bash
cat config.json | jq -r tostring | base64
```

### JWKS

> ⚠️ **Planned Feature**

It will be possible to configure a URL for JWKS. These utilize the eventually consistent Workers KV store to propagate public keys across Cloudflare datacenters. As such, most requests will not require a full JWKS lookup and instead have local datacenter values they can utilize instead. When this value becomes sufficiently old, the value will be updated and any updates to the JWKS propagated again.
