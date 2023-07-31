export function assert(condition: unknown, message: string): void {
    if (!condition) {
        throw new Error(message);
    }
}

export function assertEach<T>(array: Array<T>, predicate: (value: T) => unknown, message: string): void {
    assert(Array.isArray(array), 'Input must be an array');
    array.forEach(predicate, message);
}

export function warn(condition: unknown, message: string): void {
    if (!condition) {
        console.log(message);
    }
}