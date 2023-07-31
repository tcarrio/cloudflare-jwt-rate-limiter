import { isFound, nearestCeil } from '../arrays';
import type { Env } from '../env';
import { RateLimitRule } from './types';
import { InjectionKeys, di } from '../di';
import { RuleParser } from './RuleParser';

interface Context {
  now: number;
  startIndex: number;
  update: boolean;
}

interface ExecutionResult {
  isAllowed: boolean;
}

interface Access {
  /**
   * Epoch date, measured in milliseconds
   *
   * @example Date.now()
   */
  date: number;
}

export class RateLimiter {
  public static readonly STATUS_CODE = 429;
  public static readonly IDENTIFIER_HEADER = 'X-Rate-Limit-Identifier';

  private static readonly HISTORY_KEY = 'access_history';
  private static readonly DEFAULT_RULE_NAME = '%[default]';

  private state: DurableObjectState;
  private rules: RateLimitRule[];
  private accessHistory!: Array<Access>;

  /**
   * @param {DurableObjectState} state is the transactional state API
   * @see https://developers.cloudflare.com/workers/runtime-apis/durable-objects#transactional-storage-api
   *
   * @param {Env} env contains environment bindings for the Worker
   * @see https://developers.cloudflare.com/workers/configuration/environment-variables/
   *
   * @note Internal state is persisted in-memory and lives until the Worker is evicted,
   * which can happen at ANY time.
   */
  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.rules =
      typeof env.RATE_LIMIT_RULES === 'string'
        ? di()
            .get<RuleParser>(InjectionKeys.RuleParser)
            .parseEnvRules(env.RATE_LIMIT_RULES)
        : env.RATE_LIMIT_RULES;
  }

  async fetch(_request: Request) {
    if (!this.accessHistory) {
      this.accessHistory =
        (await this.state.storage?.get(RateLimiter.HISTORY_KEY)) || [];
    }

    // create a new context for the incoming request
    const ctx: Context = { now: Date.now(), update: true, startIndex: 0 };

    // permissive rules to start
    let allow = true;
    try {
      let executionResult: ExecutionResult;
      // if any rule results in denying access, we will block the disallow the request
      for (const rule of this.rules) {
        executionResult = this.processRule(rule, ctx);
        if (!executionResult.isAllowed) {
          allow = false;

          break;
        }
      }
    } catch (err) {
      // if some unexpected failure occurs, we default to allowing traffic
      allow = true;
    } finally {
      // we allow concurrent executions, but due to the gurantee that there is only a single
      // instance of a Durable Object per ID we can safely allow others to continue while
      // this persists the transactions. Other executions will rely on the internal state
      // of the Durable Object, not the transactional state, so even if those run they have
      // the latest in `this.accessHistory`
      await this.persist().catch();
    }

    return allow;
  }

  /**
   * Determines whether the current request exceeds the threshold of the rate limiting rule
   */
  private processRule(rule: RateLimitRule, ctx: Context): ExecutionResult {
    this.accessHistory.push({ date: ctx.now });

    const nearest = nearestCeil(
      this.accessHistory,
      /*                18:00     15:45       30m          */
      (item: Access) => ctx.now - item.date - rule.timePeriod,
      ctx.startIndex,
    );

    const startIndex = isFound(nearest)
      ? nearest.index
      : this.accessHistory.length;
    const totalRequestsInTimeframe = this.accessHistory.length - startIndex;

    if (ctx.update) {
      // we update the array in place so remove old requests outside the range of our ruleset
      this.accessHistory = this.accessHistory.slice(startIndex);

      // we only apply the update at most once: the first rule we run. this is because there
      // is no chance that any of the smaller windows need this data, so we can reduce our
      // search index considerably.
      ctx.update = false;
    }

    // if we updated, the new start is 0 since we've already sliced the access history array
    // otherwise it is the index of the nearest result of this run
    ctx.startIndex = ctx.update ? 0 : startIndex;

    return {
      isAllowed: rule.maximumRequests > totalRequestsInTimeframe,
    };
  }

  private async persist(): Promise<void> {
    await this.state.storage?.put(RateLimiter.HISTORY_KEY, this.accessHistory);
  }
}
