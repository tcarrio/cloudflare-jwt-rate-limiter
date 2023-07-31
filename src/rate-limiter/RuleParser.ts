import { assertEach } from "../assertions";
import { InjectionKeys, di } from "../di";
import { Base64Serde } from "../formats/b64";
import { JsonSerde } from "../formats/json";
import { RateLimitRule } from "./types";

export class RuleParser {
  private readonly json: JsonSerde;
  private readonly b64: Base64Serde;

  constructor(json?: JsonSerde, b64?: Base64Serde) {
    this.json = json ?? di().get<JsonSerde>(InjectionKeys.Json);
    this.b64 = b64 ?? di().get<Base64Serde>(InjectionKeys.Base64);
  }
  
  parseEnvRules(configStr: string): RateLimitRule[] {
    try {
      const config = this.json.deserialize(this.b64.deserialize(configStr));

      assertEach(
        config,
        RuleParser.isRule,
        'The entries of the config array must be valid rules',
      );

      const rules = config as RateLimitRule[];

      // OPTIMIZATION: sorting rules by largest to smallest time periods allows us
      // to apply more specific time periods in sequence, since all access history
      // is inserted in order. the _found_ index will note the lower bound of the
      // next rule window.
      return rules.sort((r1, r2) => r2.timePeriod - r1.timePeriod);
    } catch (err) {
      // something went really wrong here
      return [];
    }
  }

  private static isRule(input: unknown): input is RateLimitRule {
    return (
      input !== null &&
      typeof input === 'object' &&
      typeof (input as RateLimitRule).timePeriod === 'number' &&
      typeof (input as RateLimitRule).maximumRequests === 'number'
    );
  }
  
}
