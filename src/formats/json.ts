export interface JsonSerializer {
    serialize(content: any): string;
}

export interface JsonDeserializer {
    deserialize(data: string): any;
}

export interface JsonSerde extends JsonSerializer, JsonDeserializer {}

export const JSON = Symbol.for('JSON');