export * from "./triplet.js";

import { Cursor } from "@hazae41/cursor";
import { Opaque } from "mods/triplets/opaque/opaque.js";

export interface DERable<T> {
  toDER(): T
}

export namespace DERable {

  export type From<T> = T extends DERable<infer U> ? U : never

  export type AllFrom<T extends readonly unknown[]> = {
    readonly [Index in keyof T]: From<T[Index]>
  }

}

export namespace DER {

  export function readOrThrow(cursor: Cursor) {
    return Opaque.DER.readOrThrow(cursor).resolveOrThrow()
  }

}