import { Result } from "@hazae41/result";
import { Triplet } from "mods/triplets/triplet.js";

export interface Resolvable<ResolveError> {
  tryResolve(opaque: Unknown): Result<Triplet, ResolveError>
}