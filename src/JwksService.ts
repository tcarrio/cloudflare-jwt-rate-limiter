import { assert, assertEach } from './assertions';
import { JsonSerde } from './formats/json';
import { JsonWebKey, JsonWebKeySet } from './formats/jwks';
import { HttpClient } from './http';

export class JwksService {
  constructor(
    private readonly http: HttpClient,
    private readonly json: JsonSerde,
  ) {}

  async load(jwksUrl: string): Promise<JsonWebKeySet> {
    try {
      const res = await this.http.get({
        url: jwksUrl,
      });

      const dto = this.json.deserialize(await res.body());

      assert(Array.isArray(dto), 'JWKS must be an array');
      assertEach(
        dto,
        JwksService.isJsonWebKey,
        'JWKS entries must be valid JWKs',
      );

      return dto;
    } catch (err) {
      // default is an empty keyset
      return {
        keys: [],
      };
    }
  }

  private static isJsonWebKey(input: unknown): input is JsonWebKey {
    return (
      typeof input === 'object' &&
      Boolean(input) &&
      typeof (input as JsonWebKey)['kty'] === 'string'
    );
  }
}
