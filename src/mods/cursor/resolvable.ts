import { Result } from "@hazae41/result"
import { Triplet } from "mods/triplets/triplet.js"

export interface ASN1Resolvable<ResolveOutput = unknown, ResolveError = unknown> {
  tryResolve(triplet: Triplet): Result<ResolveOutput, ResolveError>
}

export namespace ASN1Resolvable {

  export type Infer<T extends ASN1Resolvable> = ASN1Resolvable<ResolveOutput<T>, ResolveError<T>>

  export type ResolveOutput<T extends ASN1Resolvable> = T extends ASN1Resolvable<infer ResolveOutput, unknown> ? ResolveOutput : never

  export type ResolveError<T extends ASN1Resolvable> = T extends ASN1Resolvable<unknown, infer ResolveError> ? ResolveError : never

}