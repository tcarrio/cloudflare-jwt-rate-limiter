export interface JwkEc {
  kty: 'EC';
  crv: string;
  x: string;
  y: string;
  use: 'enc';
  kid: string;
}

export interface JwkRsa {
  kty: 'RSA';
  n: string;
  e: string;
  alg: string;
  kid: string;
}

export type JsonWebKey = JwkEc | JwkRsa;

export interface JsonWebKeySet {
  keys: Array<JsonWebKey>;
}
