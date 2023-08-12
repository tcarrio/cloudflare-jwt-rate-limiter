import { EnumValue } from "../types";
import { HttpStatusCodes } from "./types";

type HttpStatusCode = EnumValue<typeof HttpStatusCodes>;

let statusCodes: Set<number>;

export function isValidStatus(status: number): status is HttpStatusCode {
    return (statusCodes ??= new Set(Object.values(HttpStatusCodes))).has(status);
}