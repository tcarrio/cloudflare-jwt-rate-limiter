import { assert } from "../assertions";
import { Cls } from "../types";
import { DIContainer } from "./types";

const CTR_SYM = Symbol('__DI_SYM__');
const __DI: DIContainer = (() => new DI(CTR_SYM))();

export function di(): DIContainer {
    return __DI;
}

export class DI implements DIContainer {
    private readonly map: Map<string|symbol|Cls<unknown>, unknown> = new Map(); 

    constructor(sym: symbol) {
        assert(sym === CTR_SYM, 'Only the di function can construct a DI container');
    }

    get<T>(query: string|symbol|Cls<T>): T {
        const value = this.map.get(query);

        if (this.isCls(query) && !(value instanceof query)) {
            throw new Error('Non-matching instance type');
        }

        if (value) {
            return value as T;
        }

        throw new Error('No value found');
    }

    getOrDefault<T>(query: string|symbol|Cls<T>, def: T): T {
        try {
            return this.get(query);
        } catch (err) {
            return def;
        }
    }

    set<T>(key: string|symbol|Cls<T>, value: T): void {
        this.map.set(key, value);
    }

    private isCls(cls: unknown): cls is Cls<unknown> {
        return typeof cls?.constructor?.name === 'string';
    }
}
