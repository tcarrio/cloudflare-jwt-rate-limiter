export interface Base64Serializer {
    serialize(str: string): string;
}

export interface Base64Deserializer {
    deserialize(data: string): string;
}

export interface Base64Serde extends Base64Serializer, Base64Deserializer {}

export const BASE64 = Symbol.for('base64');