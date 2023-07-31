export interface RateLimitRule {
  /**
   * Amount of time to compare against, starting from now, measured in milliseconds
   */
  timePeriod: number;

  /**
   * An integer number of requests that cannot be exceeded
   */
  maximumRequests: number;
}
