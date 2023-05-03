import { Result } from "@hazae41/result";
import { Opaque } from "mods/triplets/opaque/opaque.js";
import { Triplet } from "mods/triplets/triplet.js";

export interface Resolvable {
  tryResolve(opaque: Opaque): Result<Triplet, Error>
}