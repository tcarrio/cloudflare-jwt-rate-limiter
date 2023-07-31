import { Base64Serde } from './b64';
import { JsonSerde } from './json';

export interface JsonWebToken {
  header: Record<string, string>;
  payload: Record<string, string>;
  signature: string;
}

export interface JwtSerializer {
  serialize(jwt: JsonWebToken): string;
}

export interface JwtDeserializer {
  deserialize(rawJwt: string): JsonWebToken;
}

export interface JwtSerde extends JwtSerializer, JwtDeserializer {}

export class JwtSerde implements JwtSerde {
  constructor(
    private readonly b64: Base64Serde,
    private readonly json: JsonSerde,
  ) {}

  serialize(jwt: JsonWebToken): string {
    return [
      this.json.serialize(jwt.header),
      this.json.serialize(jwt.payload),
      jwt.signature,
    ]
      .map(this.b64.serialize)
      .join('.');
  }

  deserialize(rawJwt: string): JsonWebToken {
    const [headerStr, payloadStr, signature] = rawJwt
      .split('.')
      .map(this.b64.deserialize);

    return {
      header: this.json.deserialize(headerStr),
      payload: this.json.deserialize(payloadStr),
      signature,
    };
  }
}
