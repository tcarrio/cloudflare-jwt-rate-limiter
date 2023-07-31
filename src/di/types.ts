import { Cls } from "../types";

export interface DIContainer {
    get<T>(query: string|symbol|Cls<T>): T;
    getOrDefault<T>(query: string|symbol|Cls<T>, def: T): T;
    set<T>(key: string|symbol|Cls<T>, value: T): void;
}