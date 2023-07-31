import { Base64Serde } from '../formats/b64';
import { JsonSerde } from '../formats/json';
import { JwtSerde } from '../formats/jwt';
import { RuleParser } from '../rate-limiter/RuleParser';
import {di} from './di';
import { InjectionKeys } from './keys';

const b64: Base64Serde = {
    /**
     * @see btoa
     */
    serialize: btoa,

    /**
     * @see atob
     */
    deserialize: atob,
}

const json: JsonSerde = {
    /**
     * @see JSON.stringify
     */
    serialize: JSON.stringify,

    /**
     * @see JSON.parse
     */
    deserialize: JSON.parse,
}

const jwt: JwtSerde = new JwtSerde(b64, json);

const parser = new RuleParser(json, b64);

di().set(InjectionKeys.Base64, b64);
di().set(InjectionKeys.Json, json);
di().set(InjectionKeys.JwtSerde, jwt);
di().set(InjectionKeys.RuleParser, parser);